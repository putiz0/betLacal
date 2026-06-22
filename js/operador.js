const ITENS_POR_PAGINA_OP = 50;

document.addEventListener("DOMContentLoaded", () => {
  window.BetLocalTenant.requireRoles(["operador", "dono", "super_admin"], initOperador);
});

function initOperador(session) {
  const userEl = document.getElementById("operador-user");
  if (userEl && session) userEl.textContent = `👤 ${session.email}`;

  document.querySelectorAll("[data-role]").forEach(el => {
    el.style.display = el.dataset.role === session?.role ? "" : "none";
  });

  document.getElementById("operador-logout")?.addEventListener("click", () => {
    window.BetLocalTenant.signOut();
  });

  initCaixaForm("caixa-form", "caixa-fechar-form", {
    btnAbrirId: "btn-abrir-caixa",
    btnFecharId: "btn-fechar-caixa",
    indicatorId: "caixa-indicator",
    caixaInfoId: "caixa-info",
    historicoId: "historico-caixa",
  });
  initBilhetes();
  initClientesForm("cliente-form", "lista-clientes", "cliente-detalhes", "cliente-historico-conteudo");
  initQRModal();

  renderDashboard();
  initFinancas();
  window.addEventListener("betlocal:history-updated", () => {
    renderDashboard();
    initFinancas();
  });
}

function renderDashboard() {
  const history = window.BetLocal.getBetHistory();
  const today = new Date().toISOString().slice(0, 10);
  const todayBets = history.filter(b => b.data_iso?.slice(0, 10) === today);

  renderStatsOp(todayBets, history);
  renderInsightsOp(todayBets, history);
  updateCaixaIndicator("caixa-indicator");
}

function renderStatsOp(todayBets, allBets) {
  const stats = document.getElementById("operador-stats");
  if (!stats) return;

  const totals = getFinancialTotals(todayBets);
  const openBets = todayBets.filter(b => b.status === "Aberta").length;
  const wonPending = todayBets.filter(b => b.status === "Ganha" && b.pagamento !== "Pago").length;

  stats.innerHTML = `
    <article class="stat-box-op">
      <div class="label">Entradas Hoje</div>
      <div class="value orange">${window.BetLocal.currency.format(totals.totalStaked)}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">Lucro/Prejuízo</div>
      <div class="value ${totals.net >= 0 ? 'green' : 'red'}">${window.BetLocal.currency.format(totals.net)}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">Bilhetes em Aberto</div>
      <div class="value blue">${openBets}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">Prêmios a Pagar</div>
      <div class="value ${wonPending > 0 ? 'red' : 'green'}">${wonPending}</div>
    </article>
  `;
}

function renderInsightsOp(todayBets, allBets) {
  const insights = document.getElementById("operador-insights");
  if (!insights) return;

  const totals = getFinancialTotals(todayBets);
  const allSelections = todayBets.flatMap(b => b.selections || []);
  const market = mostCommon(allSelections.map(s => s.mercado));
  const game = mostCommon(allSelections.map(s => s.jogo));
  const avgTicket = todayBets.length ? totals.totalStaked / todayBets.length : 0;
  const winRate = todayBets.length ? (todayBets.filter(b => b.status === "Ganha" || b.status === "Paga").length / todayBets.length * 100).toFixed(1) : 0;

  insights.innerHTML = `
    <article class="insight-item-op"><span>🎯 Mercado mais feito</span><strong>${window.BetLocal.escapeHTML(market || "Sem dados")}</strong></article>
    <article class="insight-item-op"><span>⚽ Jogo mais apostado</span><strong>${window.BetLocal.escapeHTML(game || "Sem dados")}</strong></article>
    <article class="insight-item-op"><span>🎫 Ticket médio hoje</span><strong>${window.BetLocal.currency.format(avgTicket)}</strong></article>
    <article class="insight-item-op"><span>📈 Taxa de acerto hoje</span><strong>${winRate}%</strong></article>
    <article class="insight-item-op"><span>💰 Exposição em prêmios</span><strong>${window.BetLocal.currency.format(totals.exposure)}</strong></article>
    <article class="insight-item-op"><span>🏆 Total de bilhetes hoje</span><strong>${todayBets.length}</strong></article>
  `;
}

