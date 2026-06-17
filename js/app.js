const STORAGE_KEYS = {
  ticket: "betlocal.ticket",
  history: "betlocal.history",
  stake: "betlocal.stake"
};

// TEAM_LEAGUE_MAP e LEAGUE_PRIORITY vem do league-mapping.js via window

const DEMO_DATA = {
  jogos: [
    {
      id: 101,
      time_casa: "Flamengo",
      time_fora: "Palmeiras",
      campeonato: "Brasileirão Série A",
      data: "Hoje",
      hora: "17:00",
      status: "Pré-jogo",
      placar: null,
      odds_1x2: { casa: 1.85, empate: 3.55, fora: 4.20 },
      mercados: [
        { nome: "Ambas marcam", opcoes: [{ nome: "Sim", odd: 1.72 }, { nome: "Não", odd: 2.05 }] },
        { nome: "Total de gols", opcoes: [{ nome: "Mais de 2.5", odd: 1.90 }, { nome: "Menos de 2.5", odd: 1.86 }, { nome: "Mais de 3.5", odd: 2.85 }] },
        { nome: "Escanteios", opcoes: [{ nome: "Mais de 8.5", odd: 1.78 }, { nome: "Menos de 8.5", odd: 1.96 }] },
        { nome: "Handicap", opcoes: [{ nome: "Flamengo -1", odd: 2.70 }, { nome: "Palmeiras +1", odd: 1.42 }] },
        { nome: "Cartões", opcoes: [{ nome: "Mais de 4.5", odd: 1.82 }, { nome: "Menos de 4.5", odd: 1.92 }] },
        { nome: "Placar correto", opcoes: [{ nome: "1 x 0", odd: 7.50 }, { nome: "1 x 1", odd: 6.20 }, { nome: "2 x 1", odd: 8.80 }] }
      ]
    },
    {
      id: 102,
      time_casa: "São Paulo",
      time_fora: "Corinthians",
      campeonato: "Brasileirão Série A",
      data: "Hoje",
      hora: "19:30",
      status: "Pré-jogo",
      placar: null,
      odds_1x2: { casa: 2.12, empate: 3.20, fora: 3.48 },
      mercados: [
        { nome: "Ambas marcam", opcoes: [{ nome: "Sim", odd: 1.88 }, { nome: "Não", odd: 1.84 }] },
        { nome: "Total de gols", opcoes: [{ nome: "Mais de 1.5", odd: 1.42 }, { nome: "Mais de 2.5", odd: 2.14 }, { nome: "Menos de 2.5", odd: 1.66 }] },
        { nome: "Escanteios", opcoes: [{ nome: "Mais de 9.5", odd: 1.92 }, { nome: "Menos de 9.5", odd: 1.78 }] },
        { nome: "Cartões", opcoes: [{ nome: "Mais de 5.5", odd: 1.76 }, { nome: "Menos de 5.5", odd: 2.00 }] }
      ]
    },
    {
      id: 103,
      time_casa: "Barcelona",
      time_fora: "Real Madrid",
      campeonato: "La Liga",
      data: "Hoje",
      hora: "21:00",
      status: "Ao vivo",
      placar: "1 - 1",
      odds_1x2: { casa: 2.45, empate: 3.10, fora: 2.90 },
      mercados: [
        { nome: "Ambas marcam", opcoes: [{ nome: "Sim", odd: 1.48 }, { nome: "Não", odd: 2.55 }] },
        { nome: "Total de gols", opcoes: [{ nome: "Mais de 2.5", odd: 1.62 }, { nome: "Mais de 3.5", odd: 2.28 }, { nome: "Menos de 3.5", odd: 1.58 }] },
        { nome: "Handicap", opcoes: [{ nome: "Barcelona 0", odd: 1.78 }, { nome: "Real Madrid 0", odd: 2.02 }] },
        { nome: "Placar correto", opcoes: [{ nome: "2 x 1", odd: 8.40 }, { nome: "2 x 2", odd: 7.90 }, { nome: "1 x 2", odd: 9.10 }] }
      ]
    },
    {
      id: 104,
      time_casa: "Manchester City",
      time_fora: "Arsenal",
      campeonato: "Premier League",
      data: "Amanhã",
      hora: "16:00",
      status: "Pré-jogo",
      placar: null,
      odds_1x2: { casa: 1.96, empate: 3.70, fora: 3.75 },
      mercados: [
        { nome: "Ambas marcam", opcoes: [{ nome: "Sim", odd: 1.60 }, { nome: "Não", odd: 2.25 }] },
        { nome: "Total de gols", opcoes: [{ nome: "Mais de 2.5", odd: 1.74 }, { nome: "Menos de 2.5", odd: 2.02 }] },
        { nome: "Escanteios", opcoes: [{ nome: "Mais de 10.5", odd: 2.08 }, { nome: "Menos de 10.5", odd: 1.68 }] },
        { nome: "Cartões", opcoes: [{ nome: "Mais de 3.5", odd: 1.86 }, { nome: "Menos de 3.5", odd: 1.88 }] }
      ]
    },
    {
      id: 105,
      time_casa: "Boca Juniors",
      time_fora: "River Plate",
      campeonato: "Libertadores",
      data: "Hoje",
      hora: "22:15",
      status: "Pré-jogo",
      placar: null,
      odds_1x2: { casa: 2.62, empate: 3.05, fora: 2.78 },
      mercados: [
        { nome: "Ambas marcam", opcoes: [{ nome: "Sim", odd: 1.95 }, { nome: "Não", odd: 1.76 }] },
        { nome: "Total de gols", opcoes: [{ nome: "Mais de 2.5", odd: 2.22 }, { nome: "Menos de 2.5", odd: 1.60 }] },
        { nome: "Cartões", opcoes: [{ nome: "Mais de 6.5", odd: 1.70 }, { nome: "Menos de 6.5", odd: 2.05 }] },
        { nome: "Placar correto", opcoes: [{ nome: "1 x 0", odd: 6.90 }, { nome: "0 x 0", odd: 8.20 }, { nome: "1 x 1", odd: 5.70 }] }
      ]
    }
  ]
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function getClientId() {
  return window.BetLocalTenant?.getCurrentClient?.()?.id || "local";
}

function storageKey(key) {
  return `${key}.${getClientId()}`;
}

function readJSONStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(key)) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatOdd(value) {
  return Number(value || 1).toFixed(2);
}

