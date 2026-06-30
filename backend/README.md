# Bet Local Backend (DEPRECATED)

> ⚠️ **DEPRECATED** — Este backend Python (FastAPI) está descontinuado.
>
> O backend canônico em produção é a **Edge Function do Supabase**
> (`supabase/functions/api-football/index.ts`), conforme o `vercel.json`
> e o workflow de CI (`.github/workflows/deploy.yml`), que fazem deploy
> apenas da Edge Function + frontend na Vercel.
>
> Este código Python **duplica** a lógica da Edge Function e **não recebe
> deploy**. Mantê-lo sincronizado gera drift e risco de divergência.
>
> - **Para desenvolvimento/produção**: use a Edge Function (TS).
> - **Este backend** só deve ser usado como referência histórica ou para
>   testes locais isolados. **Não há planos de mantê-lo atualizado.**
>
> Se quiser remover o drift definitivamente, considere excluir a pasta
> `backend/` em uma futura limpeza.

---

## Rodar (apenas para testes locais isolados)

```powershell
$env:API_FOOTBALL_KEY="sua-chave-da-api-football"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Depois abra o front-end:

```text
http://localhost:8010/index.html
```

O front chama `http://localhost:8000/api/jogos`. Esse endpoint filtra jogos encerrados e libera apostas apenas para partidas ainda nao iniciadas (`NS`/`TBD`) no fuso `America/Sao_Paulo`.

As chamadas da API-Football ficam em cache por 15 minutos para economizar sua cota diaria. O endpoint `http://localhost:8000/api/jogos/status?ids=ID1,ID2` consulta status/resultados para o painel administrativo conferir apostas abertas.

Se nao houver mais jogos apostaveis hoje, o backend busca os proximos jogos. Se a API-Football falhar ou nao retornar jogos, o sistema usa o JSON local como fallback.
