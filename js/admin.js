const STATUS_OPTIONS = ["Aberta", "Ganha", "Perdida", "Cancelada", "Paga"];

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("buscar-codigo");
  document.getElementById("limpar-busca")?.addEventListener("click", () => {
    searchInput.value = "";
    renderAdmin();
  });

  searchInput?.addEventListener("input", renderAdmin);
  window.addEventListener("betlocal:history-updated", renderAdmin);
  renderAdmin();
  window.BetLocal.refreshHistoryFromSupabase().then(renderAdmin);
});

function renderAdmin() {
  const history = window.BetLocal.getBetHistory();
  const query = (document.getElementById("buscar-codigo")?.value || "").trim().toLowerCase();
  const filtered = query
    ? history.filter((bet) => bet.codigo.toLowerCase().includes(query))
    : history;

  renderStats(history);
  renderTable(filtered, query);
  renderInsights(history);
}

function renderStats(history) {
  const totals = getFinancialTotals(history);
  const openBets = history.filter((bet) => bet.status === "Aberta").length;
  const paidBets = history.filter((bet) => bet.status === "Paga").length;

  document.getElementById("admin-stats").innerHTML = `
    <article class="stat-card"><span>Total do dia</span><strong>${window.BetLocal.currency.format(totals.totalDay)}</strong></article>
    <article class="stat-card"><span>Apostas abertas</span><strong>${openBets}</strong></article>
    <article class="stat-card"><span>Lucro bruto</span><strong>${window.BetLocal.currency.format(totals.profit)}</strong></article>
    <article class="stat-card"><span>Pagas</span><strong>${paidBets}</strong></article>
  `;
}

function renderTable(history, query) {
  const tbody = document.getElementById("tabela-apostas");
  if (!tbody) return;

  if (!history.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">${query ? "Nenhuma aposta encontrada para esse código." : "Nenhuma aposta registrada ainda. Gere um comprovante pela tela de vendas."}</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = history.map((bet) => `
    <tr>
      <td><strong>${window.BetLocal.escapeHTML(bet.codigo)}</strong></td>
      <td>${window.BetLocal.escapeHTML(bet.data)}</td>
      <td>${renderSelectionsSummary(bet)}</td>
      <td>${window.BetLocal.formatOdd(bet.odd_total)}</td>
      <td>${window.BetLocal.currency.format(Number(bet.valor))}</td>
      <td>${window.BetLocal.currency.format(Number(bet.retorno))}</td>
      <td><span class="status ${statusClass(bet.status)}">${window.BetLocal.escapeHTML(bet.status)}</span></td>
      <td>
        <div class="action-row">
          ${STATUS_OPTIONS.map((status) => `
            <button class="status-btn" type="button" data-code="${window.BetLocal.escapeHTML(bet.codigo)}" data-status="${status}">
              ${status}
            </button>
          `).join("")}
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-code][data-status]").forEach((button) => {
    button.addEventListener("click", () => updateBetStatus(button.dataset.code, button.dataset.status));
  });
}

function renderSelectionsSummary(bet) {
  return (bet.selections || []).map((item) => `
    <div>
      <strong>${window.BetLocal.escapeHTML(item.jogo)}</strong><br>
      <small>${window.BetLocal.escapeHTML(item.mercado)}: ${window.BetLocal.escapeHTML(item.opcao)} @ ${window.BetLocal.formatOdd(item.odd)}</small>
    </div>
  `).join("");
}

function renderInsights(history) {
  const insights = document.getElementById("admin-insights");
  if (!insights) return;

  const totals = getFinancialTotals(history);
  const market = mostCommon(history.flatMap((bet) => bet.selections || []).map((item) => item.mercado));
  const game = mostCommon(history.flatMap((bet) => bet.selections || []).map((item) => item.jogo));
  const avgTicket = history.length ? totals.totalDay / history.length : 0;

  insights.innerHTML = `
    <article class="insight-card"><span>Mercado mais feito</span><strong>${window.BetLocal.escapeHTML(market || "Sem dados")}</strong></article>
    <article class="insight-card"><span>Jogo mais apostado</span><strong>${window.BetLocal.escapeHTML(game || "Sem dados")}</strong></article>
    <article class="insight-card"><span>Ticket médio</span><strong>${window.BetLocal.currency.format(avgTicket)}</strong></article>
    <article class="insight-card"><span>Exposição em prêmios</span><strong>${window.BetLocal.currency.format(totals.exposure)}</strong></article>
  `;
}

function updateBetStatus(code, status) {
  const history = window.BetLocal.getBetHistory();
  const nextHistory = history.map((bet) => {
    if (bet.codigo !== code) return bet;
    return {
      ...bet,
      status,
      pagamento: status === "Paga" ? "Pago" : bet.pagamento,
      atualizado_em: new Date().toLocaleString("pt-BR")
    };
  });
  window.BetLocal.saveBetHistory(nextHistory);
  window.BetLocal.syncBetStatusToSupabase(code, status);
}

function getFinancialTotals(history) {
  return history.reduce((acc, bet) => {
    const value = Number(bet.valor || 0);
    const returnValue = Number(bet.retorno || 0);

    if (bet.status !== "Cancelada") acc.totalDay += value;
    if (bet.status === "Perdida") acc.profit += value;
    if (bet.status === "Ganha" || bet.status === "Paga") acc.losses += Math.max(returnValue - value, 0);
    if (bet.status === "Aberta" || bet.status === "Ganha") acc.exposure += returnValue;

    return acc;
  }, { totalDay: 0, profit: 0, losses: 0, exposure: 0 });
}

function mostCommon(values) {
  const counts = values.filter(Boolean).reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function statusClass(status) {
  return String(status || "Aberta")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
