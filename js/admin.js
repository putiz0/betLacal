const MANUAL_STATUS_OPTIONS = ["Cancelada", "Paga"];

document.addEventListener("DOMContentLoaded", () => {
  window.BetLocalTenant.requireRoles(["dono", "operador", "super_admin"], initAdmin);
});

function initAdmin(session) {
  const client = window.BetLocalTenant.getCurrentClient();

  // Mostra info do cliente e usuário
  const clientNameEl = document.getElementById("admin-client-name");
  const userEl = document.getElementById("admin-user");
  if (clientNameEl) clientNameEl.textContent = `🏠 ${client?.tema?.nome_sistema || client?.nome || "Casa"}`;
  if (userEl && session) userEl.textContent = `👤 ${session.role}`;

  // Logout
  document.getElementById("admin-logout")?.addEventListener("click", () => {
    window.BetLocalTenant.signOut();
  });

  // Filtros
  const searchInput = document.getElementById("buscar-codigo");
  const statusFilter = document.getElementById("filter-status");
  const dateFilter = document.getElementById("filter-date");

  const applyFilters = () => renderAdmin();
  searchInput?.addEventListener("input", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
  dateFilter?.addEventListener("change", applyFilters);
  document.getElementById("limpar-busca")?.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "all";
    dateFilter.value = "";
    renderAdmin();
  });

  // Conferir resultados
  document.getElementById("conferir-resultados")?.addEventListener("click", settleOpenBets);

  // Eventos
  window.addEventListener("betlocal:history-updated", renderAdmin);
  renderAdmin();
  window.BetLocal.refreshHistoryFromSupabase().then(renderAdmin);

  // Usuários
  initUserManagement();

  // Links de acesso
  renderAccessLinks();
  renderClientInfo();
}

