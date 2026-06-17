-- Bet Local SaaS/multi-cliente
-- Execute no SQL Editor do Supabase.
-- Depois, crie usuarios pelo Supabase Auth e cadastre o perfil em public.user_profiles.

create table if not exists public.clientes (
  id text primary key,
  nome text not null,
  email text not null,
  plano text not null default 'teste'
    check (plano in ('teste', 'padrao', 'personalizado')),
  status text not null default 'teste'
    check (status in ('teste', 'ativo', 'atrasado', 'suspenso', 'cancelado')),
  inicio date not null default current_date,
  vencimento date not null default (current_date + interval '30 days'),
  nome_sistema text,
  cor_primaria text default '#ff5a16',
  cor_fundo text default '#090b10',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cliente_id text references public.clientes(id) on delete cascade,
  role text not null default 'operador'
    check (role in ('super_admin', 'dono', 'operador')),
  nome text,
  created_at timestamptz not null default now()
);

alter table public."Apostas"
add column if not exists cliente_id text,
add column if not exists codigo text,
add column if not exists data_iso timestamptz,
add column if not exists data text,
add column if not exists selections jsonb not null default '[]'::jsonb,
add column if not exists odd_total numeric(10, 2),
add column if not exists valor numeric(10, 2),
add column if not exists retorno numeric(10, 2),
add column if not exists status text not null default 'Aberta',
add column if not exists pagamento text not null default 'Pendente',
add column if not exists settlement_note text,
add column if not exists atualizado_em text;

insert into public.clientes (id, nome, email, plano, status, nome_sistema)
values ('cliente-local', 'Bet Local', 'dono@betlocal.local', 'personalizado', 'teste', 'Bet Local')
on conflict (id) do nothing;

update public."Apostas"
set
  cliente_id = coalesce(cliente_id, 'cliente-local'),
  codigo = coalesce(codigo, 'LEGADO-' || id::text),
  data_iso = coalesce(data_iso, created_at),
  data = coalesce(data, to_char(created_at, 'DD/MM/YYYY, HH24:MI:SS')),
  odd_total = coalesce(odd_total, 1),
  valor = coalesce(valor, 0),
  retorno = coalesce(retorno, 0),
  status = coalesce(status, 'Aberta'),
  pagamento = coalesce(pagamento, 'Pendente');

alter table public."Apostas"
alter column cliente_id set not null,
alter column codigo set not null,
alter column data_iso set not null,
alter column odd_total set not null,
alter column valor set not null,
alter column retorno set not null;

create unique index if not exists apostas_codigo_unique_idx on public."Apostas" (codigo);
create index if not exists apostas_cliente_data_idx on public."Apostas" (cliente_id, data_iso desc);

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from public.user_profiles where user_id = auth.uid()
$$;

create or replace function public.current_user_cliente_id()
returns text
language sql
security definer
set search_path = public
as $$
  select cliente_id from public.user_profiles where user_id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'super_admin', false)
$$;

alter table public.clientes enable row level security;
alter table public.user_profiles enable row level security;
alter table public."Apostas" enable row level security;

drop policy if exists "clientes_select_isolado" on public.clientes;
drop policy if exists "clientes_super_admin_all" on public.clientes;
drop policy if exists "profiles_select_isolado" on public.user_profiles;
drop policy if exists "profiles_super_admin_all" on public.user_profiles;
drop policy if exists "apostas_select_isolado" on public."Apostas";
drop policy if exists "apostas_insert_isolado" on public."Apostas";
drop policy if exists "apostas_update_isolado" on public."Apostas";
drop policy if exists "betlocal_select_apostas" on public."Apostas";
drop policy if exists "betlocal_insert_apostas" on public."Apostas";
drop policy if exists "betlocal_update_apostas" on public."Apostas";

create policy "clientes_select_isolado"
on public.clientes
for select
to authenticated
using (id = public.current_user_cliente_id() or public.is_super_admin());

create policy "clientes_super_admin_all"
on public.clientes
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "profiles_select_isolado"
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid() or cliente_id = public.current_user_cliente_id() or public.is_super_admin());

create policy "profiles_super_admin_all"
on public.user_profiles
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "apostas_select_isolado"
on public."Apostas"
for select
to authenticated
using (cliente_id = public.current_user_cliente_id() or public.is_super_admin());

create policy "apostas_insert_isolado"
on public."Apostas"
for insert
to authenticated
with check (cliente_id = public.current_user_cliente_id() or public.is_super_admin());

create policy "apostas_update_isolado"
on public."Apostas"
for update
to authenticated
using (cliente_id = public.current_user_cliente_id() or public.is_super_admin())
with check (cliente_id = public.current_user_cliente_id() or public.is_super_admin());