// Função para buscar logo de time com variações de nome
function findTeamLogo(teamName, TEAM_LOGOS) {
  if (!teamName) return null;
  
  // 1. Busca exata
  if (TEAM_LOGOS[teamName]) return TEAM_LOGOS[teamName];
  
  // 2. Usar alias se disponível
  const TEAM_ALIASES = window.TEAM_ALIASES || {};
  const alias = TEAM_ALIASES[teamName];
  if (alias && TEAM_LOGOS[alias]) return TEAM_LOGOS[alias];
  
  // 3. Normalizar e buscar
  const normalized = teamName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  
  // Tentar variações comuns
  const variations = [
    // Sem sufixos comuns
    teamName.replace(/\s+(AC|FC|SC|SP|RJ|MG|RS|BA|PE|CE|PR)$/i, ""),
    // Versão com Athletic Club
    teamName.replace("Athletic Club", "Athletic"),
    // Versão com Sport Club
    teamName.replace("Sport Club", "Sport"),
    // Versão com Red Bull
    teamName.replace("Red Bull ", ""),
    // Só primeiras palavras
    teamName.split(" ")[0],
    // Sem acentos
    teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  ];
  
  for (const v of variations) {
    if (v && TEAM_LOGOS[v]) return TEAM_LOGOS[v];
  }
  
  // 4. Busca parcial (contains) - útil para Barcelona, etc
  const searchNormalized = teamName.toLowerCase().split(" ")[0];
  for (const [key, logo] of Object.entries(TEAM_LOGOS)) {
    if (key.toLowerCase().startsWith(searchNormalized)) {
      return logo;
    }
  }
  
  return null;
}

function normalizeMarket(market) {
  if (!market) return [];
  if (Array.isArray(market.opcoes) && market.opcoes[0] && typeof market.opcoes[0] === "object") {
    return {
      nome: market.nome,
      descricao: market.descricao || "Mercado de aposta disponivel para este jogo.",
      opcoes: market.opcoes.map((option) => ({ nome: option.nome, odd: Number(option.odd) }))
    };
  }
  return {
    nome: market.nome,
    descricao: market.descricao || "Mercado de aposta disponivel para este jogo.",
    opcoes: (market.opcoes || []).map((nome, index) => ({ nome, odd: Number(market.odds?.[index] || 1) }))
  };
}

async function fetchJogos() {
  const mode = window.BetLocalConfig?.gameMode || "auto";
  let jogos = [];
  let source = "demo";

  // 1. Tentar Edge Function do Supabase (API-Football real)
  if (mode !== "demo") {
    const backendUrl =
      window.BetLocalConfig?.getBackendUrl?.("/jogos") ||
      "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/jogos";

    try {
      const response = await fetch(backendUrl, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.jogos) && data.jogos.length) {
          jogos = data.jogos;
          source = data.source || "api";
        }
      }
    } catch (error) {
      console.warn("Edge Function não respondeu:", error.message);
    }
  }

  // 2. Tentar API alternativa (football-data.org)
  if (!jogos.length && mode !== "demo") {
    try {
      const altJogos = await fetchJogosAlternative();
      if (altJogos.length) {
        jogos = altJogos;
        source = "alt-api";
      }
    } catch (error) {
      console.warn("API alternativa falhou:", error.message);
    }
  }

  // 3. Fallback para fake-api.json
  if (!jogos.length) {
    try {
      const response = await fetch("api/fake-api.json", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.jogos)) jogos = data.jogos;
      }
    } catch (error) {
      console.warn("fake-api.json falhou:", error.message);
    }
  }

  // 4. Fallback final: dados embutidos
  if (!jogos.length) {
    jogos = DEMO_DATA.jogos;
    source = "demo-builtin";
  }

  // 5. Enriquecer com logos via TheSportsDB
  await enrichJogosWithLogos(jogos);

  window.dispatchEvent(new CustomEvent("betlocal:data-source", { detail: { source, count: jogos.length } }));
  return jogos.map(normalizeGame);
}

