import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { API_FOOTBALL_KEYS } from "./keys.ts";

// ============================================
// CONFIGURACAO - PROTECAO ANTI-DETECCAO
// ============================================

// Cache em memoria (Edge Function vive pouco, mas ajuda)
const MEM_CACHE = new Map<string, { payload: any; createdAt: number }>();
const MEM_CACHE_TTL = 30 * 60; // 30 minutos (era 15)

// Cache em KV (persistente entre chamadas)
const KV_NAMESPACE = "api-football-cache";

// Headers humanos para evitar deteccao de bot
const HUMAN_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept": "application/json",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://www.api-football.com/",
  "Origin": "https://www.api-football.com",
  "Connection": "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
};

// Delay minimo entre requisicoes (ms)
const MIN_REQUEST_DELAY = 2000; // 2 segundos
let lastRequestTime = 0;

// API Keys (rotacao fallback)
// Usa secrets do Supabase primeiro, fallback para keys.ts
function loadApiKeys(): string[] {
  const envKeys = Deno.env.get("API_FOOTBALL_KEYS");
  if (envKeys) {
    return envKeys.split(",").map(k => k.trim()).filter(Boolean);
  }
  const singleKey = Deno.env.get("API_FOOTBALL_KEY");
  if (singleKey) {
    return [singleKey];
  }
  return API_FOOTBALL_KEYS;
}

const API_FOOTBALL_URL = "https://v3.football.api-sports.io";
const DEFAULT_TIMEZONE = "America/Sao_Paulo";

const PRE_MATCH_STATUSES = new Set(["NS", "TBD"]);
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN"]);
const CANCELLED_STATUSES = new Set(["PST", "CANC", "ABD", "SUSP", "INT", "AWD", "WO"]);
const ODD_REDUCTION_FACTOR = 0.8;
const MINIMUM_ODD = 1.01;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// CACHE PERSISTENTE (KV)
// ============================================

async function getFromKV(key: string): Promise<any | null> {
  try {
    const kv = await Deno.openKv();
    const result = await kv.get([KV_NAMESPACE, key]);
    await kv.close();
    if (!result.value) return null;
    const entry = result.value as { payload: any; createdAt: number };
    const now = Date.now() / 1000;
    if (now - entry.createdAt > MEM_CACHE_TTL) return null;
    return entry.payload;
  } catch {
    return null;
  }
}

async function setToKV(key: string, payload: any): Promise<void> {
  try {
    const kv = await Deno.openKv();
    await kv.set([KV_NAMESPACE, key], { payload, createdAt: Date.now() / 1000 });
    await kv.close();
  } catch {
    // KV pode nao estar disponivel, ignora
  }
}

// ============================================
// RATE LIMITING & DELAY
// ============================================

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_DELAY) {
    const delay = MIN_REQUEST_DELAY - timeSinceLast + Math.random() * 1000; // Jitter de 0-1s
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  lastRequestTime = Date.now();
}

// ============================================
// CHAMADA API-FOOTBALL COM PROTECAO
// ============================================

