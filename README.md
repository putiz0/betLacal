# Bet Local

Sistema de apostas esportivas presenciais (balcao) para casas de apostas fisicas. Modelo SaaS multi-cliente.

## Stack

- **Frontend:** HTML/CSS/JS vanilla
- **Backend:** Python FastAPI + Supabase (PostgreSQL + Auth)
- **APIs de odds:** API-Football (8 chaves com rotacao), OpenLigaDB, scraper Playwright
- **Cache:** Memoria + KV (Deno KV) + cache de 30min na Edge Function

## Executar Localmente

### Frontend

```powershell
npx http-server . -p 8010 -c-1
```

Acesso: http://localhost:8010/index.html

### Backend Python

```powershell
$env:API_FOOTBALL_KEY="sua-chave"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

### Scraper

```powershell
node scrape-placar.js
```

### Testes

```powershell
npm test
```

## Deploy

- Frontend: Vercel (via `vercel --prod`)
- Edge Function: `supabase functions deploy api-football --no-verify-jwt`
- CI/CD: GitHub Actions (`.github/workflows/deploy.yml`)

## Configuracao

**Nunca coloque chaves/URLs no codigo.** Este projeto le secrets de fontes externas:

### Frontend (local)
Copie `js/config.template.js` para `js/config.local.js` (ja no `.gitignore`) e preencha Supabase URL, anon key e backendUrl. O `config.js` le automaticamente `window.__BETLOCAL_CONFIG__` definido por esse arquivo, ou do localStorage setado pelo painel admin.

### Edge Function (producao) - API-Football
Defina as chaves como Supabase Edge Function secret, nunca no codigo:

```powershell
supabase secrets set API_FOOTBALL_KEYS=chave1,chave2,chave3,chave4,chave5,chave6,chave7,chave8
supabase functions deploy api-football --no-verify-jwt
```

### Backend local (Python, deprecated)
Copie `.env.example` para `.env` e preencha as variaveis. Veja `SECURITY.md`.

## Seguranca

Leia `SECURITY.md` para o checklist de rotacao de chaves e boas praticas.

## Licenca

ISC