function identifyLeague(jogo) {
  const home = jogo.time_casa || jogo.home || "";
  const away = jogo.time_fora || jogo.away || "";
  const currentLeague = jogo.campeonato || "";
  const TEAM_LEAGUE_MAP = window.TeamLeagueMap || {};
  
  // Se ja tem liga valida (nao e "Outros"), usar ela
  if (currentLeague && currentLeague !== "Outros" && currentLeague !== "Campeonato" && currentLeague !== "Campeonato de Clubes") {
    return currentLeague;
  }
  
  // Tentar identificar pela equipe
  const homeLeague = TEAM_LEAGUE_MAP[home];
  if (homeLeague) return homeLeague;
  
  const awayLeague = TEAM_LEAGUE_MAP[away];
  if (awayLeague) return awayLeague;
  
  // Padrao: usar o que vier da API
  return currentLeague || "Outros";
}

function normalizeGame(jogo) {
  // Obter escudos e função de reduzir odds
  const TEAM_LOGOS = window.TEAM_LOGOS || {};
  const reduceOdds = window.reduceOdds || (odd => odd);
  
  // Se não tem logo, tentar pegar do mapeamento estático
  // Também tentar variações de nome (com/sem AC, FC, etc.)
  const teamName = jogo.time_casa || "";
  const awayName = jogo.time_fora || "";
  
  let homeLogo = jogo.logo_casa || null;
  if (!homeLogo) homeLogo = findTeamLogo(teamName, TEAM_LOGOS);
  
  let awayLogo = jogo.logo_fora || null;
  if (!awayLogo) awayLogo = findTeamLogo(awayName, TEAM_LOGOS);
  
  // Reduzir odds 1X2 em 20%
  const reducedOdds = {
    casa: reduceOdds(jogo.odds_1x2?.casa || 2.0),
    empate: reduceOdds(jogo.odds_1x2?.empate || 3.0),
    fora: reduceOdds(jogo.odds_1x2?.fora || 3.0)
  };
  
  // Reduzir odds dos mercados
  const reducedMercados = (jogo.mercados || []).map(mercado => ({
    ...mercado,
    opcoes: (mercado.opcoes || []).map(opcao => ({
      ...opcao,
      odd: reduceOdds(opcao.odd)
    }))
  }));
  
  return {
    ...jogo,
    logo_casa: homeLogo,
    logo_fora: awayLogo,
    status: jogo.status || "Pré-jogo",
    allow_aposta: jogo.allow_aposta ?? inferBettableStatus(jogo.status),
    placar: jogo.placar || null,
    mercados: reducedMercados,
    odds_1x2: reducedOdds,
    // Enriquecer com liga identificada
    campeonato: identifyLeague(jogo)
  };
}

function inferBettableStatus(status) {
  const normalizedStatus = normalizeKeyPart(status || "pre-jogo");
  return ["pre-jogo", "pre jogo", "not started", "time to be defined"].includes(normalizedStatus);
}

