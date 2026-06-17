// ============================================================
// CONFIGURACAO DE APIs - FALLBACK EM CASCATA
// ============================================================

const API_CONFIG = {
  // APIs da API-Football (v3.api-sports.io)
  // Testadas nesta ordem - primeira que funcionar é usada
  apis: [
    {
      name: "API-Football Nova 1",
      key: "d096e762ddd15d82d9135366e65d6de050a8b8676d7549af6c83227887d17ae9",
      endpoint: "https://v3.football.api-sports.io",
      type: "api-football"
    },
    {
      name: "API-Football Nova 2",
      key: "425257ac2bf87e2552ba95c5509693af",
      endpoint: "https://v3.football.api-sports.io",
      type: "api-football"
    },
    {
      name: "API-Football Nova 3 (UUID)",
      key: "fe80bd94-093e-4e97-8b6e-ccd2a07e3514",
      endpoint: "https://v3.football.api-sports.io",
      type: "api-football"
    },
    {
      name: "API-Football Atual",
      key: "6512896b81baf1e82ea25425879bbc60",
      endpoint: "https://v3.football.api-sports.io",
      type: "api-football"
    }
  ],
  
  // Fallback: Supabase Edge Function (atual)
  fallback: {
    name: "Supabase Edge Function",
    url: "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos",
    type: "supabase"
  }
};

// ============================================================
// TRADUCOES API-FOOTBALL -> APP
// ============================================================

const MARKET_TRANSLATIONS = {
  "Match Winner": "Resultado final",
  "Home/Away": "Casa ou fora",
  "Asian Handicap": "Handicap asiatico",
  "Handicap": "Handicap",
  "Goals Over/Under": "Total de gols",
  "Both Teams Score": "Ambas marcam",
  "Exact Score": "Placar correto",
  "Double Chance": "Dupla chance",
  "First Half Winner": "Vencedor do primeiro tempo",
  "Team To Score First": "Time a marcar primeiro",
  "Odd/Even": "Impar ou par",
};

const MARKET_DESCRIPTIONS = {
  "Resultado final": "Aposta no vencedor da partida ou no empate.",
  "Casa ou fora": "Aposta apenas em mandante ou visitante, sem empate.",
  "Handicap asiatico": "Vantagem ou desvantagem de gols aplicada antes do resultado.",
  "Total de gols": "Aposta se a soma de gols fica acima ou abaixo da linha.",
  "Ambas marcam": "Aposta se os dois times fazem pelo menos um gol.",
  "Placar correto": "Aposta no placar exato da partida.",
  "Dupla chance": "Aposta em duas possibilidades de resultado.",
};

// ============================================================
// FUNCOES DE UTILIDADE
// ============================================================

function translateMarketName(name) {
  return MARKET_TRANSLATIONS[name] || name;
}

function marketDescription(name) {
  return MARKET_DESCRIPTIONS[name] || "Mercado de aposta disponivel.";
}

function parseFixtureDate(dateStr) {
  if (!dateStr) return { data: "Hoje", hora: "A definir" };
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const matchDate = new Date(date);
  matchDate.setHours(0, 0, 0, 0);
  
  let dataStr = "Hoje";
  if (matchDate.getTime() === today.getTime()) {
    dataStr = "Hoje";
  } else if ((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) === 1) {
    dataStr = "Amanha";
  } else {
    dataStr = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }
  
  const hora = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  
  return { data: dataStr, hora };
}

function translateOddValue(value, home, away) {
  const translations = {
    "Home": home,
    "Away": away,
    "Draw": "Empate",
    "Yes": "Sim",
    "No": "Nao",
    "Over": "Mais de",
    "Under": "Menos de",
    "Odd": "Impar",
    "Even": "Par"
  };
  
  if (translations[value]) return translations[value];
  
  return value
    .replace("Home", home)
    .replace("Away", away)
    .replace("Draw", "Empate")
    .replace("/Yes", "/Sim")
    .replace("/No", "/Nao");
}

function reduceOdd(odd, factor = 0.85) {
  return Math.max(1.01, Math.round(odd * factor * 100) / 100);
}

// ============================================================
// TRANSFORMAR DADOS DA API-FOOTBALL
// ============================================================

