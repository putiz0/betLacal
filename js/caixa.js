const CAIXA_STORAGE = {
  caixa: "betlocal.operador.caixa",
  turnos: "betlocal.operador.turnos",
};

function getCaixa() {
  try {
    return JSON.parse(localStorage.getItem(CAIXA_STORAGE.caixa) || "null");
  } catch { return null; }
}

function saveCaixa(caixa) {
  localStorage.setItem(CAIXA_STORAGE.caixa, JSON.stringify(caixa));
}

function getTurnos() {
  try {
    return JSON.parse(localStorage.getItem(CAIXA_STORAGE.turnos) || "[]");
  } catch { return []; }
}

function addTurno(turno) {
  const turnos = getTurnos();
  turnos.unshift(turno);
  localStorage.setItem(CAIXA_STORAGE.turnos, JSON.stringify(turnos));
}

function abrirCaixa(valorInicial, obs, operador) {
  const novoCaixa = {
    aberto: true,
    valorInicial,
    obs,
    abertoEm: new Date().toISOString(),
    abertoEmLocal: new Date().toLocaleString("pt-BR"),
    operador
  };
  saveCaixa(novoCaixa);
  addTurno({ tipo: "abertura", valor: valorInicial, obs, data: novoCaixa.abertoEmLocal });
  return novoCaixa;
}

function fecharCaixa(valorFinal, obsFechamento) {
  const caixaAtual = getCaixa();
  if (!caixaAtual?.aberto) return null;

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

  return { fechamento, caixaAtual, totals, valorEsperado, diferenca };
}

function renderCaixaInfo(boxId = "caixa-info") {
  const box = document.getElementById(boxId);
  if (!box) return;
  const caixa = getCaixa();
  if (caixa?.aberto) {
    box.innerHTML = `
      <div><strong>Caixa aberto desde:</strong> ${caixa.abertoEmLocal}</div>
      <div><strong>Valor inicial:</strong> ${window.BetLocal.currency.format(caixa.valorInicial)}</div>
      <div><strong>Operador:</strong> ${window.BetLocal.escapeHTML(caixa.operador)}</div>
      ${caixa.obs ? `<div><strong>Obs:</strong> ${window.BetLocal.escapeHTML(caixa.obs)}</div>` : ""}
    `;
  } else {
    box.innerHTML = `<div>Nenhum caixa aberto. Abra um turno para começar a operar.</div>`;
  }
}

function renderHistoricoCaixa(boxId = "historico-caixa") {
  const box = document.getElementById(boxId);
  if (!box) return;
  const turnos = getTurnos().slice(0, 10);
  if (!turnos.length) {
    box.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div class="empty-text">Nenhum turno registrado.</div></div>`;
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

function updateCaixaIndicator(indicatorId = "caixa-indicator") {
  const indicator = document.getElementById(indicatorId);
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

function formatRelatorioFechamento(fechamento, caixaAtual, totals) {
  return `
📊 FECHAMENTO DE CAIXA
━━━━━━━━━━━━━━━━━━━━━━
📅 Data: ${fechamento.data}
👤 Operador: ${caixaAtual.operador}

💰 Valor Inicial: R$ ${caixaAtual.valorInicial.toFixed(2)}
📥 Entradas: R$ ${totals.totalStaked.toFixed(2)}
📤 Saídas: R$ ${totals.prizes.toFixed(2)}
📊 Esperado: R$ ${fechamento.valorEsperado.toFixed(2)}
📊 Contado: R$ ${fechamento.valorFinal.toFixed(2)}
📊 Diferença: R$ ${fechamento.diferenca.toFixed(2)} ${fechamento.diferenca >= 0 ? "(sobra)" : "(quebra)"}

🎫 Bilhetes: ${fechamento.bilhetes}
🏆 Lucro/Prejuízo: R$ ${totals.net.toFixed(2)}
  `.trim();
}

function toggleCaixaUI(formAbrirId, formFecharId, btnAbrirId, btnFecharId) {
  const caixa = getCaixa();
  const formAbrir = document.getElementById(formAbrirId);
  const formFechar = document.getElementById(formFecharId);
  const btnAbrir = btnAbrirId ? document.getElementById(btnAbrirId) : null;
  const btnFechar = btnFecharId ? document.getElementById(btnFecharId) : null;

  const showAbrir = !caixa?.aberto;
  const showFechar = caixa?.aberto;

  if (formAbrir) formAbrir.style.display = showAbrir ? "grid" : "none";
  if (formFechar) formFechar.style.display = showFechar ? "grid" : "none";
  if (btnAbrir) btnAbrir.style.display = showAbrir ? "block" : "none";
  if (btnFechar) btnFechar.style.display = showFechar ? "block" : "none";
}

function initCaixaForm(formAbrirId, formFecharId, opts = {}) {
  const formAbrir = document.getElementById(formAbrirId);
  const formFechar = document.getElementById(formFecharId);

  formAbrir?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const valorInicial = Number(data.get("valor_inicial")) || 0;
    if (valorInicial <= 0) {
      showToast("Informe um valor inicial válido.", "warning");
      return;
    }
    const obs = String(data.get("obs") || "");
    const operador = window.BetLocalTenant.getSession()?.email || "operador";

    abrirCaixa(valorInicial, obs, operador);

    toggleCaixaUI(formAbrirId, formFecharId, opts.btnAbrirId, opts.btnFecharId);
    updateCaixaIndicator(opts.indicatorId);
    renderCaixaInfo(opts.caixaInfoId);
    renderHistoricoCaixa(opts.historicoId);
    showToast(`Caixa aberto com R$ ${valorInicial.toFixed(2)}`);
  });

  formFechar?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const valorFinal = Number(data.get("valor_final")) || 0;
    if (valorFinal <= 0) {
      showToast("Informe o valor final contado.", "warning");
      return;
    }
    const obsFechamento = String(data.get("obs_fechamento") || "");

    const result = fecharCaixa(valorFinal, obsFechamento);
    if (!result) return;

    toggleCaixaUI(formAbrirId, formFecharId, opts.btnAbrirId, opts.btnFecharId);
    updateCaixaIndicator(opts.indicatorId);
    renderCaixaInfo(opts.caixaInfoId);
    renderHistoricoCaixa(opts.historicoId);

    const relatorio = formatRelatorioFechamento(result.fechamento, result.caixaAtual, result.totals);
    showToast(relatorio.replace(/\n/g, " | "), "info", 8000);
  });

  toggleCaixaUI(formAbrirId, formFecharId, opts.btnAbrirId, opts.btnFecharId);
  renderCaixaInfo(opts.caixaInfoId);
  renderHistoricoCaixa(opts.historicoId);
}