const TicketManager = {
  selections: readJSONStorage(STORAGE_KEYS.ticket, []),

  init() {
    const normalizedSelections = this.withoutMarketConflicts(this.selections);
    if (normalizedSelections.length !== this.selections.length) {
      this.selections = normalizedSelections;
      this.save();
    }

    const stakeInput = document.getElementById("valor-aposta");
    if (stakeInput) {
      stakeInput.value = localStorage.getItem(storageKey(STORAGE_KEYS.stake)) || "";
      stakeInput.addEventListener("input", () => {
        localStorage.setItem(storageKey(STORAGE_KEYS.stake), stakeInput.value);
        this.render();
      });
    }

    document.getElementById("limpar-ticket")?.addEventListener("click", () => this.clear());
    document.getElementById("gerar-codigo")?.addEventListener("click", () => this.generateCode());
    this.render();
  },

  save() {
    localStorage.setItem(storageKey(STORAGE_KEYS.ticket), JSON.stringify(this.selections));
  },

  add(selection) {
    const frozenSelection = {
      id: `${selection.gameId}-${selection.mercado}-${selection.opcao}`,
      cliente_id: getClientId(),
      gameId: selection.gameId,
      jogo: selection.jogo,
      campeonato: selection.campeonato,
      mercado: selection.mercado,
      opcao: selection.opcao,
      odd: Number(selection.odd),
      savedAt: new Date().toISOString()
    };

    this.selections = this.selections.filter((item) => !isSameGameMarket(item, frozenSelection));
    this.selections.push(frozenSelection);

    this.save();
    this.render();
  },

  withoutMarketConflicts(selections) {
    const byMarket = new Map();
    selections.forEach((selection) => {
      byMarket.set(getGameMarketKey(selection), selection);
    });
    return Array.from(byMarket.values());
  },

  remove(index) {
    this.selections.splice(index, 1);
    this.save();
    this.render();
  },

  clear() {
    this.selections = [];
    this.save();
    this.render();
  },

  getStake() {
    return Number.parseFloat(document.getElementById("valor-aposta")?.value || "0") || 0;
  },

  getTotalOdd() {
    if (!this.selections.length) return 1;
    return this.selections.reduce((total, item) => {
      return Number((total * Number(item.odd)).toFixed(2));
    }, 1);
  },

  getReturn() {
    return this.getStake() * this.getTotalOdd();
  },

  generateCode() {
    const display = document.getElementById("codigo-gerado");
    const stake = this.getStake();

    if (!this.selections.length) {
      alert("Selecione ao menos uma odd para gerar o comprovante.");
      return null;
    }

    if (stake < 1) {
      alert("Informe um valor de aposta a partir de R$ 1,00.");
      return null;
    }

    // Verificar limite de aposta do operador
    const limite = window.BetLocalOperador?.getLimite?.() || 1000;
    if (stake > limite) {
      alert(`⚠️ Limite de aposta excedido!\nMáximo permitido: R$ ${limite.toFixed(2)}\nValor informado: R$ ${stake.toFixed(2)}\n\nEntre em contato com o dono para aumentar o limite.`);
      return null;
    }

    // Verificar se caixa está aberto
    const caixa = window.BetLocalOperador?.getCaixa?.();
    if (caixa && !caixa.aberto) {
      alert("🔴 Caixa fechado!\n\nAbra o caixa no painel do operador antes de gerar bilhetes.");
      return null;
    }

    const code = createBetCode();
    
    // Buscar cliente selecionado (se houver)
    const clienteSelect = document.getElementById("cliente-aposta");
    const clienteId = clienteSelect?.value || "";
    let clienteNome = "";
    let clienteTelefone = "";
    
    if (clienteId && window.BetLocalOperador?.getClientes) {
      const clientes = window.BetLocalOperador.getClientes();
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        clienteNome = cliente.nome;
        clienteTelefone = cliente.telefone;
      }
    }

    const bet = {
      codigo: code,
      cliente_id: getClientId(),
      cliente_aposta_id: clienteId,
      cliente_nome: clienteNome,
      cliente_telefone: clienteTelefone,
      data_iso: new Date().toISOString(),
      data: new Date().toLocaleString("pt-BR"),
      selections: this.selections.map((item) => ({ ...item })),
      odd_total: Number(formatOdd(this.getTotalOdd())),
      valor: Number(stake.toFixed(2)),
      retorno: Number(this.getReturn().toFixed(2)),
      status: "Aberta",
      pagamento: "Pendente"
    };

    const history = getBetHistory();
    history.unshift(bet);
    saveBetHistory(history);
    syncBetToSupabase(bet);

    if (display) {
      const qrUrl = `${window.location.origin}${window.location.pathname.replace("index.html", "verificar.html")}?codigo=${encodeURIComponent(code)}`;
      display.innerHTML = `
        <div class="receipt-card">
          <small>Código gerado</small>
          <strong class="receipt-code">${escapeHTML(code)}</strong>
          <div class="receipt-line"><span>Odd total</span><strong>${formatOdd(bet.odd_total)}</strong></div>
          <div class="receipt-line"><span>Retorno</span><strong>${currency.format(bet.retorno)}</strong></div>
          ${clienteNome ? `<div class="receipt-line"><span>Cliente</span><strong>${escapeHTML(clienteNome)}</strong></div>` : ""}
          <div id="qr-bilhete" style="margin:12px auto; width:150px; height:150px;"></div>
          <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-top:10px;">
            <a class="whatsapp-btn" href="${createWhatsAppLink(bet)}" target="_blank" rel="noopener">📱 WhatsApp</a>
            <button class="status-btn" type="button" onclick="window.BetLocalOperador?.shareTelegram?.(${JSON.stringify(bet).replace(/"/g, '&quot;')})">✈️ Telegram</button>
            <button class="status-btn" type="button" onclick="window.BetLocalOperador?.printBilhete?.(${JSON.stringify(bet).replace(/"/g, '&quot;')})">🖨️ Imprimir</button>
          </div>
          <small>Escaneie o QR Code para acompanhar sua aposta em tempo real.</small>
        </div>
      `;
      
      // Gerar QR Code
      if (typeof QRCode !== "undefined") {
        setTimeout(() => {
          const qrContainer = document.getElementById("qr-bilhete");
          if (qrContainer) {
            QRCode.toCanvas(qrContainer, qrUrl, { width: 150, margin: 2 }, (err) => {
              if (err) console.error("Erro QR:", err);
            });
          }
        }, 100);
      }
    }

    this.clear();
    window.dispatchEvent(new CustomEvent("betlocal:history-updated"));
    return bet;
  },

  render() {
    const list = document.getElementById("ticket-list");
    const oddEl = document.getElementById("odd-total");
    const returnEl = document.getElementById("retorno-total");
    const heroReturnEl = document.getElementById("hero-return");

    if (oddEl) oddEl.textContent = formatOdd(this.getTotalOdd());
    if (returnEl) returnEl.textContent = currency.format(this.getReturn());
    if (heroReturnEl) heroReturnEl.textContent = currency.format(this.getReturn());
    if (!list) return;

    if (!this.selections.length) {
      list.innerHTML = `<div class="empty-ticket">Nenhuma aposta selecionada</div>`;
      return;
    }

    list.innerHTML = this.selections.map((item, index) => `
      <article class="ticket-item">
        <div class="ticket-item-top">
          <div>
            <strong>${escapeHTML(item.opcao)}</strong>
            <small>${escapeHTML(item.mercado)} • ${escapeHTML(item.jogo)}</small>
          </div>
          <button class="remove-btn" type="button" data-remove="${index}" aria-label="Remover seleção">×</button>
        </div>
        <div class="status-line">
          <small>${escapeHTML(item.campeonato)}</small>
          <strong>${formatOdd(item.odd)}</strong>
        </div>
      </article>
    `).join("");

    list.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => this.remove(Number(button.dataset.remove)));
    });
  }
};

function createBetCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const prefix = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  const number = Math.floor(1000 + Math.random() * 9000);
  const code = `${prefix}${number}`;
  return getBetHistory().some((bet) => bet.codigo === code) ? createBetCode() : code;
}

function getBetHistory() {
  return readJSONStorage(STORAGE_KEYS.history, []);
}

function saveBetHistory(history) {
  localStorage.setItem(storageKey(STORAGE_KEYS.history), JSON.stringify(history));
  window.dispatchEvent(new CustomEvent("betlocal:history-updated"));
}

async function syncBetToSupabase(bet) {
  if (!window.BetLocalSupabase?.isEnabled()) return;

  try {
    await window.BetLocalSupabase.insertBet(bet);
  } catch (error) {
    console.warn("A aposta ficou salva localmente, mas não foi enviada ao Supabase.", error);
  }
}

async function syncBetStatusToSupabase(code, status) {
  if (!window.BetLocalSupabase?.isEnabled()) return;

  try {
    await window.BetLocalSupabase.updateBetStatus(code, status);
  } catch (error) {
    console.warn("O status foi salvo localmente, mas não foi atualizado no Supabase.", error);
  }
}

async function syncBetUpdateToSupabase(bet) {
  if (!window.BetLocalSupabase?.isEnabled()) return;

  try {
    await window.BetLocalSupabase.updateBet(bet);
  } catch (error) {
    console.warn("A aposta foi atualizada localmente, mas nao foi atualizada no Supabase.", error);
  }
}

async function refreshHistoryFromSupabase() {
  if (!window.BetLocalSupabase?.isEnabled()) return getBetHistory();

  try {
    const remoteHistory = await window.BetLocalSupabase.fetchBets();
    if (remoteHistory.length) {
      localStorage.setItem(storageKey(STORAGE_KEYS.history), JSON.stringify(remoteHistory));
      window.dispatchEvent(new CustomEvent("betlocal:history-updated"));
    }
    return remoteHistory;
  } catch (error) {
    console.warn("Não foi possível carregar apostas do Supabase. Usando dados locais.", error);
    return getBetHistory();
  }
}

function normalizeKeyPart(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getGameMarketKey(selection) {
  return `${selection.gameId}::${normalizeKeyPart(selection.mercado)}`;
}

function isSameGameMarket(first, second) {
  return getGameMarketKey(first) === getGameMarketKey(second);
}

function makeSelection(jogo, mercado, opcao, odd) {
  return {
    cliente_id: getClientId(),
    gameId: jogo.id,
    jogo: `${jogo.time_casa} x ${jogo.time_fora}`,
    campeonato: jogo.campeonato,
    mercado,
    opcao,
    odd: Number(odd)
  };
}

function buildWhatsAppMessage(bet) {
  const lines = [
    `Cupom: ${bet.codigo}`,
    "",
    ...bet.selections.flatMap((item) => [
      item.jogo,
      `${item.mercado}: ${item.opcao}`,
      `Odd: ${formatOdd(item.odd)}`,
      ""
    ]),
    `Odd total: ${formatOdd(bet.odd_total)}`,
    `Valor: ${currency.format(bet.valor)}`,
    `Retorno possivel: ${currency.format(bet.retorno)}`,
    `Status: ${bet.status}`
  ];
  return lines.join("\n");
}

function createWhatsAppLink(bet) {
  return `https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage(bet))}`;
}

async function fetchFixtureStatuses(ids) {
  const cleanIds = [...new Set(ids.map(String).filter(Boolean))];
  if (!cleanIds.length) return [];

  const backendUrl =
    window.BetLocalConfig?.getBackendUrl?.("/status") ||
    "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/status";

  const response = await fetch(
    `${backendUrl}?ids=${cleanIds.join("-")}`,
    { cache: "no-store" }
  );
  if (!response.ok) throw new Error("Nao foi possivel consultar resultados.");
  const data = await response.json();

  // Mapear resposta da API-Football para o formato que o front espera
  return (data.response || []).map((f) => ({
    id: String(f.fixture.id),
    status: f.fixture.status?.short || "NS",
    elapsed: f.fixture.status?.elapsed ?? null,
    placar: f.goals?.home !== null && f.goals?.away !== null
      ? `${f.goals.home} - ${f.goals.away}`
      : null,
    home: f.teams?.home?.name,
    away: f.teams?.away?.name,
  }));
}

function renderOddButton(jogo, mercado, opcao, odd) {
  const disabled = !isGameBettable(jogo);
  return `
    <button class="odd-btn" type="button"
      data-game-id="${jogo.id}"
      data-market="${escapeHTML(mercado)}"
      data-option="${escapeHTML(opcao)}"
      data-odd="${Number(odd)}"
      ${disabled ? "disabled aria-disabled=\"true\"" : ""}>
      <span>${escapeHTML(opcao)}</span>
      <strong>${disabled ? "Fechado" : formatOdd(odd)}</strong>
    </button>
  `;
}

function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderTeamLogo(url, name, sizeClass = "") {
  if (url) {
    return `<img class="team-logo ${sizeClass}" src="${escapeHTML(url)}" alt="Escudo ${escapeHTML(name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
      <span class="team-logo-fallback ${sizeClass}" style="display:none;">${escapeHTML(getInitials(name))}</span>`;
  }
  return `<span class="team-logo-fallback ${sizeClass}">${escapeHTML(getInitials(name))}</span>`;
}

function wireOddButtons(scope, jogos) {
  scope.querySelectorAll(".odd-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const jogo = jogos.find((item) => String(item.id) === String(button.dataset.gameId));
      if (!jogo) return;
      if (!isGameBettable(jogo)) {
        alert("Este jogo não está disponível para apostas.");
        return;
      }
      TicketManager.add(makeSelection(
        jogo,
        button.dataset.market,
        button.dataset.option,
        button.dataset.odd
      ));
      button.classList.add("selected");
      window.setTimeout(() => button.classList.remove("selected"), 500);
    });
  });
}

