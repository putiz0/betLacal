const OPERADOR_STORAGE = {
  caixa: "betlocal.operador.caixa",
  turnos: "betlocal.operador.turnos",
  clientes: "betlocal.operador.clientes",
  limite: "betlocal.operador.limite",
};

const LIMITE_PADRAO = 1000;

document.addEventListener("DOMContentLoaded", () => {
  window.BetLocalTenant.requireRoles(["operador", "dono", "super_admin"], initOperador);
});

function initOperador(session) {
  const userEl = document.getElementById("operador-user");
  if (userEl && session) userEl.textContent = `👤 ${session.email}`;

  document.getElementById("operador-logout")?.addEventListener("click", () => {
    window.BetLocalTenant.signOut();
  });

  // Caixa
  initCaixa();

  // Bilhetes
  initBilhetes();

  // Clientes
  initClientes();

  // Finanças
  initFinancas();

  // Configurações
  initConfiguracoes();

  // QR Modal
  initQRModal();

  // Render inicial
  renderDashboard();
  window.addEventListener("betlocal:history-updated", renderDashboard);
}

/* ========== DASHBOARD ========== */

function renderDashboard() {
  const history = window.BetLocal.getBetHistory();
  const today = new Date().toISOString().slice(0, 10);
  const todayBets = history.filter(b => b.data_iso?.slice(0, 10) === today);

  renderStats(todayBets, history);
  renderInsights(todayBets, history);
  updateCaixaIndicator();
}

function renderStats(todayBets, allBets) {
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

function renderInsights(todayBets, allBets) {
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

/* ========== CAIXA ========== */

function initCaixa() {
  const caixa = getCaixa();
  const formAbrir = document.getElementById("caixa-form");
  const formFechar = document.getElementById("caixa-fechar-form");
  const btnAbrir = document.getElementById("btn-abrir-caixa");
  const btnFechar = document.getElementById("btn-fechar-caixa");

  if (caixa?.aberto) {
    if (formAbrir) formAbrir.style.display = "none";
    if (formFechar) formFechar.style.display = "grid";
    if (btnAbrir) btnAbrir.style.display = "none";
    if (btnFechar) btnFechar.style.display = "block";
  } else {
    if (formAbrir) formAbrir.style.display = "grid";
    if (formFechar) formFechar.style.display = "none";
    if (btnAbrir) btnAbrir.style.display = "block";
    if (btnFechar) btnFechar.style.display = "none";
  }

  formAbrir?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const valorInicial = Number(data.get("valor_inicial")) || 0;
    const obs = String(data.get("obs") || "");

    const novoCaixa = {
      aberto: true,
      valorInicial,
      obs,
      abertoEm: new Date().toISOString(),
      abertoEmLocal: new Date().toLocaleString("pt-BR"),
      operador: window.BetLocalTenant.getSession()?.email || "operador"
    };

    saveCaixa(novoCaixa);
    addTurno({ tipo: "abertura", valor: valorInicial, obs, data: novoCaixa.abertoEmLocal });

    if (formAbrir) formAbrir.style.display = "none";
    if (formFechar) formFechar.style.display = "grid";
    if (btnAbrir) btnAbrir.style.display = "none";
    if (btnFechar) btnFechar.style.display = "block";
    updateCaixaIndicator();
    renderCaixaInfo();
    renderHistoricoCaixa();
    alert(`✅ Caixa aberto com R$ ${valorInicial.toFixed(2)}`);
  });

  formFechar?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const valorFinal = Number(data.get("valor_final")) || 0;
    const obsFechamento = String(data.get("obs_fechamento") || "");
    const caixaAtual = getCaixa();

    const history = window.BetLocal.getBetHistory();
    const today = new Date().toISOString().slice(0, 10);
    const todayBets = history.filter(b => b.data_iso?.slice(0, 10) === today);
    const totals = getFinancialTotals(todayBets);

    const valorEsperado = caixaAtual.valorInicial + totals.totalStaked - totals.prizes;
    const diferenca = valorFinal - valorEsperado;

    const fechamento = {
      tipo: "fechamento",
      valorInicial: caixaAtual.valorInicial,
      valorFinal,
      valorEsperado,
      diferenca,
      obs: obsFechamento,
      data: new Date().toLocaleString("pt-BR"),
      totalStaked: totals.totalStaked,
      totalPrizes: totals.prizes,
      bilhetes: todayBets.length
    };

    addTurno(fechamento);
    saveCaixa({ aberto: false });

    if (formAbrir) formAbrir.style.display = "grid";
    if (formFechar) formFechar.style.display = "none";
    if (btnAbrir) btnAbrir.style.display = "block";
    if (btnFechar) btnFechar.style.display = "none";
    updateCaixaIndicator();
    renderCaixaInfo();
    renderHistoricoCaixa();

    const relatorio = `
📊 FECHAMENTO DE CAIXA
━━━━━━━━━━━━━━━━━━━━━━
📅 Data: ${fechamento.data}
👤 Operador: ${caixaAtual.operador}

💰 Valor Inicial: R$ ${caixaAtual.valorInicial.toFixed(2)}
📥 Entradas: R$ ${totals.totalStaked.toFixed(2)}
📤 Saídas: R$ ${totals.prizes.toFixed(2)}
📊 Esperado: R$ ${valorEsperado.toFixed(2)}
📊 Contado: R$ ${valorFinal.toFixed(2)}
📊 Diferença: R$ ${diferenca.toFixed(2)} ${diferenca >= 0 ? "(sobra)" : "(quebra)"}

🎫 Bilhetes: ${todayBets.length}
🏆 Lucro/Prejuízo: R$ ${totals.net.toFixed(2)}
    `;
    alert(relatorio);
  });

  btnAbrir?.addEventListener("click", () => {
    document.getElementById("caixa-form")?.scrollIntoView({ behavior: "smooth" });
  });

  btnFechar?.addEventListener("click", () => {
    document.getElementById("caixa-fechar-form")?.scrollIntoView({ behavior: "smooth" });
  });

  renderCaixaInfo();
  renderHistoricoCaixa();
}

