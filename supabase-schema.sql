alter table public."Apostas"
add column if not exists codigo text,
add column if not exists data_iso timestamptz,
add column if not exists data text,
add column if not exists selections jsonb not null default '[]'::jsonb,
add column if not exists odd_total numeric(10, 2),
add column if not exists valor numeric(10, 2),
add column if not exists retorno numeric(10, 2),
add column if not exists status text not null default 'Aberta',
add column if not exists pagamento text not null default 'Pendente',
add column if not exists atualizado_em text;

update public."Apostas"
set
  codigo = coalesce(codigo, 'LEGADO-' || id::text),
  data_iso = coalesce(data_iso, created_at),
  data = coalesce(data, to_char(created_at, 'DD/MM/YYYY, HH24:MI:SS')),
  odd_total = coalesce(odd_total, 1),
  valor = coalesce(valor, 0),
  retorno = coalesce(retorno, 0),
  status = coalesce(status, 'Aberta'),
  pagamento = coalesce(pagamento, 'Pendente');

alter table public."Apostas"
alter column codigo set not null,
alter column data_iso set not null,
alter column odd_total set not null,
alter column valor set not null,
alter column retorno set not null;

create unique index if not exists apostas_codigo_unique_idx on public."Apostas" (codigo);
create index if not exists apostas_data_iso_idx on public."Apostas" (data_iso desc);

alter table public."Apostas" enable row level security;

drop policy if exists "betlocal_select_apostas" on public."Apostas";
drop policy if exists "betlocal_insert_apostas" on public."Apostas";
drop policy if exists "betlocal_update_apostas" on public."Apostas";

create policy "betlocal_select_apostas"
on public."Apostas"
for select
to anon
using (true);

create policy "betlocal_insert_apostas"
on public."Apostas"
for insert
to anon
with check (true);

create policy "betlocal_update_apostas"
on public."Apostas"
for update
to anon
using (true)
with check (true);