function renderAdmin() {
  const history = window.BetLocal.getBetHistory();
  const query = (document.getElementById("buscar-codigo")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("filter-status")?.value || "all";
  const dateFilter = document.getElementById("filter-date")?.value || "";

  let filtered = history;

  if (query) {
    filtered = filtered.filter(bet => bet.codigo.toLowerCase().includes(query));
  }
  if (statusFilter !== "all") {
    filtered = filtered.filter(bet => bet.status === statusFilter);
  }
  if (dateFilter) {
    const filterDate = new Date(dateFilter).toISOString().slice(0, 10);
    filtered = filtered.filter(bet => bet.data_iso?.slice(0, 10) === filterDate);
  }

  renderStats(history);
  renderTable(filtered, query || statusFilter !== "all" || dateFilter);
  renderInsights(history);
}

function renderStats(history) {
  const totals = getFinancialTotals(history);
  const openBets = history.filter(bet => bet.status === "Aberta").length;
  const wonPending = history.filter(bet => bet.status === "Ganha" && bet.pagamento !== "Pago").length;
  const totalBets = history.length;

  const stats = document.getElementById("admin-stats");
  if (!stats) return;

  stats.innerHTML = `
    <article class="stat-box">
      <div class="label">Total Apostado</div>
      <div class="value orange">${window.BetLocal.currency.format(totals.totalStaked)}</div>
    </article>
    <article class="stat-box">
      <div class="label">Lucro Líquido</div>
      <div class="value ${totals.net >= 0 ? 'green' : 'red'}">${window.BetLocal.currency.format(totals.net)}</div>
    </article>
    <article class="stat-box">
      <div class="label">Apostas em Aberto</div>
      <div class="value blue">${openBets}</div>
    </article>
    <article class="stat-box">
      <div class="label">Ganhos a Pagar</div>
      <div class="value ${wonPending > 0 ? 'red' : 'green'}">${wonPending}</div>
    </article>
  `;
}

function renderTable(history, isFiltered) {
  const tbody = document.getElementById("tabela-apostas");
  if (!tbody) return;

  if (!history.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; color:var(--muted); padding:30px;">
          ${isFiltered ? "Nenhuma aposta encontrada com esses filtros." : "Nenhuma aposta registrada ainda. Gere um comprovante pela tela de vendas."}
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history.map(bet => `
    <tr>
      <td><span class="bet-code">${window.BetLocal.escapeHTML(bet.codigo)}</span></td>
      <td>${window.BetLocal.escapeHTML(bet.data)}</td>
      <td class="bet-summary">${renderSelectionsSummary(bet)}</td>
      <td>${window.BetLocal.formatOdd(bet.odd_total)}</td>
      <td>${window.BetLocal.currency.format(Number(bet.valor))}</td>
      <td>${window.BetLocal.currency.format(Number(bet.retorno))}</td>
      <td>
        <span class="status ${statusClass(bet.status)}">${window.BetLocal.escapeHTML(bet.status)}</span>
        ${bet.settlement_note ? `<br><small class="settlement-note">${window.BetLocal.escapeHTML(bet.settlement_note)}</small>` : ""}
      </td>
      <td>
        <div class="action-btns">
          ${MANUAL_STATUS_OPTIONS.map(status => `
            <button class="btn ${status === 'Paga' ? 'primary' : ''}" type="button" data-code="${window.BetLocal.escapeHTML(bet.codigo)}" data-status="${status}">
              ${status}
            </button>
          `).join("")}
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-code][data-status]").forEach(button => {
    button.addEventListener("click", () => updateBetStatus(button.dataset.code, button.dataset.status));
  });
}

function renderSelectionsSummary(bet) {
  return (bet.selections || []).map(item => `
    <div>
      <strong>${window.BetLocal.escapeHTML(item.jogo)}</strong><br>
      <small>${window.BetLocal.escapeHTML(item.mercado)}: ${window.BetLocal.escapeHTML(item.opcao)} @ ${window.BetLocal.formatOdd(item.odd)}</small>
      ${item.settlement ? `<br><small>🏁 ${window.BetLocal.escapeHTML(item.settlement)}</small>` : ""}
    </div>
  `).join("");
}

function renderInsights(history) {
  const insights = document.getElementById("admin-insights");
  if (!insights) return;

  const totals = getFinancialTotals(history);
  const allSelections = history.flatMap(bet => bet.selections || []);
  const market = mostCommon(allSelections.map(item => item.mercado));
  const game = mostCommon(allSelections.map(item => item.jogo));
  const avgTicket = history.length ? totals.totalStaked / history.length : 0;
  const winRate = history.length ? (history.filter(b => b.status === "Ganha" || b.status === "Paga").length / history.length * 100).toFixed(1) : 0;

  insights.innerHTML = `
    <article class="insight-item"><span>🎯 Mercado mais feito</span><strong>${window.BetLocal.escapeHTML(market || "Sem dados")}</strong></article>
    <article class="insight-item"><span>⚽ Jogo mais apostado</span><strong>${window.BetLocal.escapeHTML(game || "Sem dados")}</strong></article>
    <article class="insight-item"><span>🎫 Ticket médio</span><strong>${window.BetLocal.currency.format(avgTicket)}</strong></article>
    <article class="insight-item"><span>📈 Taxa de acerto</span><strong>${winRate}%</strong></article>
    <article class="insight-item"><span>💰 Exposição em prêmios</span><strong>${window.BetLocal.currency.format(totals.exposure)}</strong></article>
    <article class="insight-item"><span>🏆 Total de apostas</span><strong>${history.length}</strong></article>
  `;
}

function updateBetStatus(code, status) {
  const history = window.BetLocal.getBetHistory();
  const nextHistory = history.map(bet => {
    if (bet.codigo !== code) return bet;
    return {
      ...bet,
      status,
      pagamento: status === "Paga" ? "Pago" : bet.pagamento,
      atualizado_em: new Date().toLocaleString("pt-BR")
    };
  });
  window.BetLocal.saveBetHistory(nextHistory);
  const updated = nextHistory.find(bet => bet.codigo === code);
  if (updated) window.BetLocal.syncBetUpdateToSupabase(updated);
}

async function settleOpenBets() {
  const button = document.getElementById("conferir-resultados");
  const history = window.BetLocal.getBetHistory();
  const openBets = history.filter(bet => bet.status === "Aberta");
  const ids = openBets.flatMap(bet => (bet.selections || []).map(selection => selection.gameId));

  if (!ids.length) {
    alert("Não há apostas abertas para conferir.");
    return;
  }

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "🔍 Conferindo...";

  try {
    const statuses = await window.BetLocal.fetchFixtureStatuses(ids);
    const statusById = new Map(statuses.map(item => [String(item.id), item]));
    let changed = 0;

    const nextHistory = history.map(bet => {
      if (bet.status !== "Aberta") return bet;
      const settled = settleBet(bet, statusById);
      if (settled !== bet) changed += 1;
      return settled;
    });

    window.BetLocal.saveBetHistory(nextHistory);
    nextHistory
      .filter(bet => openBets.some(openBet => openBet.codigo === bet.codigo))
      .forEach(bet => window.BetLocal.syncBetUpdateToSupabase(bet));

    alert(`${changed} aposta(s) atualizada(s).\nMercados ainda sem resultado continuam abertos.`);
  } catch (error) {
    alert(error.message || "Não foi possível conferir resultados agora. Verifique se o backend está rodando.");
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function settleBet(bet, statusById) {
  let hasPending = false;
  let hasLost = false;
  const settledSelections = (bet.selections || []).map(selection => {
    const fixture = statusById.get(String(selection.gameId));
    const result = settleSelection(selection, fixture);
    if (result.state === "pending") hasPending = true;
    if (result.state === "lost") hasLost = true;
    return {
      ...selection,
      effective_odd: result.effectiveOdd,
      settlement: result.note
    };
  });

  if (hasLost) {
    return {
      ...bet,
      selections: settledSelections,
      status: "Perdida",
      pagamento: "Pendente",
      atualizado_em: new Date().toLocaleString("pt-BR"),
      settlement_note: "Conferida automaticamente."
    };
  }

  if (hasPending) return bet;

  const effectiveOdd = settledSelections.reduce((total, item) => {
    return Number((total * Number(item.effective_odd || item.odd || 1)).toFixed(2));
  }, 1);

  return {
    ...bet,
    selections: settledSelections,
    odd_total: effectiveOdd,
    retorno: Number((Number(bet.valor || 0) * effectiveOdd).toFixed(2)),
    status: "Ganha",
    pagamento: "Pendente",
    atualizado_em: new Date().toLocaleString("pt-BR"),
    settlement_note: "Conferida automaticamente."
  };
}

function settleSelection(selection, fixture) {
  if (!fixture) return { state: "pending", effectiveOdd: selection.odd, note: "Aguardando API." };
  if (fixture.cancelado) return { state: "void", effectiveOdd: 1, note: "Jogo cancelado/adiado: odd virou 1.00." };
  if (!fixture.finalizado) return { state: "pending", effectiveOdd: selection.odd, note: "Jogo ainda não finalizado." };

  const homeGoals = Number(fixture.gols_casa);
  const awayGoals = Number(fixture.gols_fora);
  const result = evaluateSimpleMarket(selection, fixture, homeGoals, awayGoals);
  if (result === null) return { state: "pending", effectiveOdd: selection.odd, note: "Mercado ainda não automático." };
  return {
    state: result ? "won" : "lost",
    effectiveOdd: result ? selection.odd : 0,
    note: result ? "Seleção ganhou." : "Seleção perdeu."
  };
}

function evaluateSimpleMarket(selection, fixture, homeGoals, awayGoals) {
  const market = normalize(selection.mercado);
  const option = normalize(selection.opcao);
  const home = normalize(fixture.time_casa);
  const away = normalize(fixture.time_fora);
  const totalGoals = homeGoals + awayGoals;

  if (market === "resultado final") {
    if (homeGoals > awayGoals) return option === home;
    if (awayGoals > homeGoals) return option === away;
    return option === "empate";
  }

  if (market === "ambas marcam") {
    const bothScore = homeGoals > 0 && awayGoals > 0;
    return option === "sim" ? bothScore : option === "nao" ? !bothScore : null;
  }

  if (market === "total de gols") {
    const line = Number((selection.opcao.match(/(\d+(?:[.,]\d+)?)/) || [])[1]?.replace(",", "."));
    if (!Number.isFinite(line)) return null;
    if (option.includes("mais de")) return totalGoals > line;
    if (option.includes("menos de")) return totalGoals < line;
  }

  if (market === "placar correto") {
    const score = option.replace(/\s+/g, "").replace(":", "x");
    return score === `${homeGoals}x${awayGoals}`;
  }

  return null;
}

function getFinancialTotals(history) {
  return history.reduce((acc, bet) => {
    const value = Number(bet.valor || 0);
    const returnValue = Number(bet.retorno || 0);

    if (bet.status !== "Cancelada") acc.totalStaked += value;
    if (bet.status === "Perdida") acc.grossProfit += value;
    if (bet.status === "Ganha" || bet.status === "Paga") acc.prizes += returnValue;
    if (bet.status === "Aberta" || bet.status === "Ganha") acc.exposure += returnValue;
    acc.net = acc.grossProfit - acc.prizes;

    return acc;
  }, { totalStaked: 0, grossProfit: 0, prizes: 0, exposure: 0, net: 0 });
}

function mostCommon(values) {
  const counts = values.filter(Boolean).reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function statusClass(status) {
  return normalize(status || "Aberta").replace(/\s+/g, "-");
}

/* ========== Gerenciamento de usuários ========== */

function initUserManagement() {
  const form = document.getElementById("user-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const client = window.BetLocalTenant.getCurrentClient();
    const session = window.BetLocalTenant.getSession();

    const role = String(data.get("role"));
    if (session?.role !== "dono" && role === "dono") {
      alert("Apenas o dono pode criar outro dono.");
      return;
    }

    const newUser = {
      nome: String(data.get("nome")).trim(),
      email: String(data.get("email")).trim().toLowerCase(),
      senha_demo: String(data.get("senha")),
      role
    };

    try {
      window.BetLocalTenant.addUserToClient(client.id, newUser);
      e.currentTarget.reset();
      renderUsers();
      alert(`✅ Usuário "${newUser.nome}" (${newUser.role}) criado com sucesso!`);
    } catch (err) {
      alert(err.message || "Não foi possível adicionar usuário.");
    }
  });

  renderUsers();
}

function renderUsers() {
  const tbody = document.getElementById("usuarios-tbody");
  if (!tbody) return;

  const client = window.BetLocalTenant.getCurrentClient();
  const session = window.BetLocalTenant.getSession();
  const users = client?.usuarios || [];

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--muted); padding:20px;">Nenhum usuário cadastrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = users.map(user => `
    <tr>
      <td>${window.BetLocal.escapeHTML(user.nome)}</td>
      <td>${window.BetLocal.escapeHTML(user.email)}</td>
      <td><span class="status ${statusClass(user.role)}">${window.BetLocal.escapeHTML(user.role)}</span></td>
      <td>
        <div class="action-btns">
          ${session?.role === "dono" && session?.email !== user.email ? `
            <button class="btn" data-user-email="${window.BetLocal.escapeHTML(user.email)}" data-action="remove">🗑️ Remover</button>
          ` : `<span style="color:var(--muted); font-size:0.8rem;">—</span>`}
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-action=\"remove\"]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm(`Remover o usuário ${btn.dataset.userEmail}?`)) return;
      const client = window.BetLocalTenant.getCurrentClient();
      try {
        window.BetLocalTenant.removeUserFromClient(client.id, btn.dataset.userEmail);
        renderUsers();
      } catch (err) {
        alert(err.message);
      }
    });
  });
}