function getCaixa() {
  try {
    return JSON.parse(localStorage.getItem(OPERADOR_STORAGE.caixa) || "null");
  } catch { return null; }
}

function saveCaixa(caixa) {
  localStorage.setItem(OPERADOR_STORAGE.caixa, JSON.stringify(caixa));
}

function getTurnos() {
  try {
    return JSON.parse(localStorage.getItem(OPERADOR_STORAGE.turnos) || "[]");
  } catch { return []; }
}

function addTurno(turno) {
  const turnos = getTurnos();
  turnos.unshift(turno);
  localStorage.setItem(OPERADOR_STORAGE.turnos, JSON.stringify(turnos));
}

function updateCaixaIndicator() {
  const indicator = document.getElementById("caixa-indicator");
  if (!indicator) return;
  const caixa = getCaixa();
  if (caixa?.aberto) {
    indicator.textContent = "🟢 Caixa Aberto";
    indicator.className = "caixa-status aberto";
  } else {
    indicator.textContent = "🔴 Caixa Fechado";
    indicator.className = "caixa-status fechado";
  }
}

function renderCaixaInfo() {
  const box = document.getElementById("caixa-info");
  if (!box) return;
  const caixa = getCaixa();
  if (caixa?.aberto) {
    box.innerHTML = `
      <div><strong>🟢 Caixa aberto desde:</strong> ${caixa.abertoEmLocal}</div>
      <div><strong>💵 Valor inicial:</strong> ${window.BetLocal.currency.format(caixa.valorInicial)}</div>
      <div><strong>👤 Operador:</strong> ${window.BetLocal.escapeHTML(caixa.operador)}</div>
      ${caixa.obs ? `<div><strong>📝 Obs:</strong> ${window.BetLocal.escapeHTML(caixa.obs)}</div>` : ""}
    `;
  } else {
    box.innerHTML = `<div>🔴 Nenhum caixa aberto. Abra um turno para começar a operar.</div>`;
  }
}