function transformApiFootballFixtures(fixtures, oddsData = {}) {
  const now = new Date();
  const brazilTz = "America/Sao_Paulo";
  
  return fixtures.map(fixture => {
    const fixtureInfo = fixture.fixture || {};
    const teams = fixture.teams || {};
    const goals = fixture.goals || {};
    const league = fixture.league || {};
    const status = fixtureInfo.status || {};
    
    const fixtureId = fixtureInfo.id;
    const home = teams.home?.name || "Mandante";
    const away = teams.away?.name || "Visitante";
    
    const shortStatus = status.short || "NS";
    const fixtureDate = fixtureInfo.date ? new Date(fixtureInfo.date) : null;
    
    // Verificar se pode apostar (pre-jogo e data futura)
    const isFuture = fixtureDate && fixtureDate > now;
    const allowBet = shortStatus === "NS" && isFuture;
    
    const { data, hora } = parseFixtureDate(fixtureInfo.date);
    
    // Processar odds se disponivel
    let odds_1x2 = { casa: 2.0, empate: 3.0, fora: 3.5 };
    let mercados = [];
    
    const fixtureOdds = oddsData[fixtureId];
    if (fixtureOdds?.bookmakers?.[0]?.bets) {
      const bets = fixtureOdds.bookmakers[0].bets;
      
      // Extrair 1X2
      const matchWinner = bets.find(b => b.name === "Match Winner");
      if (matchWinner?.values) {
        const values = matchWinner.values;
        odds_1x2 = {
          casa: reduceOdd(parseFloat(values.find(v => v.value === "Home")?.odd || 2.0)),
          empate: reduceOdd(parseFloat(values.find(v => v.value === "Draw")?.odd || 3.0)),
          fora: reduceOdd(parseFloat(values.find(v => v.value === "Away")?.odd || 3.5))
        };
      }
      
      // Processar outros mercados
      markets.forEach(bet => {
        if (bet.name === "Match Winner") return; // Ja foi
        
        const options = bet.values.map(v => ({
          nome: translateOddValue(v.value, home, away),
          odd: reduceOdd(parseFloat(v.odd))
        }));
        
        if (options.length > 0) {
          const translatedName = translateMarketName(bet.name);
          mercados.push({
            nome: translatedName,
            descricao: marketDescription(translatedName),
            opcoes: options
          });
        }
      });
    }
    
    // Se nao tem mercados, adicionar alguns basicos
    if (mercados.length === 0) {
      mercados = [
        {
          nome: "Resultado Final",
          descricao: "Aposta no vencedor da partida ou no empate.",
          opcoes: [
            { nome: home, odd: odds_1x2.casa },
            { nome: "Empate", odd: odds_1x2.empate },
            { nome: away, odd: odds_1x2.fora }
          ]
        },
        {
          nome: "Ambas marcam",
          descricao: "Aposta se os dois times fazem pelo menos um gol.",
          opcoes: [
            { nome: "Sim", odd: 1.7 },
            { nome: "Nao", odd: 2.0 }
          ]
        },
        {
          nome: "Total de gols",
          descricao: "Aposta se a soma de gols fica acima ou abaixo da linha.",
          opcoes: [
            { nome: "Mais de 2.5", odd: 1.9 },
            { nome: "Menos de 2.5", odd: 1.85 }
          ]
        }
      ];
    }
    
    // Status formatado
    let statusText = "Pre-jogo";
    if (shortStatus === "FT") statusText = "Encerrado";
    else if (shortStatus === "1H" || shortStatus === "2H" || shortStatus === "HT") statusText = "Ao vivo";
    else if (shortStatus === "PST" || shortStatus === "CANC") statusText = "Cancelado";
    else if (shortStatus === "NS" && !isFuture) statusText = "A definir";
    
    return {
      id: `api-${fixtureId}`,
      time_casa: home,
      time_fora: away,
      logo_casa: teams.home?.logo || null,
      logo_fora: teams.away?.logo || null,
      campeonato: league.name || "Campeonato",
      pais: league.country || "Brasil",
      data,
      hora,
      data_iso: fixtureInfo.date,
      status: statusText,
      placar: goals.home !== null && goals.away !== null ? `${goals.home} - ${goals.away}` : null,
      allow_aposta: allowBet,
      odds_1x2,
      mercados,
      source: "api-football"
    };
  });
}