async function apiFootballGet(path: string, params?: Record<string, string>): Promise<any> {
  const cacheKey = JSON.stringify({ path, params });

  // 1. Tenta cache em memoria
  const memCached = MEM_CACHE.get(cacheKey);
  const now = Date.now() / 1000;
  if (memCached && now - memCached.createdAt < MEM_CACHE_TTL) {
    return memCached.payload;
  }

  // 2. Tenta cache persistente (KV)
  const kvCached = await getFromKV(cacheKey);
  if (kvCached) {
    MEM_CACHE.set(cacheKey, { payload: kvCached, createdAt: now });
    return kvCached;
  }

  // 3. Rate limiting
  await enforceRateLimit();

  // 4. Chamar API-Football
  const url = new URL(`${API_FOOTBALL_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const keys = loadApiKeys();
  let lastError: Error | null = null;
  for (const apiKey of keys) {
    try {
      const response = await fetch(url.toString(), {
        headers: {
          ...HUMAN_HEADERS,
          "x-apisports-key": apiKey,
        },
      });

      if (response.status === 403 || response.status === 429) {
        // Conta suspensa ou rate limit - tenta proxima chave
        lastError = new Error(`API key blocked (${response.status})`);
        continue;
      }

      if (!response.ok) {
        throw new Error(`API-Football error: ${response.status}`);
      }

      const payload = await response.json();

      // Salva em ambos os caches
      MEM_CACHE.set(cacheKey, { payload, createdAt: now });
      await setToKV(cacheKey, payload);

      return payload;
    } catch (error) {
      lastError = error as Error;
    }
  }

  // Se todas as chaves falharam, lanca o ultimo erro
  throw lastError || new Error("All API keys failed");
}

// ============================================
// UTILIDADES DE MAPEAMENTO
// ============================================

function parseFixtureDatetime(value: string | null): Date | null {
  if (!value) return null;
  try {
    return new Date(value.replace("Z", "+00:00"));
  } catch {
    return null;
  }
}

function formatLocalDate(value: Date | null): string {
  if (!value) return "Hoje";
  const today = new Date();
  const dateStr = value.toISOString().slice(0, 10);
  const todayStr = today.toISOString().slice(0, 10);
  if (dateStr === todayStr) return "Hoje";
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Amanha";
  return value.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isFixtureBettable(fixture: any): boolean {
  const status = fixture.fixture?.status?.short || "NS";
  const date = parseFixtureDatetime(fixture.fixture?.date);
  const now = new Date();
  if (!PRE_MATCH_STATUSES.has(status)) return false;
  if (!date) return status === "TBD";
  return date >= now;
}

function decimalOdd(seed: number, base = 1.65): number {
  return Math.round((base + ((seed * 37) % 145) / 100) * 100) / 100;
}

function reduceOdd(odd: number): number {
  return Math.max(MINIMUM_ODD, Math.round(odd * ODD_REDUCTION_FACTOR * 100) / 100);
}

function translateOddValue(value: string, home: string, away: string): string {
  if (value === "") return "0";
  if (value.startsWith("Over ")) return value.replace("Over ", "Mais de ", 1);
  if (value.startsWith("Under ")) return value.replace("Under ", "Menos de ", 1);
  const translations: Record<string, string> = {
    "Home": home, "Away": away, "Draw": "Empate", "Yes": "Sim", "No": "Nao",
    "Over": "Mais de", "Under": "Menos de", "Odd": "Impar", "Even": "Par",
  };
  return translations[value] || value
    .replace("Home", home)
    .replace("Away", away)
    .replace("Draw", "Empate")
    .replace("/Yes", "/Sim")
    .replace("/No", "/Nao");
}

const MARKET_TRANSLATIONS: Record<string, string> = {
  "Match Winner": "Resultado final",
  "Both Teams Score": "Ambas marcam",
  "Goals Over/Under": "Total de gols",
  "Exact Score": "Placar correto",
  "Double Chance": "Dupla chance",
  "Asian Handicap": "Handicap asiatico",
  "Handicap": "Handicap",
  "Odd/Even": "Impar ou par",
  "First Half Winner": "Vencedor do primeiro tempo",
  "Second Half Winner": "Vencedor do segundo tempo",
  "HT/FT Double": "Intervalo/final",
  "Home Team Exact Goals Number": "Gols exatos do mandante",
  "Away Team Exact Goals Number": "Gols exatos do visitante",
};

function translateMarketName(name: string): string {
  return MARKET_TRANSLATIONS[name] || name;
}

function decorateMarket(name: string, options: any[]): any {
  return {
    nome: translateMarketName(name),
    descricao: "Mercado de aposta disponivel para este jogo.",
    opcoes: options,
  };
}

function marketsFromApiOdds(oddsEvent: any | null, home: string, away: string): any[] {
  if (!oddsEvent) return [];
  const bookmakers = oddsEvent.bookmakers || [];
  if (!bookmakers.length) return [];

  const markets: any[] = [];
  for (const bet of bookmakers[0].bets || []) {
    const options: any[] = [];
    for (const item of bet.values || []) {
      const odd = parseFloat(item.odd);
      if (isNaN(odd)) continue;
      options.push({
        nome: translateOddValue(String(item.value || ""), home, away),
        odd: reduceOdd(odd),
      });
    }
    if (options.length) {
      markets.push(decorateMarket(bet.name || "Mercado", options));
    }
  }
  return markets;
}

function extractMatchWinnerOdds(markets: any[], home: string, away: string, fixtureId: number): any {
  const matchWinner = markets.find((m) => m.nome === "Resultado final");
  if (!matchWinner) {
    return {
      casa: reduceOdd(decimalOdd(fixtureId, 1.55)),
      empate: reduceOdd(decimalOdd(fixtureId + 1, 2.75)),
      fora: reduceOdd(decimalOdd(fixtureId + 2, 1.85)),
    };
  }
  const values: Record<string, number> = {};
  for (const opt of matchWinner.opcoes || []) {
    values[opt.nome] = opt.odd;
  }
  return {
    casa: values[home] || reduceOdd(decimalOdd(fixtureId, 1.55)),
    empate: values["Empate"] || reduceOdd(decimalOdd(fixtureId + 1, 2.75)),
    fora: values[away] || reduceOdd(decimalOdd(fixtureId + 2, 1.85)),
  };
}

function buildDemoMarkets(home: string, away: string): any[] {
  return [
    decorateMarket("Ambas marcam", [{ nome: "Sim", odd: 1.82 }, { nome: "Nao", odd: 1.92 }]),
    decorateMarket("Total de gols", [
      { nome: "Mais de 1.5", odd: 1.38 },
      { nome: "Mais de 2.5", odd: 1.95 },
      { nome: "Menos de 2.5", odd: 1.78 },
    ]),
    decorateMarket("Escanteios", [{ nome: "Mais de 8.5", odd: 1.86 }, { nome: "Menos de 8.5", odd: 1.86 }]),
    decorateMarket("Handicap", [{ nome: `${home} -1`, odd: 2.65 }, { nome: `${away} +1`, odd: 1.45 }]),
    decorateMarket("Cartoes", [{ nome: "Mais de 4.5", odd: 1.82 }, { nome: "Menos de 4.5", odd: 1.92 }]),
    decorateMarket("Placar correto", [{ nome: "1 x 0", odd: 7.5 }, { nome: "1 x 1", odd: 6.2 }, { nome: "2 x 1", odd: 8.8 }]),
  ];
}

function mapFixture(fixture: any, oddsEvent: any | null = null): any {
  const fixtureInfo = fixture.fixture || {};
  const teams = fixture.teams || {};
  const goals = fixture.goals || {};
  const league = fixture.league || {};
  const status = fixtureInfo.status || {};
  const fixtureId = fixtureInfo.id || 0;
  const homeTeam = teams.home || {};
  const awayTeam = teams.away || {};
  const home = homeTeam.name || "Mandante";
  const away = awayTeam.name || "Visitante";
  const shortStatus = status.short || "NS";
  const longStatus = status.long || "Pre-jogo";
  const fixtureDate = parseFixtureDatetime(fixtureInfo.date);
  const scoreHome = goals.home;
  const scoreAway = goals.away;
  const allowBet = isFixtureBettable(fixture);
  const apiMarkets = marketsFromApiOdds(oddsEvent, home, away);
  const markets = apiMarkets.length ? apiMarkets : buildDemoMarkets(home, away);
  const odds1x2 = extractMatchWinnerOdds(markets, home, away, fixtureId);

  return {
    id: fixtureId,
    time_casa: home,
    time_fora: away,
    logo_casa: homeTeam.logo || null,
    logo_fora: awayTeam.logo || null,
    campeonato: league.name || "Campeonato",
    data: formatLocalDate(fixtureDate),
    hora: fixtureDate
      ? fixtureDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: DEFAULT_TIMEZONE })
      : "A definir",
    status: allowBet ? "Pre-jogo" : longStatus,
    status_api: shortStatus,
    allow_aposta: allowBet,
    placar: scoreHome !== null && scoreAway !== null ? `${scoreHome} - ${scoreAway}` : null,
    odds_1x2: odds1x2,
    mercados: markets,
  };
}

function mapFixtureStatus(fixture: any): any {
  const fixtureInfo = fixture.fixture || {};
  const teams = fixture.teams || {};
  const goals = fixture.goals || {};
  const status = fixtureInfo.status || {};
  const shortStatus = status.short || "NS";

  return {
    id: fixtureInfo.id || 0,
    time_casa: teams.home?.name || "Mandante",
    time_fora: teams.away?.name || "Visitante",
    gols_casa: goals.home,
    gols_fora: goals.away,
    status: status.long || shortStatus,
    status_api: shortStatus,
    finalizado: FINISHED_STATUSES.has(shortStatus),
    cancelado: CANCELLED_STATUSES.has(shortStatus),
  };
}

async function loadOddsByDate(dataStr: string): Promise<Record<number, any>> {
  try {
    const payload = await apiFootballGet("/odds", { date: dataStr });
    const oddsByFixture: Record<number, any> = {};
    for (const item of payload.response || []) {
      const fixtureId = item.fixture?.id;
      if (fixtureId) oddsByFixture[fixtureId] = item;
    }
    return oddsByFixture;
  } catch {
    return {};
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    // ROTA /api/jogos
    if (path.endsWith("/jogos") || path.endsWith("/api/jogos")) {
      const params = url.searchParams;
      const date = params.get("date") || new Date().toISOString().slice(0, 10);
      const league = params.get("league");
      const season = params.get("season");
      const live = params.get("live") === "true" || params.get("live") === "1";

      const apiParams: Record<string, string> = { date, timezone: DEFAULT_TIMEZONE };
      if (league) apiParams.league = league;
      if (season) apiParams.season = season;
      if (live) {
        delete apiParams.date;
        apiParams.live = "all";
        apiParams.timezone = DEFAULT_TIMEZONE;
      }

      let payload: any;
      let apiError: string | null = null;

      try {
        payload = await apiFootballGet("/fixtures", apiParams);
      } catch (error) {
        apiError = (error as Error).message;
        // Se API falhou, retorna dados demo com aviso
        return new Response(
          JSON.stringify({
            jogos: [],
            api_error: apiError,
            fallback: "demo",
            message: "API-Football indisponivel. Usando dados de demonstracao."
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const allFixtures = payload.response || [];
      const bettableFixtures = allFixtures.filter(isFixtureBettable);
      let liveFixtures = allFixtures.filter((f) => {
        const s = f.fixture?.status?.short || "";
        return !PRE_MATCH_STATUSES.has(s) && !FINISHED_STATUSES.has(s) && !CANCELLED_STATUSES.has(s);
      });
      let oddsByFixture: Record<number, any> = {};

      if (bettableFixtures.length) {
        try {
          oddsByFixture = await loadOddsByDate(date);
        } catch {
          // Odds falhou, usa demo
        }
      }

      if (!bettableFixtures.length && !live) {
        const nextParams: Record<string, string> = { next: "30", timezone: DEFAULT_TIMEZONE };
        if (league) nextParams.league = league;
        if (season) nextParams.season = season;
        try {
          const nextPayload = await apiFootballGet("/fixtures", nextParams);
          const nextFixtures = (nextPayload.response || []).filter(isFixtureBettable);
          if (nextFixtures.length) {
            bettableFixtures.push(...nextFixtures);
            const firstDate = parseFixtureDatetime(nextFixtures[0].fixture?.date);
            if (firstDate) {
              oddsByFixture = await loadOddsByDate(firstDate.toISOString().slice(0, 10));
            }
          }
        } catch {
          // next falhou, continua com vazio
        }
      }

      const bettableJogos = bettableFixtures.map((f) => mapFixture(f, oddsByFixture[f.fixture?.id]));
      const liveJogos = liveFixtures.map((f) => {
        const mapped = mapFixture(f, null);
        mapped.status = "Ao vivo";
        mapped.allow_aposta = false;
        return mapped;
      });
      const jogos = [...bettableJogos, ...liveJogos];

      return new Response(
        JSON.stringify({ jogos, api_error: apiError, source: apiError ? "demo" : "api" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ROTA /api/jogos/status
    if (path.endsWith("/status")) {
      const ids = url.searchParams.get("ids") || "";
      const fixtureIds = ids
        .split(/[,\-]/)
        .map((s) => s.trim())
        .filter((s) => /^\d+$/.test(s));

      if (!fixtureIds.length) {
        return new Response(
          JSON.stringify({ error: "Informe ao menos um id de jogo valido." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      let payload: any;
      try {
        payload = await apiFootballGet("/fixtures", {
          ids: fixtureIds.join("-"),
          timezone: DEFAULT_TIMEZONE,
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: (error as Error).message, jogos: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      const statuses = (payload.response || []).map(mapFixtureStatus);

      return new Response(
        JSON.stringify({ cache_segundos: MEM_CACHE_TTL, jogos: statuses }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ROTA /health
    if (path.endsWith("/health")) {
      return new Response(JSON.stringify({ status: "ok", protections: "active" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Proxy generico
    const apiPath = path.replace(/.*\/api-football/, "");
    const apiParams: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (apiParams[k] = v));

    let payload: any;
    try {
      payload = await apiFootballGet(apiPath || "/fixtures", apiParams);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: (error as Error).message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