function renderHistoricoCaixa() {
  const box = document.getElementById("historico-caixa");
  if (!box) return;
  const turnos = getTurnos().slice(0, 10);
  if (!turnos.length) {
    box.innerHTML = `<div style="color:var(--muted); text-align:center; padding:20px;">Nenhum turno registrado.</div>`;
    return;
  }
  box.innerHTML = turnos.map(t => `
    <div class="cliente-card">
      <div class="nome">${t.tipo === "abertura" ? "🔓 Abertura" : "🔒 Fechamento"} — ${t.data}</div>
      <div class="info">Valor: ${window.BetLocal.currency.format(t.valor || t.valorInicial || 0)}</div>
      ${t.diferenca !== undefined ? `<div class="stats"><span>Diferença: ${window.BetLocal.currency.format(t.diferenca)}</span><span>Bilhetes: ${t.bilhetes || 0}</span></div>` : ""}
    </div>
  `).join("");
}

/* ========== BILHETES ========== */

function initBilhetes() {
  const searchInput = document.getElementById("buscar-bilhete");
  const statusFilter = document.getElementById("filter-status-bilhete");
  const dateFilter = document.getElementById("filter-date-bilhete");

  const applyFilters = () => renderBilhetes();
  searchInput?.addEventListener("input", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
  dateFilter?.addEventListener("change", applyFilters);
  document.getElementById("limpar-bilhete")?.addEventListener("click", () => {
    searchInput.value = "";
    statusFilter.value = "all";
    dateFilter.value = "";
    renderBilhetes();
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

  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--muted); padding:30px;">Nenhum bilhete encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map(bet => `
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
  `).join("");

  tbody.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleBilheteAction(btn.dataset.action, btn.dataset.code));
  });
}

function handleBilheteAction(action, code) {
  const history = window.BetLocal.getBetHistory();
  const bet = history.find(b => b.codigo === code);
  if (!bet) return;

  switch (action) {
    case "qr":
      showQRModal(bet);
      break;
    case "whatsapp":
      shareWhatsApp(bet);
      break;
    case "telegram":
      shareTelegram(bet);
      break;
    case "print":
      printBilhete(bet);
      break;
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
  alert("📸 Para Instagram:\n1. Tire print do QR Code\n2. Poste nos Stories ou Direct\n\nOu copie o código: " + bet.codigo);
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

function initQRModal() {
  document.getElementById("modal-qr")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-qr") e.target.style.display = "none";
  });
}

/* ========== CLIENTES ========== */

function initClientes() {
  const form = document.getElementById("cliente-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const cliente = {
      id: `cliente-${Date.now().toString(36)}`,
      nome: String(data.get("nome")).trim(),
      telefone: String(data.get("telefone") || "").trim(),
      apelido: String(data.get("apelido") || "").trim(),
      cadastradoEm: new Date().toLocaleString("pt-BR"),
    };

    const clientes = getClientes();
    if (clientes.some(c => c.telefone && c.telefone === cliente.telefone)) {
      alert("Já existe um cliente com este telefone.");
      return;
    }

    clientes.push(cliente);
    saveClientes(clientes);
    e.currentTarget.reset();
    renderClientes();
    alert(`✅ Cliente "${cliente.nome}" cadastrado!`);
  });

  renderClientes();
}

function getClientes() {
  try {
    return JSON.parse(localStorage.getItem(OPERADOR_STORAGE.clientes) || "[]");
  } catch { return []; }
}

function saveClientes(clientes) {
  localStorage.setItem(OPERADOR_STORAGE.clientes, JSON.stringify(clientes));
}

function renderClientes() {
  const box = document.getElementById("lista-clientes");
  if (!box) return;
  const clientes = getClientes();

  if (!clientes.length) {
    box.innerHTML = `<div style="color:var(--muted); text-align:center; padding:20px;">Nenhum cliente cadastrado.</div>`;
    return;
  }

  const history = window.BetLocal.getBetHistory();

  box.innerHTML = clientes.map(c => {
    const apostas = history.filter(b => b.cliente_id === c.id);
    const totalApostado = apostas.reduce((sum, b) => sum + Number(b.valor || 0), 0);
    return `
      <div class="cliente-card" style="cursor:pointer;" data-cliente-id="${window.BetLocal.escapeHTML(c.id)}">
        <div class="nome">${window.BetLocal.escapeHTML(c.nome)} ${c.apelido ? `(${window.BetLocal.escapeHTML(c.apelido)})` : ""}</div>
        <div class="info">📞 ${window.BetLocal.escapeHTML(c.telefone || "—")} | Cadastrado: ${c.cadastradoEm}</div>
        <div class="stats">
          <span>🎫 ${apostas.length} bilhetes</span>
          <span>💰 ${window.BetLocal.currency.format(totalApostado)}</span>
        </div>
      </div>
    `;
  }).join("");

  box.querySelectorAll("[data-cliente-id]").forEach(card => {
    card.addEventListener("click", () => showClienteDetalhes(card.dataset.clienteId));
  });
}

function showClienteDetalhes(clienteId) {
  const clientes = getClientes();
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) return;

  const history = window.BetLocal.getBetHistory();
  const apostas = history.filter(b => b.cliente_id === clienteId);
  const totalApostado = apostas.reduce((sum, b) => sum + Number(b.valor || 0), 0);
  const totalRetorno = apostas.reduce((sum, b) => sum + Number(b.retorno || 0), 0);
  const ganhos = apostas.filter(b => b.status === "Ganha" || b.status === "Paga").length;
  const perdas = apostas.filter(b => b.status === "Perdida").length;

  const detalhes = document.getElementById("cliente-detalhes");
  const conteudo = document.getElementById("cliente-historico-conteudo");
  if (!detalhes || !conteudo) return;

  conteudo.innerHTML = `
    <div style="margin-bottom:16px;">
      <h3>${window.BetLocal.escapeHTML(cliente.nome)}</h3>
      <p style="color:var(--muted);">📞 ${window.BetLocal.escapeHTML(cliente.telefone || "—")}</p>
    </div>
    <div class="stats-row-op" style="margin-bottom:16px;">
      <div class="stat-box-op"><div class="label">Bilhetes</div><div class="value">${apostas.length}</div></div>
      <div class="stat-box-op"><div class="label">Total Apostado</div><div class="value orange">${window.BetLocal.currency.format(totalApostado)}</div></div>
      <div class="stat-box-op"><div class="label">Ganhos</div><div class="value green">${ganhos}</div></div>
      <div class="stat-box-op"><div class="label">Perdas</div><div class="value red">${perdas}</div></div>
    </div>
    <div class="table-wrap-op">
      <table class="op-table">
        <thead><tr><th>Código</th><th>Data</th><th>Valor</th><th>Retorno</th><th>Status</th></tr></thead>
        <tbody>
          ${apostas.map(b => `
            <tr>
              <td><span class="bet-code-op">${window.BetLocal.escapeHTML(b.codigo)}</span></td>
              <td>${window.BetLocal.escapeHTML(b.data)}</td>
              <td>${window.BetLocal.currency.format(Number(b.valor))}</td>
              <td>${window.BetLocal.currency.format(Number(b.retorno))}</td>
              <td><span class="status ${statusClass(b.status)}">${window.BetLocal.escapeHTML(b.status)}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  detalhes.style.display = "block";
  detalhes.scrollIntoView({ behavior: "smooth" });
}

/* ========== FINANÇAS ========== */

function initFinancas() {
  renderFinancas();
  window.addEventListener("betlocal:history-updated", renderFinancas);
}

function renderFinancas() {
  const history = window.BetLocal.getBetHistory();
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const todayBets = history.filter(b => b.data_iso?.slice(0, 10) === today);
  const weekBets = history.filter(b => b.data_iso >= weekAgo);
  const monthBets = history.filter(b => b.data_iso >= monthAgo);

  const todayTotals = getFinancialTotals(todayBets);
  const weekTotals = getFinancialTotals(weekBets);
  const monthTotals = getFinancialTotals(monthBets);

  const stats = document.getElementById("financas-stats");
  if (stats) {
    stats.innerHTML = `
      <article class="stat-box-op"><div class="label">💸 Perdido (lucro casa) — Hoje</div><div class="value green">${window.BetLocal.currency.format(todayTotals.grossProfit)}</div></article>
      <article class="stat-box-op"><div class="label">🏆 Falta Pagar — Hoje</div><div class="value red">${window.BetLocal.currency.format(todayTotals.prizes)}</div></article>
      <article class="stat-box-op"><div class="label">📂 Em Aberto — Hoje</div><div class="value blue">${window.BetLocal.currency.format(todayTotals.exposure)}</div></article>
      <article class="stat-box-op"><div class="label">📊 Lucro/Prejuízo — Semana</div><div class="value ${weekTotals.net >= 0 ? 'green' : 'red'}">${window.BetLocal.currency.format(weekTotals.net)}</div></article>
    `;
  }

  renderSankey(todayBets, weekBets, monthBets);
}

function renderSankey(todayBets, weekBets, monthBets) {
  const canvas = document.getElementById("sankey-chart");
  if (!canvas || typeof Chart === "undefined") return;

  const period = document.getElementById("sankey-period")?.value || "today";
  let bets = todayBets;
  if (period === "week") bets = weekBets;
  if (period === "month") bets = monthBets;

  const totals = getFinancialTotals(bets);
  const ganhos = bets.filter(b => b.status === "Ganha" || b.status === "Paga").length;
  const perdas = bets.filter(b => b.status === "Perdida").length;
  const abertos = bets.filter(b => b.status === "Aberta").length;
  const cancelados = bets.filter(b => b.status === "Cancelada").length;

  // Destruir gráfico anterior se existir
  if (window.sankeyChartInstance) {
    window.sankeyChartInstance.destroy();
  }

  window.sankeyChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Total Apostado", "Perdeu (Lucro)", "Ganhou (Saída)", "Em Aberto", "Cancelado"],
      datasets: [{
        label: "Fluxo de Dinheiro (R$)",
        data: [totals.totalStaked, totals.grossProfit, totals.prizes, totals.exposure, 0],
        backgroundColor: [
          "rgba(255, 90, 22, 0.7)",
          "rgba(36, 217, 130, 0.7)",
          "rgba(255, 95, 95, 0.7)",
          "rgba(96, 165, 250, 0.7)",
          "rgba(156, 168, 186, 0.3)"
        ],
        borderColor: [
          "#ff5a16",
          "#24d982",
          "#ff5f5f",
          "#60a5fa",
          "#9ca8ba"
        ],
        borderWidth: 2,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => `R$ ${ctx.raw.toFixed(2)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `R$ ${v.toFixed(0)}`,
            color: "#9ca8ba"
          },
          grid: { color: "rgba(255,255,255,0.05)" }
        },
        x: {
          ticks: { color: "#9ca8ba" },
          grid: { display: false }
        }
      }
    }
  });
}