function renderHomeJogos(jogos) {
  const container = document.getElementById("games-container");
  const totalGames = document.getElementById("total-games");
  if (totalGames) totalGames.textContent = `${jogos.length} jogos`;
  if (!container) return;

  if (!jogos.length) {
    container.innerHTML = `<div class="empty-ticket">Nenhum jogo encontrado</div>`;
    return;
  }

  container.innerHTML = jogos.map((jogo) => {
    const isLive = jogo.status?.toLowerCase().includes("vivo");
    const allowBet = isGameBettable(jogo);
    return `
      <article class="game-card ${allowBet ? "" : "closed"}" data-league="${escapeHTML(jogo.campeonato)}" data-status="${escapeHTML(jogo.status)}">
        <div>
          <div class="game-meta">
            <span class="game-league">${escapeHTML(jogo.campeonato)}</span>
            <span class="status-badge ${isLive ? "live" : ""}">${escapeHTML(jogo.status)}</span>
          </div>
          <h3 class="game-title">
            <span class="team-name">${renderTeamLogo(jogo.logo_casa, jogo.time_casa)}${escapeHTML(jogo.time_casa)}</span>
            <span class="versus">x</span>
            <span class="team-name">${renderTeamLogo(jogo.logo_fora, jogo.time_fora)}${escapeHTML(jogo.time_fora)}</span>
          </h3>
          <div class="game-time">${escapeHTML(jogo.data)} • ${escapeHTML(jogo.hora)}${jogo.placar ? ` • ${escapeHTML(jogo.placar)}` : ""}</div>
        </div>
        <div class="odds-grid">
          ${renderOddButton(jogo, "Resultado final", jogo.time_casa, jogo.odds_1x2.casa)}
          ${renderOddButton(jogo, "Resultado final", "Empate", jogo.odds_1x2.empate)}
          ${renderOddButton(jogo, "Resultado final", jogo.time_fora, jogo.odds_1x2.fora)}
        </div>
        <div class="game-actions">
          <a class="details-link" href="jogo.html?id=${encodeURIComponent(jogo.id)}">Detalhes</a>
        </div>
      </article>
    `;
  }).join("");

  wireOddButtons(container, jogos);
}

function isGameBettable(jogo) {
  return jogo.allow_aposta !== false && inferBettableStatus(jogo.status);
}

function renderCompeticoes(jogos, onSelect) {
  const list = document.getElementById("competicoes-lista");
  if (!list) return;

  // Agrupar por liga
  const groups = jogos.reduce((acc, jogo) => {
    const league = jogo.campeonato || "Outros";
    acc[league] = (acc[league] || 0) + 1;
    return acc;
  }, {});

  // Ordenar por prioridade
  const LEAGUE_PRIORITY = window.LeaguePriority || {};
  const sortedLeagues = Object.entries(groups).sort((a, b) => {
    const priorityA = LEAGUE_PRIORITY[a[0]] || 50;
    const priorityB = LEAGUE_PRIORITY[b[0]] || 50;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Se mesma prioridade, ordenar por nome
    return a[0].localeCompare(b[0]);
  });

  list.innerHTML = `
    <li><button class="active" type="button" data-league="all"><span>Todos os campeonatos</span><small>${jogos.length}</small></button></li>
    ${sortedLeagues.map(([league, count]) => `
      <li><button type="button" data-league="${escapeHTML(league)}"><span>${escapeHTML(league)}</span><small>${count}</small></button></li>
    `).join("")}
  `;

  list.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      list.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      onSelect(button.dataset.league);
    });
  });
}

