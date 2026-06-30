-- ============================================
-- Bet Local - Hardening de RLS (Row Level Security)
-- ============================================
-- Corrige a policy de DELETE ausente na tabela "Apostas" e revoga
-- privilegios publicos. Execute no SQL Editor do Supabase.
-- Requisito: supabase-schema.sql ja aplicado.
-- Idempotente (pode ser re-executado).

-- ============================================
-- 1. Revogar acesso publico (anon/unauthenticated)
-- ============================================
-- Por padrao, o Supabase da GRANT para as roles anon e authenticated.
-- Como toda logica passa por RLS, mantemos apenas authenticated.
revoke all on public."Apostas" from anon;
revoke all on public.clientes from anon;
revoke all on public.user_profiles from anon;
revoke all on public.team_logos from anon;

-- Apenas leitura/escrita para authenticated via RLS
grant select, insert, update, delete on public."Apostas" to authenticated;
grant select, insert, update, delete on public.clientes to authenticated;
grant select, insert, update, delete on public.user_profiles to authenticated;
grant select, insert, update, delete on public.team_logos to authenticated;

-- ============================================
-- 2. DELETE policy faltante em "Apostas"
-- ============================================
-- Antes so existiam select/insert/update. Um usuario autenticado poderia
-- burlar via SDK? Nao (RLS bloqueia delete sem policy) -> fica DENY ALL
-- por padrao. Aqui liberamos delete apenas ao dono do cliente ou super_admin.
drop policy if exists "apostas_delete_isolado" on public."Apostas";

create policy "apostas_delete_isolado"
on public."Apostas"
for delete
to authenticated
using (cliente_id = public.current_user_cliente_id() or public.is_super_admin());

-- ============================================
-- 3. DELETE policy em "clientes" (apenas super_admin)
-- ============================================
-- A policy "clientes_super_admin_all" (for all) ja cobre delete para
-- super_admin. Reforcamos removendo qualquer chance de o dono do cliente
-- deletar o proprio registro por engano via SDK: deixamos apenas super_admin.
-- (A policy "for all" existente ja restringe com is_super_admin(), entao
-- mantemos. Esta instrucao e defensiva/documental.)

-- ============================================
-- 4. team_logos: ativar RLS e isolar por (nao ha cliente_id na tabela)
-- ============================================
-- team_logos e global (logos de times, nao por cliente). Como e dado
-- publico de times, liberamos leitura para todos e escrita so para super_admin.
alter table public.team_logos enable row level security;

drop policy if exists "team_logos_select_all" on public.team_logos;
drop policy if exists "team_logos_super_admin_all" on public.team_logos;

create policy "team_logos_select_all"
on public.team_logos
for select
to authenticated
using (true);

create policy "team_logos_super_admin_all"
on public.team_logos
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- ============================================
-- 5. Verificacao
-- ============================================
-- (Informativo) Lista as policies por tabela apos aplicar:
-- select tablename, policyname, cmd, roles::text, qual
-- from pg_policies where schemaname = 'public'
-- order by tablename, policyname;
