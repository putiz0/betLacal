# Seguranca - Bet Local

Este documento descreve o que foi corrigido e o **checklist de acoes externas que voce precisa executar**, pois as chaves abaixo estavam commitadas no historico do git e devem ser rotacionadas.

## Status das correcoes no codigo

| Item | Status |
|------|--------|
| Secrets hardcoded no frontend (`js/config.js`, `js/supabase.js`) | Corrigido - externalizado para `js/config.local.js` |
| 8 chaves da API-Football em `supabase/functions/api-football/keys.ts` | Corrigido - arquivo esvaziado; chaves via Supabase secret |
| Auth demo com senhas `123456` em texto puro | Corrigido - externalizado (ver secao Auth) |
| RLS sem policy de DELETE em `Apostas` | Corrigido - ver `sql/02-rls-hardening.sql` |
| XSS via `innerHTML` com dados dinamicos | Mitigado - escape/textContent |
| Backend Python duplicado | Marcado como deprecated |

---

## ACOES EXTERNAS OBRIGATORIAS (voce executa)

As chaves a seguir estavam no historico do git e **precisam ser rotacionadas/revogadas**, mesmo tendo sido removidas do codigo. Apenas remover do codigo NAO as invalida.

### 1. Rotacionar as chaves da API-Football (CRITICO)

As 8 chaves em `keys.ts` ( commits anteriores ) estao comprometidas.

1. Faca login em https://www.api-football.com (api-sports.io).
2. Para cada chave comprometida: **revogue/delete**.
3. Gere novas chaves conforme o plano.
4. Defina as novas como Supabase secret (uma unica vez por ambiente):
   ```powershell
   supabase secrets set API_FOOTBALL_KEYS=chavenova1,chavenova2,...
   supabase functions deploy api-football --no-verify-jwt
   ```
5. Teste a Edge Function: `https://SEU_PROJETO.supabase.co/functions/v1/api-football/health`

### 2. Revisar/rotacionar a chave do Supabase (CRITICO)

A `anon key` `sb_publishable_K6kMg8_...` estava no frontend. A `anon key` e publica por design e protegida por RLS, mas:

1. No painel do Supabase > Settings > API, confirme que apenas a `anon` (publishable) e exposta no frontend. **Nunca use a `service_role` no frontend.**
2. Se quiser invalidar a anon key atual: Settings > API > "Rotate anonymous key" (gera uma nova; atualize `js/config.local.js`).
3. Verifique que o RLS esta ativo em todas as tabelas (Apostas, clientes, user_profiles). Rode `sql/02-rls-hardening.sql`.

### 3. Reescrever o historico do git (RECOMENDADO)

Mesmo apos rotacionar as chaves, elas ficam no historico. Para remove-las:

1. Use `git filter-repo` ou BFG Repo-Cleaner para remover os arquivos/secrets do historico:
   ```bash
   # BFG (exemplo)
   bfg --replace-text passwords.txt
   git reflog expire --expire=now --all && git gc --prune=now --aggressive
   ```
2. Faca `git push --force` em todas as branches.
3. Avisar colaboradores para re-clonar o repositorio.
4. GitHub: Settings > Secrets scanning - ativar; e alertas de push protection.

> Rodei apenas as correcoes no codigo. A reescrita do historico e forca-push sao acoes destrutivas que so voce deve autorizar/executar.

---

## Auth demo (modo seguro)

O modo de demonstracao nao hardcodeia mais senhas `123456`. Para usar localmente sem Supabase Auth:

1. Em `js/config.local.js`, defina credenciais demo em `window.__BETLOCAL_DEMO_USERS__` (nao versionado).
2. O login em modo demo so ativa quando `window.__BETLOCAL_CONFIG__.gameMode === "demo"` **e** a config local existir. Caso contrario, exige Supabase Auth real.

## RLS

A migration `sql/02-rls-hardening.sql` adiciona a policy de DELETE ausente e revoga acesso publico. Execute no SQL Editor do Supabase.

## Reportar vulnerabilidade

Abra issue privada ou contate o mantenedor. Nao abra issue publico com detalhes de seguranca.