// ============================================================
// TESTAR UMA API-FOOTBALL
// ============================================================

async function testApiFootball(api) {
  const today = new Date().toISOString().split("T")[0];
  const url = `${api.endpoint}/fixtures?date=${today}&timezone=America/Sao_Paulo`;
  
  try {
    const response = await fetch(url, {
      headers: { "x-apisports-key": api.key },
      signal: AbortSignal.timeout(10000)
    });
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    
    const data = await response.json();
    
    if (data.errors && Object.keys(data.errors).length > 0) {
      return { success: false, error: data.errors.token || JSON.stringify(data.errors) };
    }
    
    if (data.results > 0) {
      // Tentar carregar odds tambem
      let oddsData = {};
      try {
        const oddsResponse = await fetch(`${api.endpoint}/odds?date=${today}`, {
          headers: { "x-apisports-key": api.key },
          signal: AbortSignal.timeout(10000)
        });
        if (oddsResponse.ok) {
          const oddsJson = await oddsResponse.json();
          if (oddsJson.response) {
            oddsJson.response.forEach(item => {
              const fid = item.fixture?.id;
              if (fid) oddsData[fid] = item;
            });
          }
        }
      } catch (e) {
        console.warn("Nao foi possivel carregar odds:", e);
      }
      
      return {
        success: true,
        name: api.name,
        fixtures: data.response,
        oddsData
      };
    }
    
    return { success: false, error: "Nenhum jogo encontrado" };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================================
// FETCH JOGOS COM FALLBACK EM CASCATA
// ============================================================

async function fetchJogosWithFallback() {
  console.log("=== INICIANDO BUSCA DE JOGOS COM FALLBACK ===");
  
  // 1. Testar APIs da API-Football em ordem
  for (const api of API_CONFIG.apis) {
    console.log(`Tentando: ${api.name}...`);
    
    const result = await testApiFootball(api);
    
    if (result.success) {
      console.log(`SUCESSO! Usando: ${result.name} (${result.fixtures.length} jogos)`);
      
      const jogos = transformApiFootballFixtures(result.fixtures, result.oddsData);
      
      window.dispatchEvent(new CustomEvent("betlocal:data-source", {
        detail: { source: "api-football", api: result.name, count: jogos.length }
      }));
      
      return jogos.map(j => normalizeGame(j));
    }
    
    console.log(`FALHOU: ${result.error}`);
  }
  
  // 2. Todas as APIs falharam - usar fallback do Supabase
  console.log("Todas as APIs falharam. Usando fallback: Supabase Edge Function");
  
  try {
    const response = await fetch(API_CONFIG.fallback.url, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const jogos = data.jogos || data || [];
      
      if (Array.isArray(jogos) && jogos.length > 0) {
        console.log(`Fallback funcionou! ${jogos.length} jogos`);
        
        window.dispatchEvent(new CustomEvent("betlocal:data-source", {
          detail: { source: "supabase", count: jogos.length }
        }));
        
        return jogos.map(j => normalizeGame(j));
      }
    }
  } catch (error) {
    console.warn("Fallback do Supabase falhou:", error);
  }
  
  // 3. Fallback final: usar dados locais
  console.log("Usando dados locais de demonstracao");
  
  try {
    const response = await fetch("api/fake-api.json", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      
      window.dispatchEvent(new CustomEvent("betlocal:data-source", {
        detail: { source: "demo", count: data.jogos.length }
      }));
      
      return data.jogos.map(j => normalizeGame(j));
    }
  } catch (error) {
    console.warn("Dados locais falharam:", error);
  }
  
  // 4. Ultimo recurso: dados embutidos
  window.dispatchEvent(new CustomEvent("betlocal:data-source", {
    detail: { source: "demo-builtin", count: DEMO_DATA.jogos.length }
  }));
  
  return DEMO_DATA.jogos.map(j => normalizeGame(j));
}

// ============================================================
// SOBREESCREVER FUNCAO ORIGINAL
// ============================================================

// Substituir fetchJogos original pela nova versao com fallback
if (typeof window.BetLocal !== "undefined") {
  window.BetLocal.fetchJogos = fetchJogosWithFallback;
}

// Para uso standalone, exportar
window.fetchJogosWithFallback = fetchJogosWithFallback;
window.API_CONFIG = API_CONFIG;