/* ========== CONFIGURAÇÕES ========== */

function initConfiguracoes() {
  const input = document.getElementById("limite-aposta");
  const saved = getLimite();
  if (input) input.value = saved;

  document.getElementById("salvar-limite")?.addEventListener("click", () => {
    const valor = Number(input?.value) || LIMITE_PADRAO;
    localStorage.setItem(OPERADOR_STORAGE.limite, JSON.stringify(valor));
    alert(`✅ Limite de aposta salvo: R$ ${valor.toFixed(2)}`);
  });
}

function getLimite() {
  try {
    return JSON.parse(localStorage.getItem(OPERADOR_STORAGE.limite) || String(LIMITE_PADRAO));
  } catch { return LIMITE_PADRAO; }
}

/* ========== UTILS ========== */

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
  const counts = values.filter(Boolean).reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

function statusClass(status) {
  return String(status || "Aberta")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function renderSelectionsSummary(bet) {
  return (bet.selections || []).map(item => `
    <div>
      <strong>${window.BetLocal.escapeHTML(item.jogo)}</strong><br>
      <small>${window.BetLocal.escapeHTML(item.mercado)}: ${window.BetLocal.escapeHTML(item.opcao)} @ ${window.BetLocal.formatOdd(item.odd)}</small>
    </div>
  `).join("");
}

// Exportar funções úteis
window.BetLocalOperador = {
  getCaixa,
  getClientes,
  getLimite,
  showQRModal,
  shareWhatsApp,
  printBilhete,
};