function initHome() {
  fetchJogos().then((jogos) => {
    let currentLeague = "all";
    let currentFilter = "all";
    let searchTerm = "";

    const applyFilters = () => {
      const term = searchTerm.trim().toLowerCase();
      const filtered = jogos.filter((jogo) => {
        const leagueOk = currentLeague === "all" || jogo.campeonato === currentLeague;
        const filterOk =
          currentFilter === "all" ||
          (currentFilter === "live" && jogo.status?.toLowerCase().includes("vivo")) ||
          (currentFilter === "today" && jogo.data?.toLowerCase() === "hoje");
        const searchOk = !term || `${jogo.time_casa} ${jogo.time_fora} ${jogo.campeonato}`.toLowerCase().includes(term);
        return leagueOk && filterOk && searchOk;
      });
      renderHomeJogos(filtered);
    };

    renderCompeticoes(jogos, (league) => {
      currentLeague = league;
      applyFilters();
    });
    renderHomeJogos(jogos);

    document.getElementById("search-games")?.addEventListener("input", (event) => {
      searchTerm = event.target.value;
      applyFilters();
    });

    document.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.filter;
        applyFilters();
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  TicketManager.init();
  if (document.body.dataset.page === "home") initHome();
});

/* ========== BUSCA DE ESCUDOS VIA THESPORTSDB (GRATUITO) ========== */

const TEAM_LOGO_CACHE_KEY = "betlocal.team_logos";

function getTeamLogoCache() {
  try {
    return JSON.parse(localStorage.getItem(TEAM_LOGO_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveTeamLogoCache(cache) {
  localStorage.setItem(TEAM_LOGO_CACHE_KEY, JSON.stringify(cache));
}

async function fetchTeamLogoFromSportsDB(teamName) {
  const cache = getTeamLogoCache();
  if (cache[teamName]) return cache[teamName];

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    const data = await response.json();
    const teams = data.teams || [];
    if (!teams.length) return null;

    // Preferir logo do time (strTeamBadge) ou escudo (strTeamLogo)
    const logo = teams[0].strTeamBadge || teams[0].strTeamLogo || teams[0].strTeamIcon;
    if (logo) {
      cache[teamName] = logo;
      saveTeamLogoCache(cache);
    }
    return logo;
  } catch (error) {
    console.warn("Erro ao buscar logo via TheSportsDB:", error.message);
    return null;
  }
}

async function enrichJogosWithLogos(jogos) {
  const TEAM_LOGOS = window.TEAM_LOGOS || {};
  const promises = jogos.map(async (jogo) => {
    // 1. Se já tem logo da API, usar ela
    // 2. Se não tem, buscar no mapeamento estático
    // 3. Se ainda não tem, buscar na API externa (TheSportsDB)
    
    if (!jogo.logo_casa) {
      jogo.logo_casa = findTeamLogo(jogo.time_casa, TEAM_LOGOS) || null;
    }
    if (!jogo.logo_fora) {
      jogo.logo_fora = findTeamLogo(jogo.time_fora, TEAM_LOGOS) || null;
    }
    
    // Se ainda não tem, buscar na API externa
    if (!jogo.logo_casa) {
      const extLogo = await fetchTeamLogoFromSportsDB(jogo.time_casa);
      if (extLogo) jogo.logo_casa = extLogo;
    }
    if (!jogo.logo_fora) {
      const extLogo = await fetchTeamLogoFromSportsDB(jogo.time_fora);
      if (extLogo) jogo.logo_fora = extLogo;
    }
    
    return jogo;
  });
  return Promise.all(promises);
}

/* ========== FUNCOES DE ODDS PARA API ALTERNATIVA ========== */

function decimalOdd(seed, base = 1.65) {
  return Math.round((base + ((seed * 37) % 145) / 100) * 100) / 100;
}

function reduceOdd(odd) {
  return Math.max(1.01, Math.round(odd * 0.8 * 100) / 100);
}

function buildDemoMarkets(home, away) {
  return [
    {
      nome: "Ambas marcam",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: "Sim", odd: 1.82 }, { nome: "Nao", odd: 1.92 }]
    },
    {
      nome: "Total de gols",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: "Mais de 1.5", odd: 1.38 }, { nome: "Mais de 2.5", odd: 1.95 }, { nome: "Menos de 2.5", odd: 1.78 }]
    },
    {
      nome: "Escanteios",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: "Mais de 8.5", odd: 1.86 }, { nome: "Menos de 8.5", odd: 1.86 }]
    },
    {
      nome: "Handicap",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: `${home} -1`, odd: 2.65 }, { nome: `${away} +1`, odd: 1.45 }]
    },
    {
      nome: "Cartoes",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: "Mais de 4.5", odd: 1.82 }, { nome: "Menos de 4.5", odd: 1.92 }]
    },
    {
      nome: "Placar correto",
      descricao: "Mercado de aposta disponivel para este jogo.",
      opcoes: [{ nome: "1 x 0", odd: 7.5 }, { nome: "1 x 1", odd: 6.2 }, { nome: "2 x 1", odd: 8.8 }]
    }
  ].map(m => ({
    ...m,
    opcoes: m.opcoes.map(o => ({ ...o, odd: reduceOdd(o.odd) }))
  }));
}

/* ========== API ALTERNATIVA DE FIXTURES (OpenLigaDB - GRATUITA) ========== */