/* ========== Links de acesso ========== */

function renderAccessLinks() {
  const client = window.BetLocalTenant.getCurrentClient();
  const base = window.location.origin + window.location.pathname.replace("admin.html", "");
  const vendasUrl = `${base}index.html?cliente=${encodeURIComponent(client.id)}`;
  const adminUrl = `${base}login.html?cliente=${encodeURIComponent(client.id)}`;

  const vendasCode = document.getElementById("link-vendas");
  const adminCode = document.getElementById("link-admin");
  if (vendasCode) vendasCode.textContent = vendasUrl;
  if (adminCode) adminCode.textContent = adminUrl;

  document.getElementById("copy-vendas")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(vendasUrl).then(() => alert("🔗 Link da tela de vendas copiado!"));
  });
  document.getElementById("copy-admin")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(adminUrl).then(() => alert("🔐 Link do painel copiado!"));
  });
}

function renderClientInfo() {
  const client = window.BetLocalTenant.getCurrentClient();
  const box = document.getElementById("client-info");
  if (!box || !client) return;

  const status = window.BetLocalTenant.computedLicenseStatus(client);
  const days = window.BetLocalTenant.daysRemaining(client);
  const plan = window.BetLocalTenant.plans[client.plano];

  box.innerHTML = `
    <div><strong>🏠 Nome:</strong> ${window.BetLocal.escapeHTML(client.nome)}</div>
    <div><strong>📧 Email:</strong> ${window.BetLocal.escapeHTML(client.email)}</div>
    <div><strong>📦 Plano:</strong> ${window.BetLocal.escapeHTML(plan?.nome || client.plano)}</div>
    <div><strong>📅 Vencimento:</strong> ${window.BetLocal.escapeHTML(client.vencimento)}</div>
    <div><strong>⏳ Dias restantes:</strong> ${days}</div>
    <div><strong>🚦 Status:</strong> <span class="status ${status}">${window.BetLocal.escapeHTML(status)}</span></div>
    <div><strong>🎨 Tema:</strong> ${window.BetLocal.escapeHTML(client.tema?.nome_sistema || client.nome)}</div>
    <div><strong>👥 Usuários:</strong> ${client.usuarios?.length || 0}</div>
  `;
}
