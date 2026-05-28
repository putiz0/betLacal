const STORAGE_KEYS = {
  ticket: "betlocal.ticket",
  history: "betlocal.history",
  stake: "betlocal.stake"
};

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
  const backendUrl = "http://localhost:8000/api/jogos";
  const useDemoFallback = new URLSearchParams(window.location.search).get("demo") === "1";

  try {
    const response = await fetch(backendUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Backend indisponível");
    const data = await response.json();
    if (Array.isArray(data.jogos) && data.jogos.length) {
      return data.jogos.map(normalizeGame);
    }
  } catch (error) {
    console.warn("Usando jogos locais porque a API-Football/backend não respondeu.", error);
  }

  if (!useDemoFallback) return [];

  try {
    const response = await fetch("api/fake-api.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Arquivo local indisponível");
    const data = await response.json();
    if (!Array.isArray(data.jogos)) throw new Error("Formato inválido");
    return data.jogos.map(normalizeGame);
  } catch (error) {
    return DEMO_DATA.jogos;
  }
}

function normalizeGame(jogo) {
  return {
    ...jogo,
    status: jogo.status || "Pré-jogo",
    allow_aposta: jogo.allow_aposta ?? inferBettableStatus(jogo.status),
    placar: jogo.placar || null,
    mercados: (jogo.mercados || []).map(normalizeMarket)
  };
}

function inferBettableStatus(status) {
  const normalizedStatus = normalizeKeyPart(status || "pre-jogo");
  return ["pre-jogo", "pre jogo", "not started", "time to be defined"].includes(normalizedStatus);
}

const TicketManager = {
  selections: JSON.parse(localStorage.getItem(STORAGE_KEYS.ticket) || "[]"),

  init() {
    const normalizedSelections = this.withoutMarketConflicts(this.selections);
    if (normalizedSelections.length !== this.selections.length) {
      this.selections = normalizedSelections;
      this.save();
    }

    const stakeInput = document.getElementById("valor-aposta");
    if (stakeInput) {
      stakeInput.value = localStorage.getItem(STORAGE_KEYS.stake) || "";
      stakeInput.addEventListener("input", () => {
        localStorage.setItem(STORAGE_KEYS.stake, stakeInput.value);
        this.render();
      });
    }

    document.getElementById("limpar-ticket")?.addEventListener("click", () => this.clear());
    document.getElementById("gerar-codigo")?.addEventListener("click", () => this.generateCode());
    this.render();
  },

  save() {
    localStorage.setItem(STORAGE_KEYS.ticket, JSON.stringify(this.selections));
  },

  add(selection) {
    const frozenSelection = {
      id: `${selection.gameId}-${selection.mercado}-${selection.opcao}`,
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

    const code = createBetCode();
    const bet = {
      codigo: code,
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
      display.innerHTML = `
        <div class="receipt-card">
          <small>Código gerado</small>
          <strong class="receipt-code">${escapeHTML(code)}</strong>
          <div class="receipt-line"><span>Odd total</span><strong>${formatOdd(bet.odd_total)}</strong></div>
          <div class="receipt-line"><span>Retorno</span><strong>${currency.format(bet.retorno)}</strong></div>
          <small>Odd salva no momento da emissão. QR Code pode ser integrado depois.</small>
        </div>
      `;
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
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
}

function saveBetHistory(history) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
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

async function refreshHistoryFromSupabase() {
  if (!window.BetLocalSupabase?.isEnabled()) return getBetHistory();

  try {
    const remoteHistory = await window.BetLocalSupabase.fetchBets();
    if (remoteHistory.length) {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(remoteHistory));
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
    gameId: jogo.id,
    jogo: `${jogo.time_casa} x ${jogo.time_fora}`,
    campeonato: jogo.campeonato,
    mercado,
    opcao,
    odd: Number(odd)
  };
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

  const groups = jogos.reduce((acc, jogo) => {
    acc[jogo.campeonato] = (acc[jogo.campeonato] || 0) + 1;
    return acc;
  }, {});

  list.innerHTML = `
    <li><button class="active" type="button" data-league="all"><span>Todos os campeonatos</span><small>${jogos.length}</small></button></li>
    ${Object.entries(groups).map(([league, count]) => `
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

window.BetLocal = {
  fetchJogos,
  TicketManager,
  getBetHistory,
  saveBetHistory,
  syncBetStatusToSupabase,
  refreshHistoryFromSupabase,
  makeSelection,
  renderOddButton,
  renderTeamLogo,
  getInitials,
  wireOddButtons,
  isGameBettable,
  currency,
  formatOdd,
  escapeHTML
};