let opPaginaAtual = 1;

function initBilhetes() {
  const searchInput = document.getElementById("buscar-bilhete");
  const statusFilter = document.getElementById("filter-status-bilhete");
  const dateFilter = document.getElementById("filter-date-bilhete");

  const applyFilters = debounce(() => { opPaginaAtual = 1; renderBilhetes(); }, 250);
  searchInput?.addEventListener("input", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
  dateFilter?.addEventListener("change", applyFilters);
  document.getElementById("limpar-bilhete")?.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "all";
    dateFilter.value = "";
    opPaginaAtual = 1;
    renderBilhetes();
  });

  document.getElementById("exportar-csv-op")?.addEventListener("click", () => {
    const history = window.BetLocal.getBetHistory();
    const data = history.map(b => ({
      Codigo: b.codigo,
      Data: b.data,
      Status: b.status,
      Valor: b.valor,
      Retorno: b.retorno,
      Odd: b.odd_total,
      Cliente: b.cliente_nome || "",
      Telefone: b.cliente_telefone || "",
    }));
    exportCSV(data, `bilhetes-${new Date().toISOString().slice(0, 10)}.csv`);
  });

  window.addEventListener("betlocal:history-updated", renderBilhetes);
  renderBilhetes();
}

function renderBilhetes() {
  const tbody = document.getElementById("tabela-bilhetes");
  if (!tbody) return;

  let history = window.BetLocal.getBetHistory();
  const query = (document.getElementById("buscar-bilhete")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("filter-status-bilhete")?.value || "all";
  const dateFilter = document.getElementById("filter-date-bilhete")?.value || "";

  if (query) {
    history = history.filter(b =>
      b.codigo.toLowerCase().includes(query) ||
      (b.cliente_nome || "").toLowerCase().includes(query) ||
      (b.cliente_telefone || "").toLowerCase().includes(query)
    );
  }
  if (statusFilter !== "all") {
    history = history.filter(b => b.status === statusFilter);
  }
  if (dateFilter) {
    const filterDate = new Date(dateFilter).toISOString().slice(0, 10);
    history = history.filter(b => b.data_iso?.slice(0, 10) === filterDate);
  }

  const totalPaginas = Math.max(1, Math.ceil(history.length / ITENS_POR_PAGINA_OP));
  if (opPaginaAtual > totalPaginas) opPaginaAtual = totalPaginas;
  const inicio = (opPaginaAtual - 1) * ITENS_POR_PAGINA_OP;
  const pagina = history.slice(inicio, inicio + ITENS_POR_PAGINA_OP);

  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state"><div class="empty-text">Nenhum bilhete encontrado.</div></td></tr>`;
    return;
  }

  tbody.innerHTML = pagina.map(bet => `
    <tr>
      <td><span class="bet-code-op">${window.BetLocal.escapeHTML(bet.codigo)}</span></td>
      <td>${window.BetLocal.escapeHTML(bet.data)}</td>
      <td>${window.BetLocal.escapeHTML(bet.cliente_nome || "—")}<br><small style="color:var(--muted);">${window.BetLocal.escapeHTML(bet.cliente_telefone || "")}</small></td>
      <td class="bet-summary">${renderSelectionsSummary(bet)}</td>
      <td>${window.BetLocal.currency.format(Number(bet.valor))}</td>
      <td>${window.BetLocal.currency.format(Number(bet.retorno))}</td>
      <td><span class="status ${statusClass(bet.status)}">${window.BetLocal.escapeHTML(bet.status)}</span></td>
      <td>
        <div class="action-btns-op">
          <button class="btn primary" data-action="qr" data-code="${window.BetLocal.escapeHTML(bet.codigo)}">📱 QR</button>
          <button class="btn" data-action="whatsapp" data-code="${window.BetLocal.escapeHTML(bet.codigo)}">📱 WApp</button>
          <button class="btn" data-action="telegram" data-code="${window.BetLocal.escapeHTML(bet.codigo)}">✈️ TG</button>
          <button class="btn" data-action="print" data-code="${window.BetLocal.escapeHTML(bet.codigo)}">🖨️</button>
        </div>
      </td>
    </tr>
  `).join("") + `
    <tr class="pagination-row">
      <td colspan="8">
        <div class="pagination">
          <button class="page-prev" ${opPaginaAtual <= 1 ? "disabled" : ""}>‹ Anterior</button>
          <span class="page-info">Página ${opPaginaAtual} de ${totalPaginas} (${history.length} registros)</span>
          <button class="page-next" ${opPaginaAtual >= totalPaginas ? "disabled" : ""}>Próxima ›</button>
        </div>
      </td>
    </tr>
  `;

  tbody.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleBilheteAction(btn.dataset.action, btn.dataset.code));
  });

  tbody.querySelector(".page-prev")?.addEventListener("click", () => {
    if (opPaginaAtual > 1) { opPaginaAtual--; renderBilhetes(); }
  });
  tbody.querySelector(".page-next")?.addEventListener("click", () => {
    if (opPaginaAtual < totalPaginas) { opPaginaAtual++; renderBilhetes(); }
  });
}

