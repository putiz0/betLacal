import os
import time
from datetime import date, datetime
from typing import Any
from zoneinfo import ZoneInfo

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"
API_FOOTBALL_KEY = (os.getenv("API_FOOTBALL_KEY") or "").strip()
DEFAULT_TIMEZONE = "America/Sao_Paulo"
PRE_MATCH_STATUSES = {"NS", "TBD"}
FINISHED_STATUSES = {"FT", "AET", "PEN"}
CANCELLED_STATUSES = {"PST", "CANC", "ABD", "SUSP", "INT", "AWD", "WO"}
ODD_REDUCTION_FACTOR = 0.8
MINIMUM_ODD = 1.01
CACHE_TTL_SECONDS = 15 * 60
API_CACHE: dict[tuple[str, tuple[tuple[str, str], ...]], dict[str, Any]] = {}

MARKET_TRANSLATIONS = {
    "Match Winner": "Resultado final",
    "Home/Away": "Casa ou fora",
    "Second Half Winner": "Vencedor do segundo tempo",
    "Asian Handicap": "Handicap asi\u00e1tico",
    "Handicap": "Handicap",
    "Goals Over/Under": "Total de gols",
    "Goals Over/Under First Half": "Total de gols no primeiro tempo",
    "Goals Over/Under - Second Half": "Total de gols no segundo tempo",
    "HT/FT Double": "Intervalo/final",
    "Both Teams Score": "Ambas marcam",
    "Handicap Result": "Resultado com handicap",
    "Exact Score": "Placar correto",
    "Correct Score - First Half": "Placar correto no primeiro tempo",
    "Correct Score - Second Half": "Placar correto no segundo tempo",
    "Double Chance": "Dupla chance",
    "First Half Winner": "Vencedor do primeiro tempo",
    "Team To Score First": "Time a marcar primeiro",
    "Team To Score Last": "Time a marcar por \u00faltimo",
    "Win Both Halves": "Vence os dois tempos",
    "Total - Home": "Total de gols do mandante",
    "Total - Away": "Total de gols do visitante",
    "Both Teams Score - First Half": "Ambas marcam no primeiro tempo",
    "Both Teams To Score - Second Half": "Ambas marcam no segundo tempo",
    "Odd/Even": "\u00cdmpar ou par",
    "Odd/Even - First Half": "\u00cdmpar ou par no primeiro tempo",
    "Odd/Even - Second Half": "\u00cdmpar ou par no segundo tempo",
    "Home Team Exact Goals Number": "Gols exatos do mandante",
    "Away Team Exact Goals Number": "Gols exatos do visitante",
    "Results/Both Teams Score": "Resultado e ambas marcam",
}

MARKET_DESCRIPTIONS = {
    "Resultado final": "Aposta no vencedor da partida ou no empate ao fim do tempo regulamentar.",
    "Casa ou fora": "Aposta apenas em mandante ou visitante, sem opcao de empate.",
    "Vencedor do primeiro tempo": "Vale somente o resultado dos primeiros 45 minutos.",
    "Vencedor do segundo tempo": "Vale somente o resultado do segundo tempo.",
    "Handicap asi\u00e1tico": "Uma vantagem ou desvantagem de gols e aplicada antes do resultado.",
    "Handicap": "Uma vantagem ou desvantagem de gols aplicada a um dos times antes do resultado.",
    "Resultado com handicap": "Resultado final considerando uma vantagem ou desvantagem aplicada a um time.",
    "Total de gols": "Aposta se a soma de gols da partida fica acima ou abaixo da linha indicada.",
    "Total de gols no primeiro tempo": "Aposta no total de gols apenas do primeiro tempo.",
    "Total de gols no segundo tempo": "Aposta no total de gols apenas do segundo tempo.",
    "Ambas marcam": "Aposta se os dois times fazem pelo menos um gol.",
    "Ambas marcam no primeiro tempo": "Aposta se os dois times marcam no primeiro tempo.",
    "Ambas marcam no segundo tempo": "Aposta se os dois times marcam no segundo tempo.",
    "Intervalo/final": "Combina o resultado do intervalo com o resultado final.",
    "Placar correto": "Aposta no placar exato da partida.",
    "Placar correto no primeiro tempo": "Aposta no placar exato ao fim do primeiro tempo.",
    "Placar correto no segundo tempo": "Aposta no placar exato apenas do segundo tempo.",
    "Dupla chance": "Aposta em duas possibilidades de resultado no mesmo mercado.",
    "Time a marcar primeiro": "Aposta em qual time fara o primeiro gol da partida.",
    "Time a marcar por \u00faltimo": "Aposta em qual time fara o ultimo gol da partida.",
    "Vence os dois tempos": "O time precisa vencer o primeiro e o segundo tempo separadamente.",
    "Total de gols do mandante": "Aposta no total de gols feitos pelo time mandante.",
    "Total de gols do visitante": "Aposta no total de gols feitos pelo time visitante.",
    "\u00cdmpar ou par": "Aposta se o total de gols sera impar ou par.",
    "\u00cdmpar ou par no primeiro tempo": "Aposta se o total de gols do primeiro tempo sera impar ou par.",
    "\u00cdmpar ou par no segundo tempo": "Aposta se o total de gols do segundo tempo sera impar ou par.",
    "Gols exatos do mandante": "Aposta quantos gols o mandante fara.",
    "Gols exatos do visitante": "Aposta quantos gols o visitante fara.",
    "Resultado e ambas marcam": "Combina o resultado final com sim ou nao para ambas marcam.",
    "Escanteios": "Aposta na quantidade de escanteios da partida.",
    "Cartoes": "Aposta na quantidade de cartoes da partida.",
    "Cart\u00f5es": "Aposta na quantidade de cartoes da partida.",
}