async function fetchJogosAlternative() {
  const allJogos = [];

  // Ligas disponíveis na OpenLigaDB (gratuita, sem token)
  // URL sem season → pega temporada atual automaticamente
  const leagues = [
    { shortcut: "bl1", name: "Bundesliga" },
    { shortcut: "bl2", name: "2. Bundesliga" },
    { shortcut: "bl3", name: "3. Liga" },
    { shortcut: "dfb", name: "DFB-Pokal" },
  ];

  for (const league of leagues) {
    try {
      // URL sem season → retorna temporada atual
      const url = `https://api.openligadb.de/getmatchdata/${league.shortcut}`;
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) continue;

      const matches = await response.json();
      if (!Array.isArray(matches)) continue;

      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      // Primeiro: tentar jogos futuros (hoje ou depois)
      let futureMatches = matches.filter(m => {
        const matchDate = new Date(m.matchDateTimeUTC || m.matchDateTime);
        return matchDate.toISOString().slice(0, 10) >= todayStr;
      });

      // Se não tiver futuros, pegar os últimos jogos (para sempre ter algo)
      if (!futureMatches.length) {
        futureMatches = matches.slice(-20); // Últimos 20 jogos
      }

      for (const m of futureMatches) {
        const home = m.team1 || {};
        const away = m.team2 || {};
        const isFinished = m.matchIsFinished;
        const finalResult = m.matchResults?.find(r => r.resultName === "Endergebnis");
        const matchDate = new Date(m.matchDateTimeUTC || m.matchDateTime);
        const matchDateStr = matchDate.toISOString().slice(0, 10);

        allJogos.push({
          id: m.matchID || Math.random().toString(36).slice(2),
          time_casa: home.teamName || "Mandante",
          time_fora: away.teamName || "Visitante",
          logo_casa: home.teamIconUrl || null,
          logo_fora: away.teamIconUrl || null,
          campeonato: `${league.name}`,
          data: matchDateStr === todayStr ? "Hoje" : matchDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          hora: matchDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
          status: isFinished ? "FT" : "Pre-jogo",
          allow_aposta: !isFinished,
          placar: finalResult ? `${finalResult.pointsTeam1} - ${finalResult.pointsTeam2}` : null,
          odds_1x2: {
            casa: reduceOdd(decimalOdd(m.matchID || 1, 1.55)),
            empate: reduceOdd(decimalOdd((m.matchID || 1) + 1, 2.75)),
            fora: reduceOdd(decimalOdd((m.matchID || 1) + 2, 1.85))
          },
          mercados: buildDemoMarkets(home.teamName || "Mandante", away.teamName || "Visitante")
        });
      }
    } catch (error) {
      console.warn(`OpenLigaDB ${league.shortcut} falhou:`, error.message);
    }
  }

  // Se ainda nao tiver jogos, buscar por endpoint de "jogos do dia"
  if (!allJogos.length) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url = `https://api.openligadb.de/getmatchdata/${today}`;
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) {
        const matches = await response.json();
        for (const m of matches) {
          const home = m.team1 || {};
          const away = m.team2 || {};
          const finalResult = m.matchResults?.find(r => r.resultName === "Endergebnis");

          allJogos.push({
            id: m.matchID || Math.random().toString(36).slice(2),
            time_casa: home.teamName || "Mandante",
            time_fora: away.teamName || "Visitante",
            logo_casa: home.teamIconUrl || null,
            logo_fora: away.teamIconUrl || null,
            campeonato: m.leagueName || "Campeonato",
            data: "Hoje",
            hora: new Date(m.matchDateTimeUTC || m.matchDateTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            status: m.matchIsFinished ? "FT" : "Pre-jogo",
            allow_aposta: !m.matchIsFinished,
            placar: finalResult ? `${finalResult.pointsTeam1} - ${finalResult.pointsTeam2}` : null,
            odds_1x2: {
              casa: reduceOdd(decimalOdd(m.matchID || 1, 1.55)),
              empate: reduceOdd(decimalOdd((m.matchID || 1) + 1, 2.75)),
              fora: reduceOdd(decimalOdd((m.matchID || 1) + 2, 1.85))
            },
            mercados: buildDemoMarkets(home.teamName || "Mandante", away.teamName || "Visitante")
          });
        }
      }
    } catch (error) {
      console.warn("OpenLigaDB por dia falhou:", error.message);
    }
  }

  return allJogos;
}

window.BetLocal = {
  fetchJogos,
  fetchJogosAlternative,
  fetchTeamLogoFromSportsDB,
  enrichJogosWithLogos,
  decimalOdd,
  reduceOdd,
  buildDemoMarkets,
  TicketManager,
  getBetHistory,
  saveBetHistory,
  syncBetStatusToSupabase,
  syncBetUpdateToSupabase,
  refreshHistoryFromSupabase,
  fetchFixtureStatuses,
  buildWhatsAppMessage,
  createWhatsAppLink,
  makeSelection,
  renderOddButton,
  renderTeamLogo,
  getInitials,
  wireOddButtons,
  isGameBettable,
  currency,
  formatOdd,
  escapeHTML,
  getClientId
};