function handleBilheteAction(action, code) {
  const history = window.BetLocal.getBetHistory();
  const bet = history.find(b => b.codigo === code);
  if (!bet) return;

  switch (action) {
    case "qr": showQRModal(bet); break;
    case "whatsapp": shareWhatsApp(bet); break;
    case "telegram": shareTelegram(bet); break;
    case "print": printBilhete(bet); break;
  }
}

function showQRModal(bet) {
  const modal = document.getElementById("modal-qr");
  const container = document.getElementById("qr-container");
  if (!modal || !container) return;

  const url = `${window.location.origin}/verificar.html?codigo=${encodeURIComponent(bet.codigo)}`;
  container.innerHTML = `<div id="qr-canvas"></div><div class="code-text">${bet.codigo}</div>`;

  QRCode.toCanvas(document.getElementById("qr-canvas"), url, { width: 200, margin: 2 }, (err) => {
    if (err) console.error(err);
  });

  document.getElementById("qr-whatsapp").onclick = () => shareWhatsApp(bet);
  document.getElementById("qr-telegram").onclick = () => shareTelegram(bet);
  document.getElementById("qr-instagram").onclick = () => shareInstagram(bet);
  document.getElementById("qr-facebook").onclick = () => shareFacebook(bet);
  document.getElementById("qr-print").onclick = () => printBilhete(bet);
  document.getElementById("qr-fechar").onclick = () => modal.style.display = "none";

  modal.style.display = "grid";
  modal.querySelector("button")?.focus();
}

function initQRModal() {
  const modal = document.getElementById("modal-qr");
  modal?.addEventListener("click", (e) => {
    if (e.target.id === "modal-qr") e.target.style.display = "none";
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.style.display === "grid") {
      modal.style.display = "none";
    }
  });
}

function shareWhatsApp(bet) {
  const msg = window.BetLocal.buildWhatsAppMessage(bet);
  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
}

function shareTelegram(bet) {
  const msg = window.BetLocal.buildWhatsAppMessage(bet);
  window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(msg)}`, "_blank");
}

function shareInstagram(bet) {
  showToast(`📸 Para Instagram: tire print do QR Code e poste nos Stories. Código: ${bet.codigo}`, "info", 6000);
}

function shareFacebook(bet) {
  const msg = window.BetLocal.buildWhatsAppMessage(bet);
  window.open(`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(msg)}`, "_blank");
}

function printBilhete(bet) {
  const printWindow = window.open("", "_blank");
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bilhete ${bet.codigo}</title>
      <style>
        body { font-family: monospace; max-width: 320px; margin: 20px auto; padding: 20px; border: 2px dashed #333; }
        h2 { text-align: center; margin: 0 0 10px; }
        .code { text-align: center; font-size: 1.5rem; font-weight: bold; margin: 10px 0; }
        .line { border-top: 1px dashed #333; margin: 8px 0; padding-top: 8px; }
        .total { font-size: 1.2rem; font-weight: bold; text-align: center; margin-top: 10px; }
        .footer { text-align: center; font-size: 0.8rem; margin-top: 20px; color: #666; }
      </style>
    </head>
    <body>
      <h2>🎫 BET LOCAL</h2>
      <div class="code">${bet.codigo}</div>
      <div class="line">Data: ${bet.data}</div>
      ${bet.selections.map(s => `
        <div class="line">
          <strong>${s.jogo}</strong><br>
          ${s.mercado}: ${s.opcao} @ ${s.odd}
        </div>
      `).join("")}
      <div class="line total">
        Odd: ${bet.odd_total}<br>
        Valor: R$ ${bet.valor.toFixed(2)}<br>
        Retorno: R$ ${bet.retorno.toFixed(2)}
      </div>
      <div class="footer">Boa sorte! 🍀</div>
    </body>
    </html>
  `;
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
}