app = FastAPI(title="Bet Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8010",
        "http://127.0.0.1:8010",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):[0-9]+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def api_football_get(path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    if not API_FOOTBALL_KEY:
        raise HTTPException(status_code=500, detail="API_FOOTBALL_KEY nao configurada.")

    cache_params = tuple(sorted((str(key), str(value)) for key, value in (params or {}).items()))
    cache_key = (path, cache_params)
    cached = API_CACHE.get(cache_key)
    now = time.time()
    if cached and now - cached["created_at"] < CACHE_TTL_SECONDS:
        return cached["payload"]

    try:
        with httpx.Client(timeout=20, trust_env=False) as client:
            response = client.get(
                f"{API_FOOTBALL_BASE_URL}{path}",
                params=params or {},
                headers={"x-apisports-key": API_FOOTBALL_KEY},
            )
            response.raise_for_status()
            payload = response.json()
            API_CACHE[cache_key] = {"created_at": now, "payload": payload}
            return payload
    except httpx.HTTPStatusError as error:
        raise HTTPException(status_code=error.response.status_code, detail=error.response.text) from error
    except httpx.HTTPError as error:
        raise HTTPException(status_code=502, detail=f"Falha ao acessar API-Football: {error}") from error


def parse_fixture_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(ZoneInfo(DEFAULT_TIMEZONE))
    except ValueError:
        return None


def format_local_date(value: datetime | None) -> str:
    if value is None:
        return "Hoje"

    today = datetime.now(ZoneInfo(DEFAULT_TIMEZONE)).date()
    if value.date() == today:
        return "Hoje"
    if (value.date() - today).days == 1:
        return "Amanha"
    return value.strftime("%d/%m/%Y")


def is_fixture_bettable(fixture: dict[str, Any]) -> bool:
    fixture_info = fixture.get("fixture", {})
    status = fixture_info.get("status", {})
    short_status = status.get("short") or "NS"
    fixture_date = parse_fixture_datetime(fixture_info.get("date"))
    now = datetime.now(ZoneInfo(DEFAULT_TIMEZONE))

    if short_status not in PRE_MATCH_STATUSES:
        return False
    if fixture_date is None:
        return short_status == "TBD"
    return fixture_date >= now


def is_cancelled_status(short_status: str | None) -> bool:
    return (short_status or "").upper() in CANCELLED_STATUSES


def is_finished_status(short_status: str | None) -> bool:
    return (short_status or "").upper() in FINISHED_STATUSES


def decimal_odd(seed: int, base: float = 1.65) -> float:
    return round(base + ((seed * 37) % 145) / 100, 2)


def reduce_odd(odd: float) -> float:
    return max(MINIMUM_ODD, round(float(odd) * ODD_REDUCTION_FACTOR, 2))


def safe_float(value: Any) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def load_odds_by_date(value: date) -> dict[int, dict[str, Any]]:
    try:
        payload = api_football_get("/odds", {"date": value.isoformat()})
    except HTTPException:
        return {}

    odds_by_fixture: dict[int, dict[str, Any]] = {}
    for item in payload.get("response", []):
        fixture_id = item.get("fixture", {}).get("id")
        if fixture_id:
            odds_by_fixture[int(fixture_id)] = item
    return odds_by_fixture


def translate_odd_value(value: str, home: str, away: str) -> str:
    if value == "":
        return "0"
    if value.startswith("Over "):
        return value.replace("Over ", "Mais de ", 1)
    if value.startswith("Under "):
        return value.replace("Under ", "Menos de ", 1)
    if value.startswith("more "):
        return value.replace("more ", "Mais de ", 1)

    translations = {
        "Home": home,
        "Away": away,
        "Draw": "Empate",
        "Yes": "Sim",
        "No": "N\u00e3o",
        "Over": "Mais de",
        "Under": "Menos de",
        "Odd": "\u00cdmpar",
        "Even": "Par",
    }
    if value in translations:
        return translations[value]
    return (
        value
        .replace("Home", home)
        .replace("Away", away)
        .replace("Draw", "Empate")
        .replace("/Yes", "/Sim")
        .replace("/No", "/N\u00e3o")
    )


def translate_market_name(name: str) -> str:
    return MARKET_TRANSLATIONS.get(name, name)


def market_description(name: str) -> str:
    return MARKET_DESCRIPTIONS.get(name, "Mercado de aposta disponivel para este jogo.")


def decorate_market(name: str, options: list[dict[str, Any]]) -> dict[str, Any]:
    translated_name = translate_market_name(name)
    return {
        "nome": translated_name,
        "descricao": market_description(translated_name),
        "opcoes": options,
    }


def markets_from_api_odds(odds_event: dict[str, Any] | None, home: str, away: str) -> list[dict[str, Any]]:
    if not odds_event:
        return []

    bookmakers = odds_event.get("bookmakers") or []
    if not bookmakers:
        return []

    markets = []
    for bet in (bookmakers[0].get("bets") or []):
        options = []
        for item in bet.get("values") or []:
            odd = safe_float(item.get("odd"))
            if odd is None:
                continue
            options.append({
                "nome": translate_odd_value(str(item.get("value") or ""), home, away),
                "odd": reduce_odd(odd),
            })
        if options:
            markets.append(decorate_market(bet.get("name") or "Mercado", options))
    return markets


def extract_match_winner_odds(markets: list[dict[str, Any]], home: str, away: str, fixture_id: int) -> dict[str, float]:
    match_winner = next((market for market in markets if market.get("nome") == "Resultado final"), None)
    if not match_winner:
        return {
            "casa": reduce_odd(decimal_odd(fixture_id, 1.55)),
            "empate": reduce_odd(decimal_odd(fixture_id + 1, 2.75)),
            "fora": reduce_odd(decimal_odd(fixture_id + 2, 1.85)),
        }

    values = {option["nome"]: option["odd"] for option in match_winner.get("opcoes", [])}
    return {
        "casa": values.get(home, reduce_odd(decimal_odd(fixture_id, 1.55))),
        "empate": values.get("Empate", reduce_odd(decimal_odd(fixture_id + 1, 2.75))),
        "fora": values.get(away, reduce_odd(decimal_odd(fixture_id + 2, 1.85))),
    }


def build_demo_markets(home: str, away: str) -> list[dict[str, Any]]:
    markets = [
        decorate_market("Ambas marcam", [{"nome": "Sim", "odd": 1.82}, {"nome": "N\u00e3o", "odd": 1.92}]),
        decorate_market(
            "Total de gols",
            [
                {"nome": "Mais de 1.5", "odd": 1.38},
                {"nome": "Mais de 2.5", "odd": 1.95},
                {"nome": "Menos de 2.5", "odd": 1.78},
            ],
        ),
        decorate_market("Escanteios", [{"nome": "Mais de 8.5", "odd": 1.86}, {"nome": "Menos de 8.5", "odd": 1.86}]),
        decorate_market("Handicap", [{"nome": f"{home} -1", "odd": 2.65}, {"nome": f"{away} +1", "odd": 1.45}]),
        decorate_market("Cart\u00f5es", [{"nome": "Mais de 4.5", "odd": 1.82}, {"nome": "Menos de 4.5", "odd": 1.92}]),
        decorate_market("Placar correto", [{"nome": "1 x 0", "odd": 7.5}, {"nome": "1 x 1", "odd": 6.2}, {"nome": "2 x 1", "odd": 8.8}]),
    ]
    return apply_reduction_to_markets(markets)


def apply_reduction_to_markets(markets: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            **market,
            "opcoes": [
                {**option, "odd": reduce_odd(option["odd"])}
                for option in market.get("opcoes", [])
            ],
        }
        for market in markets
    ]


