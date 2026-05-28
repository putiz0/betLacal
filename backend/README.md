# Bet Local Backend

Este backend protege a chave da API-Football e entrega jogos para o front-end.

## Rodar

```powershell
$env:API_FOOTBALL_KEY="sua-chave-da-api-football"
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Depois abra o front-end:

```text
http://localhost:8010/index.html
```

O front chama `http://localhost:8000/api/jogos`. Esse endpoint filtra jogos encerrados e libera apostas apenas para partidas ainda nao iniciadas (`NS`/`TBD`) no fuso `America/Sao_Paulo`.

Se nao houver mais jogos apostaveis hoje, o backend busca os proximos jogos. Se a API-Football falhar ou nao retornar jogos, o sistema usa o JSON local como fallback.