/* ========== FINANÇAS ========== */

function initFinancas() {
  renderFinancasStats();
  renderChartSemana();
  renderDonutStatus();
  renderTopClientes();
  renderUltimosFechamentos();
}

function renderFinancasStats() {
  const el = document.getElementById("financas-stats");
  if (!el) return;
  const history = window.BetLocal.getBetHistory();
  const totals = getFinancialTotals(history);
  const ganhas = history.filter(b => b.status === "Ganha" || b.status === "Paga");
  const pagas = history.filter(b => b.status === "Paga");
  const premiosPagos = pagas.reduce((s, b) => s + Number(b.retorno || 0), 0);
  const aReceber = ganhas.reduce((s, b) => s + Number(b.retorno || 0), 0) - premiosPagos;

  el.innerHTML = `
    <article class="stat-box-op">
      <div class="label">💰 Total Entradas</div>
      <div class="value orange">${window.BetLocal.currency.format(totals.totalStaked)}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">📊 Lucro Líquido</div>
      <div class="value ${totals.net >= 0 ? 'green' : 'red'}">${window.BetLocal.currency.format(totals.net)}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">🏆 Prêmios Pagos</div>
      <div class="value ${premiosPagos > 0 ? 'red' : 'green'}">${window.BetLocal.currency.format(premiosPagos)}</div>
    </article>
    <article class="stat-box-op">
      <div class="label">⏳ Prêmios a Receber</div>
      <div class="value ${aReceber > 0 ? 'blue' : 'green'}">${window.BetLocal.currency.format(aReceber)}</div>
    </article>
  `;
}

function renderChartSemana() {
  const container = document.getElementById("chart-financas-semana");
  if (!container) return;

  const history = window.BetLocal.getBetHistory();
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
    const dayBets = history.filter(b => (b.data_iso || "").slice(0, 10) === key);
    const total = dayBets.reduce((s, b) => s + Number(b.valor || 0), 0);
    const lucro = getFinancialTotals(dayBets).net;
    dias.push({ label, total, lucro });
  }

  const maxVal = Math.max(...dias.map(d => Math.abs(d.total)), 1);
  const cores = ["#ff5a16", "#24d982"];

  container.innerHTML = dias.map(d => {
    const h = Math.max(4, (d.total / maxVal) * 140);
    const lucroH = Math.max(2, (Math.abs(d.lucro) / maxVal) * 140);
    return `<div class="chart-bar-group">
      <div style="display:flex;gap:3px;align-items:flex-end;height:140px;">
        <div class="chart-bar" style="height:${h}px;background:${cores[0]};width:50%;" title="Entradas: R$ ${d.total.toFixed(2)}"></div>
        <div class="chart-bar" style="height:${lucroH}px;background:${d.lucro >= 0 ? cores[1] : '#ff5f5f'};width:50%;" title="${d.lucro >= 0 ? 'Lucro' : 'Prejuízo'}: R$ ${d.lucro.toFixed(2)}"></div>
      </div>
      <span class="chart-bar-label">${d.label}</span>
    </div>`;
  }).join("");
}