def map_fixture(fixture: dict[str, Any], odds_event: dict[str, Any] | None = None) -> dict[str, Any]:
    fixture_info = fixture.get("fixture", {})
    teams = fixture.get("teams", {})
    goals = fixture.get("goals", {})
    league = fixture.get("league", {})
    status = fixture_info.get("status", {})
    fixture_id = int(fixture_info.get("id") or 0)
    home_team = teams.get("home", {})
    away_team = teams.get("away", {})
    home = home_team.get("name") or "Mandante"
    away = away_team.get("name") or "Visitante"
    short_status = status.get("short") or "NS"
    long_status = status.get("long") or "Pré-jogo"
    fixture_date = parse_fixture_datetime(fixture_info.get("date"))
    score_home = goals.get("home")
    score_away = goals.get("away")
    allow_bet = is_fixture_bettable(fixture)
    api_markets = markets_from_api_odds(odds_event, home, away)
    markets = api_markets or build_demo_markets(home, away)
    odds_1x2 = extract_match_winner_odds(markets, home, away, fixture_id)

    return {
        "id": fixture_id,
        "time_casa": home,
        "time_fora": away,
        "logo_casa": home_team.get("logo"),
        "logo_fora": away_team.get("logo"),
        "campeonato": league.get("name") or "Campeonato",
        "data": format_local_date(fixture_date),
        "hora": fixture_date.strftime("%H:%M") if fixture_date else "A definir",
        "status": "Pré-jogo" if allow_bet else long_status,
        "status_api": short_status,
        "allow_aposta": allow_bet,
        "placar": f"{score_home} - {score_away}" if score_home is not None and score_away is not None else None,
        "odds_1x2": odds_1x2,
        "mercados": markets,
    }