function renderDonutStatus() {
  const wrapper = document.getElementById("donut-status");
  const legend = document.getElementById("donut-legend");
  if (!wrapper || !legend) return;

  const history = window.BetLocal.getBetHistory();
  const statuses = ["Aberta", "Ganha", "Perdida", "Paga", "Cancelada"];
  const cores = { Aberta: "#60a5fa", Ganha: "#24d982", Perdida: "#ff5f5f", Paga: "#34d399", Cancelada: "#8b92a8" };
  const labels = { Aberta: "Abertas", Ganha: "Ganhas", Perdida: "Perdidas", Paga: "Pagas", Cancelada: "Canceladas" };

  const counts = {};
  let total = 0;
  statuses.forEach(s => { counts[s] = history.filter(b => b.status === s).length; total += counts[s]; });

  const center = wrapper.querySelector(".donut-center");
  if (center) center.textContent = total;

  const parts = statuses.filter(s => counts[s] > 0);
  const totalSlice = parts.reduce((acc, s) => acc + counts[s], 0) || 1;
  let conic = parts.map((s, i) => {
    const pct = (counts[s] / totalSlice) * 360;
    const start = parts.slice(0, i).reduce((acc, p) => acc + (counts[p] / totalSlice) * 360, 0);
    return `${cores[s]} ${start}deg ${start + pct}deg`;
  }).join(",");

  wrapper.style.background = total > 0 ? `conic-gradient(${conic})` : "var(--muted-line)";
  wrapper.style.borderRadius = "50%";

  legend.innerHTML = parts.map(s => `
    <div class="donut-legend-item">
      <span class="donut-legend-dot" style="background:${cores[s]};"></span>
      ${labels[s]}: ${counts[s]}
    </div>
  `).join("");
}

function renderTopClientes() {
  const el = document.getElementById("top-clientes");
  if (!el) return;
  const history = window.BetLocal.getBetHistory();
  const byCliente = {};
  history.forEach(b => {
    const nome = b.cliente_nome || "Walk-in";
    if (!byCliente[nome]) byCliente[nome] = { total: 0, count: 0 };
    byCliente[nome].total += Number(b.valor || 0);
    byCliente[nome].count++;
  });
  const sorted = Object.entries(byCliente).sort((a, b) => b[1].total - a[1].total).slice(0, 10);

  if (!sorted.length) {
    el.innerHTML = `<div style="color:var(--muted);text-align:center;padding:20px;">Nenhum cliente ainda.</div>`;
    return;
  }

  el.innerHTML = sorted.map(([nome, data]) => `
    <div class="financas-cliente-item">
      <span class="financas-cliente-name">${window.BetLocal.escapeHTML(nome)}</span>
      <span>
        <span class="financas-cliente-value">${window.BetLocal.currency.format(data.total)}</span>
        <span style="color:var(--muted);font-size:0.78rem;"> (${data.count} bets)</span>
      </span>
    </div>
  `).join("");
}

function renderUltimosFechamentos() {
  const el = document.getElementById("ultimos-fechamentos");
  if (!el) return;
  const caixa = getCaixa();
  const historico = caixa?.historico || [];
  const fechamentos = historico.filter(t => t.fechadoEm).sort((a, b) => new Date(b.fechadoEm) - new Date(a.fechadoEm)).slice(0, 5);

  if (!fechamentos.length) {
    el.innerHTML = `<div style="color:var(--muted);text-align:center;padding:20px;">Nenhum fechamento ainda.</div>`;
    return;
  }

  el.innerHTML = fechamentos.map(t => {
    const diff = Number(t.valor_final || 0) - Number(t.valor_inicial || 0);
    const diffClass = diff >= 0 ? "positivo" : "negativo";
    const diffLabel = diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2);
    return `<div class="financas-fechamento-item">
      <div>
        <div class="financas-fechamento-data">${new Date(t.fechadoEm).toLocaleDateString("pt-BR")} ${new Date(t.fechadoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
        <div style="font-size:0.75rem;color:var(--muted);">${window.BetLocal.escapeHTML(t.operador || "")}</div>
      </div>
      <div style="text-align:right;">
        <div class="financas-fechamento-valor">${window.BetLocal.currency.format(Number(t.valor_final || 0))}</div>
        <div class="financas-fechamento-diff ${diffClass}">${diffLabel}</div>
      </div>
    </div>`;
  }).join("");
}

window.BetLocalOperador = {
  getCaixa,
  getClientes,
  getLimite: () => {
    try { return JSON.parse(localStorage.getItem("betlocal.operador.limite") || "1000"); }
    catch { return 1000; }
  },
  showQRModal,
  shareWhatsApp,
  printBilhete,
};