def map_fixture_status(fixture: dict[str, Any]) -> dict[str, Any]:
    fixture_info = fixture.get("fixture", {})
    teams = fixture.get("teams", {})
    goals = fixture.get("goals", {})
    status = fixture_info.get("status", {})
    home_team = teams.get("home", {})
    away_team = teams.get("away", {})
    short_status = status.get("short") or "NS"

    return {
        "id": int(fixture_info.get("id") or 0),
        "time_casa": home_team.get("name") or "Mandante",
        "time_fora": away_team.get("name") or "Visitante",
        "gols_casa": goals.get("home"),
        "gols_fora": goals.get("away"),
        "status": status.get("long") or short_status,
        "status_api": short_status,
        "finalizado": is_finished_status(short_status),
        "cancelado": is_cancelled_status(short_status),
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/jogos")
def get_jogos(
    data: date = Query(default_factory=lambda: datetime.now(ZoneInfo(DEFAULT_TIMEZONE)).date()),
    league: int | None = None,
    season: int | None = None,
    live: bool = False,
) -> dict[str, Any]:
    params: dict[str, Any] = {"date": data.isoformat(), "timezone": DEFAULT_TIMEZONE}
    if league is not None:
        params["league"] = league
    if season is not None:
        params["season"] = season
    if live:
        params = {"live": "all", "timezone": DEFAULT_TIMEZONE}

    payload = api_football_get("/fixtures", params)
    fixtures = payload.get("response", [])
    bettable_fixtures = [fixture for fixture in fixtures if is_fixture_bettable(fixture)]
    odds_by_fixture = load_odds_by_date(data)

    if not bettable_fixtures and not live:
        next_params: dict[str, Any] = {"next": 30, "timezone": DEFAULT_TIMEZONE}
        if league is not None:
            next_params["league"] = league
        if season is not None:
            next_params["season"] = season
        next_payload = api_football_get("/fixtures", next_params)
        bettable_fixtures = [
            fixture for fixture in next_payload.get("response", [])
            if is_fixture_bettable(fixture)
        ]
        if bettable_fixtures:
            first_next_date = parse_fixture_datetime(bettable_fixtures[0].get("fixture", {}).get("date"))
            if first_next_date:
                odds_by_fixture = load_odds_by_date(first_next_date.date())

    return {
        "jogos": [
            map_fixture(
                fixture,
                odds_by_fixture.get(int(fixture.get("fixture", {}).get("id") or 0)),
            )
            for fixture in bettable_fixtures
        ]
    }


@app.get("/api/jogos/status")
def get_jogos_status(ids: str = Query(..., min_length=1)) -> dict[str, Any]:
    fixture_ids = [
        item.strip()
        for item in ids.replace(",", "-").split("-")
        if item.strip().isdigit()
    ]
    if not fixture_ids:
        raise HTTPException(status_code=400, detail="Informe ao menos um id de jogo valido.")

    payload = api_football_get("/fixtures", {"ids": "-".join(fixture_ids), "timezone": DEFAULT_TIMEZONE})
    statuses = [map_fixture_status(fixture) for fixture in payload.get("response", [])]

    return {
        "cache_segundos": CACHE_TTL_SECONDS,
        "jogos": statuses,
    }
