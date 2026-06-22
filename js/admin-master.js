const ITENS_POR_PAGINA = 50;
let masterPaginaAtual = 1;
let allClientes = [];
let cachedClients = [];

document.addEventListener("DOMContentLoaded", () => {
  window.BetLocalTenant.requireRoles(["super_admin"], initMaster);
});

function initMaster(session) {
  const isSuper = session?.role === "super_admin";
  const userEl = document.getElementById("master-user");
  const casaEl = document.getElementById("master-casa");
  const titleEl = document.getElementById("master-title");

  if (userEl) userEl.textContent = `👤 ${session.email}`;
  if (titleEl) titleEl.textContent = isSuper ? "Gestão Centralizada" : "Minha Casa";

  const currentClient = window.BetLocalTenant.getCurrentClient();
  if (casaEl && currentClient) {
    casaEl.textContent = `🏠 ${currentClient.tema?.nome_sistema || currentClient.nome || ""}`;
  }

  document.getElementById("master-logout")?.addEventListener("click", () => {
    window.BetLocalTenant.signOut();
  });

  document.querySelectorAll("[data-role]").forEach(el => {
    el.style.display = el.dataset.role === session.role ? "" : "none";
  });

  cachedClients = window.BetLocalTenant.loadClients();

  initDashboard();
  initApostas();
  initCasasFilter();

  if (isSuper) {
    initClientesSaaS();
  }

  initCasa();
}

/* ========== AGREGADOR DE APOSTAS ========== */

function getAllClientBets() {
  const clients = cachedClients.length ? cachedClients : window.BetLocalTenant.loadClients();
  let all = [];
  for (const client of clients) {
    try {
      const key = `betlocal.history.${client.id}`;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const bets = JSON.parse(raw);
      if (!Array.isArray(bets)) continue;
      bets.forEach(b => {
        b._casa_id = client.id;
        b._casa_nome = client.tema?.nome_sistema || client.nome || client.id;
      });
      all = all.concat(bets);
    } catch { /* skip */ }
  }
  all.sort((a, b) => {
    const da = a.data_iso || a.data || "";
    const db = b.data_iso || b.data || "";
    return db.localeCompare(da);
  });
  return all;
}

function getClientName(clientId) {
  const c = cachedClients.find(cl => cl.id === clientId);
  return c?.tema?.nome_sistema || c?.nome || clientId;
}

/* ========== DASHBOARD ========== */

function initDashboard() {
  renderStats();
  renderSemanaChart();
  window.addEventListener("betlocal:history-updated", () => {
    renderStats();
    renderSemanaChart();
  });

  document.getElementById("btn-conferir-tudo")?.addEventListener("click", () => {
    conferirTodasAsCasas();
  });
}

function renderStats() {
  const allBets = getAllClientBets();
  const clients = cachedClients.length ? cachedClients : window.BetLocalTenant.loadClients();
  const totalBets = allBets.length;
  const totalStaked = allBets.reduce((s, b) => s + Number(b.valor || 0), 0);
  const totalPrizes = allBets.filter(b => b.status === "Paga").reduce((s, b) => s + Number(b.retorno || 0), 0);
  const openBets = allBets.filter(b => b.status === "Aberta").length;
  const activeClients = clients.filter(c => c.status === "ativo" || c.status === "teste").length;

  const stats = document.getElementById("master-stats");
  if (!stats) return;
  stats.innerHTML = `
    <div class="stat-big"><div class="label">🎫 Total de Apostas</div><div class="value blue">${totalBets}</div></div>
    <div class="stat-big"><div class="label">💰 Total Apostado</div><div class="value orange">${window.BetLocal.currency.format(totalStaked)}</div></div>
    <div class="stat-big"><div class="label">🏆 Prêmios Pagos</div><div class="value ${totalPrizes > 0 ? 'red' : 'green'}">${window.BetLocal.currency.format(totalPrizes)}</div></div>
    <div class="stat-big"><div class="label">📂 Em Aberto</div><div class="value blue">${openBets}</div></div>
  `;
}

function renderSemanaChart() {
  const container = document.getElementById("chart-semana");
  if (!container) return;

  const allBets = getAllClientBets();
  const dias = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" });
    const dayBets = allBets.filter(b => (b.data_iso || "").slice(0, 10) === key);
    const total = dayBets.reduce((s, b) => s + Number(b.valor || 0), 0);
    dias.push({ label, total });
  }

  const maxVal = Math.max(...dias.map(d => d.total), 1);
  const colors = ["#24d982", "#60a5fa", "#ff5a16", "#ffc857", "#ff5f5f", "#a78bfa", "#34d399"];

  container.innerHTML = dias.map((d, i) => {
    const h = Math.max(4, (d.total / maxVal) * 100);
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div class="bar" style="height:${h}%;background:${colors[i % colors.length]};width:100%;min-height:4px;" title="R$ ${d.total.toFixed(2)}"></div>
      <span class="bar-label">${d.label}</span>
      <span style="font-size:0.7rem;color:var(--muted);">${window.BetLocal.currency.format(d.total)}</span>
    </div>`;
  }).join("");
}

/* ========== CONFERIR RESULTADOS (TODAS AS CASAS) ========== */

async function conferirTodasAsCasas() {
  const btn = document.getElementById("btn-conferir-tudo");
  setLoading(btn, true);

  try {
    const clients = cachedClients.length ? cachedClients : window.BetLocalTenant.loadClients();
    let totalChanged = 0;

    for (const client of clients) {
      const historyKey = `betlocal.history.${client.id}`;
      const raw = localStorage.getItem(historyKey);
      if (!raw) continue;
      const history = JSON.parse(raw);
      if (!Array.isArray(history)) continue;

      const openBets = history.filter(b => b.status === "Aberta");
      if (!openBets.length) continue;

      const ids = [...new Set(openBets.flatMap(b => (b.selections || []).map(s => s.gameId)))];
      const statuses = await window.BetLocal.fetchFixtureStatuses(ids);
      const statusById = new Map(statuses.map(item => [String(item.id), item]));

      let changed = 0;
      const nextHistory = history.map(bet => {
        if (bet.status !== "Aberta") return bet;
        const settled = settleBetFn(bet, statusById);
        if (settled !== bet) changed++;
        return settled;
      });

      if (changed > 0) {
        localStorage.setItem(historyKey, JSON.stringify(nextHistory));
        totalChanged += changed;
      }
    }

    window.dispatchEvent(new CustomEvent("betlocal:history-updated"));
    if (totalChanged > 0) {
      showToast(`${totalChanged} aposta(s) atualizada(s) em todas as casas.`);
    } else {
      showToast("Nenhuma aposta atualizada.", "info");
    }
  } catch (err) {
    showToast(err.message || "Erro ao conferir resultados.", "error");
  } finally {
    setLoading(btn, false);
  }
}

function settleBetFn(bet, statusById) {
  let hasPending = false, hasLost = false;
  const settledSelections = (bet.selections || []).map(sel => {
    const fixture = statusById.get(String(sel.gameId));
    const result = settleSelectionFn(sel, fixture);
    if (result.state === "pending") hasPending = true;
    if (result.state === "lost") hasLost = true;
    return { ...sel, effective_odd: result.effectiveOdd, settlement: result.note };
  });

  if (hasLost) return { ...bet, selections: settledSelections, status: "Perdida", pagamento: "Pendente", atualizado_em: new Date().toLocaleString("pt-BR"), settlement_note: "Conferida automaticamente." };
  if (hasPending) return bet;

  const effOdd = settledSelections.reduce((t, item) => Number((t * Number(item.effective_odd || item.odd || 1)).toFixed(2)), 1);
  return { ...bet, selections: settledSelections, odd_total: effOdd, retorno: Number((Number(bet.valor || 0) * effOdd).toFixed(2)), status: "Ganha", pagamento: "Pendente", atualizado_em: new Date().toLocaleString("pt-BR"), settlement_note: "Conferida automaticamente." };
}

function settleSelectionFn(selection, fixture) {
  if (!fixture) return { state: "pending", effectiveOdd: selection.odd, note: "Aguardando API." };
  if (fixture.cancelado) return { state: "void", effectiveOdd: 1, note: "Jogo cancelado/adiado: odd virou 1.00." };
  if (!fixture.finalizado) return { state: "pending", effectiveOdd: selection.odd, note: "Jogo ainda não finalizado." };
  const home = Number(fixture.gols_casa), away = Number(fixture.gols_fora);
  const result = evaluateMarketFn(selection, fixture, home, away);
  if (result === null) return { state: "pending", effectiveOdd: selection.odd, note: "Mercado ainda não automático." };
  return { state: result ? "won" : "lost", effectiveOdd: result ? selection.odd : 0, note: result ? "Seleção ganhou." : "Seleção perdeu." };
}

function evaluateMarketFn(selection, fixture, homeGoals, awayGoals) {
  const market = normalize(selection.mercado);
  const option = normalize(selection.opcao);
  const home = normalize(fixture.time_casa), away = normalize(fixture.time_fora);
  const total = homeGoals + awayGoals;
  if (market === "resultado final") {
    if (homeGoals > awayGoals) return option === home;
    if (awayGoals > homeGoals) return option === away;
    return option === "empate";
  }
  if (market === "ambas marcam") {
    const both = homeGoals > 0 && awayGoals > 0;
    return option === "sim" ? both : option === "nao" ? !both : null;
  }
  if (market === "total de gols") {
    const line = Number((selection.opcao.match(/(\d+(?:[.,]\d+)?)/) || [])[1]?.replace(",", "."));
    if (!Number.isFinite(line)) return null;
    if (option.includes("mais de")) return total > line;
    if (option.includes("menos de")) return total < line;
  }
  if (market === "placar correto") {
    const score = option.replace(/\s+/g, "").replace(":", "x");
    return score === `${homeGoals}x${awayGoals}`;
  }
  return null;
}

/* ========== TODAS AS APOSTAS ========== */

function initApostas() {
  const searchInput = document.getElementById("buscar-aposta");
  const casaFilter = document.getElementById("filter-casa");
  const statusFilter = document.getElementById("filter-status-m");
  const dateFilter = document.getElementById("filter-data");

  const apply = debounce(() => { masterPaginaAtual = 1; renderApostas(); }, 250);
  searchInput?.addEventListener("input", apply);
  casaFilter?.addEventListener("change", apply);
  statusFilter?.addEventListener("change", apply);
  dateFilter?.addEventListener("change", apply);

  document.getElementById("limpar-filtros")?.addEventListener("click", () => {
    searchInput.value = "";
    casaFilter.value = "all";
    statusFilter.value = "all";
    dateFilter.value = "";
    masterPaginaAtual = 1;
    renderApostas();
  });

  document.getElementById("exportar-csv-master")?.addEventListener("click", () => {
    const allBets = getAllClientBets();
    const data = allBets.map(b => ({
      Casa: b._casa_nome || getClientName(b.cliente_id),
      Codigo: b.codigo,
      Data: b.data,
      Status: b.status,
      Valor: b.valor,
      Retorno: b.retorno,
      Odd: b.odd_total,
    }));
    exportCSV(data, `todas-apostas-${new Date().toISOString().slice(0, 10)}.csv`);
  });

  window.addEventListener("betlocal:history-updated", () => {
    cachedClients = window.BetLocalTenant.loadClients();
    renderApostas();
  });

  renderApostas();
}

function initCasasFilter() {
  const select = document.getElementById("filter-casa");
  if (!select) return;
  const clients = cachedClients.length ? cachedClients : window.BetLocalTenant.loadClients();
  clients.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.tema?.nome_sistema || c.nome || c.id;
    select.appendChild(opt);
  });
}

function renderApostas() {
  const tbody = document.getElementById("tabela-master");
  if (!tbody) return;

  let allBets = getAllClientBets();
  const query = (document.getElementById("buscar-aposta")?.value || "").trim().toLowerCase();
  const casaFilter = document.getElementById("filter-casa")?.value || "all";
  const statusFilter = document.getElementById("filter-status-m")?.value || "all";
  const dateFilter = document.getElementById("filter-data")?.value || "";

  if (query) allBets = allBets.filter(b => b.codigo.toLowerCase().includes(query));
  if (casaFilter !== "all") allBets = allBets.filter(b => b.cliente_id === casaFilter || b._casa_id === casaFilter);
  if (statusFilter !== "all") allBets = allBets.filter(b => b.status === statusFilter);
  if (dateFilter) {
    const fd = new Date(dateFilter).toISOString().slice(0, 10);
    allBets = allBets.filter(b => (b.data_iso || "").slice(0, 10) === fd);
  }

  const totalPaginas = Math.max(1, Math.ceil(allBets.length / ITENS_POR_PAGINA));
  if (masterPaginaAtual > totalPaginas) masterPaginaAtual = totalPaginas;
  const inicio = (masterPaginaAtual - 1) * ITENS_POR_PAGINA;
  const pagina = allBets.slice(inicio, inicio + ITENS_POR_PAGINA);

  if (!allBets.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:30px;">Nenhuma aposta encontrada.</td></tr>`;
    return;
  }

  tbody.innerHTML = pagina.map(b => `
    <tr>
      <td><span class="casa-tag">${esc(b._casa_nome || getClientName(b.cliente_id))}</span></td>
      <td><span class="bet-code">${esc(b.codigo)}</span></td>
      <td>${esc(b.data)}</td>
      <td class="bet-summary">${renderSelectionsSummary(b)}</td>
      <td>${window.BetLocal.formatOdd(b.odd_total)}</td>
      <td>${window.BetLocal.currency.format(Number(b.valor))}</td>
      <td>${window.BetLocal.currency.format(Number(b.retorno))}</td>
      <td><span class="status ${statusClass(b.status)}">${esc(b.status)}</span></td>
      <td>
        <div class="action-btns">
          ${b.status === "Ganha" ? `<button class="btn primary" data-action="pagar" data-code="${esc(b.codigo)}" data-casa="${b._casa_id || b.cliente_id}">💰 Pago</button>` : ""}
          ${b.status !== "Cancelada" ? `<button class="btn" data-action="cancelar" data-code="${esc(b.codigo)}" data-casa="${b._casa_id || b.cliente_id}">❌ Cancelar</button>` : ""}
        </div>
      </td>
    </tr>
  `).join("") + `
    <tr><td colspan="9"><div class="pagination">
      <button class="page-prev" ${masterPaginaAtual <= 1 ? "disabled" : ""}>‹ Anterior</button>
      <span class="page-info">Página ${masterPaginaAtual} de ${totalPaginas} (${allBets.length} registros)</span>
      <button class="page-next" ${masterPaginaAtual >= totalPaginas ? "disabled" : ""}>Próxima ›</button>
    </div></td></tr>
  `;

  tbody.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      const code = btn.dataset.code;
      const casa = btn.dataset.casa;
      const msg = action === "cancelar"
        ? `Cancelar aposta ${code} da casa "${getClientName(casa)}"?`
        : `Confirmar pagamento da aposta ${code}?`;
      showConfirm(msg).then(ok => {
        if (ok) atualizarStatusAposta(code, casa, action === "pagar" ? "Paga" : "Cancelada");
      });
    });
  });

  tbody.querySelector(".page-prev")?.addEventListener("click", () => {
    if (masterPaginaAtual > 1) { masterPaginaAtual--; renderApostas(); }
  });
  tbody.querySelector(".page-next")?.addEventListener("click", () => {
    if (masterPaginaAtual < totalPaginas) { masterPaginaAtual++; renderApostas(); }
  });
}

function atualizarStatusAposta(code, casaId, newStatus) {
  const key = `betlocal.history.${casaId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return showToast("Casa não encontrada.", "error");
    const history = JSON.parse(raw);
    const idx = history.findIndex(b => b.codigo === code);
    if (idx === -1) return showToast("Aposta não encontrada.", "error");
    history[idx] = {
      ...history[idx],
      status: newStatus,
      pagamento: newStatus === "Paga" ? "Pago" : history[idx].pagamento,
      atualizado_em: new Date().toLocaleString("pt-BR")
    };
    localStorage.setItem(key, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent("betlocal:history-updated"));
    showToast(`Aposta ${code} atualizada para "${newStatus}"`);
  } catch (err) {
    showToast(err.message, "error");
  }
}

/* ========== CLIENTES SAAS ========== */

function initClientesSaaS() {
  loadClientes();
  document.getElementById("client-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');
    setLoading(btn, true);
    const data = Object.fromEntries(new FormData(form));
    if ((data.senha || "").length < 4) {
      showToast("Senha precisa ter 4+ caracteres", "warning");
      setLoading(btn, false);
      return;
    }
    try {
      const clientId = "cliente-" + Date.now();
      if (window.BetLocalSupabase?.client) {
        await window.BetLocalSupabase.client.from("clientes").insert([{
          id: clientId, nome: data.nome, email: data.email, plano: data.plano,
          status: data.status, vencimento: data.vencimento, nome_sistema: data.nome_sistema,
          cor_primaria: data.cor_primaria, cor_fundo: data.cor_fundo, logo_url: data.logo_url,
          created_at: new Date().toISOString()
        }]);
      }
      const clients = window.BetLocalTenant.loadClients();
      clients.push({
        id: clientId, nome: data.nome, email: data.email, senha_demo: data.senha,
        plano: data.plano, status: data.status, inicio: new Date().toISOString().slice(0, 10),
        vencimento: data.vencimento,
        tema: { nome_sistema: data.nome_sistema || data.nome, cor_primaria: data.cor_primaria || "#ff5a16", cor_fundo: data.cor_fundo || "#090b10", logo_url: data.logo_url || "" },
        usuarios: [{ email: data.email, senha_demo: data.senha, role: "dono", nome: "Dono" }]
      });
      window.BetLocalTenant.saveClients(clients);
      form.reset();
      loadClientes();
      showToast(`Cliente "${data.nome}" criado com sucesso!`);
    } catch (err) {
      showToast("Erro: " + err.message, "error");
    } finally {
      setLoading(btn, false);
    }
  });
  document.getElementById("search-client")?.addEventListener("input", (e) => filterClientes(e.target.value));
  document.getElementById("clear-search")?.addEventListener("click", () => {
    document.getElementById("search-client").value = "";
    filterClientes("");
  });
}

function loadClientes() {
  const clients = window.BetLocalTenant.loadClients();
  allClientes = clients;
  cachedClients = clients;
  document.getElementById("client-count").textContent = clients.length + " cliente(s)";
  renderClientes(clients);
  updateSaaSStats(clients);
  initCasasFilter();
}

function filterClientes(query) {
  const q = query.toLowerCase();
  const filtered = allClientes.filter(c =>
    (c.nome || "").toLowerCase().includes(q) || (c.email || "").toLowerCase().includes(q) || (c.id || "").includes(q)
  );
  renderClientes(filtered);
}

function renderClientes(clients) {
  const tbody = document.getElementById("clientes-tbody");
  if (!clients.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--muted);">Nenhum cliente encontrado</td></tr>`;
    return;
  }
  const allBets = getAllClientBets();
  tbody.innerHTML = clients.map(c => {
    const planInfo = window.BetLocalTenant.plans[c.plano || "teste"] || { nome: c.plano, preco: 0 };
    const venc = c.vencimento ? new Date(c.vencimento + "T23:59:59") : null;
    const dias = venc ? Math.ceil((venc - new Date()) / (1000 * 60 * 60 * 24)) : null;
    const diasClass = !dias ? "danger" : dias < 0 ? "danger" : dias <= 5 ? "warn" : "ok";
    const diasLabel = !dias ? "?" : dias < 0 ? `${Math.abs(dias)}d atrasado` : `${dias}d`;
    const statClass = c.status === "ativo" || c.status === "teste" ? "ok" : "danger";
    const casaBets = allBets.filter(b => b.cliente_id === c.id || b._casa_id === c.id);
    return `<tr class="client-row">
      <td><div class="client-name">${esc(c.nome)}</div><div class="client-email">${esc(c.email)}</div></td>
      <td><span class="badge-plan ${c.plano || "teste"}">${esc(planInfo.nome)}</span></td>
      <td>${venc ? venc.toLocaleDateString("pt-BR") : "-"}</td>
      <td><span class="days-pill ${diasClass}">${diasLabel}</span></td>
      <td>${casaBets.length}</td>
      <td><span class="days-pill ${statClass}">${esc(c.status || "teste")}</span></td>
      <td class="action-btns">
        <button class="btn" onclick="renovarCliente('${c.id}')">🔄 Renovar</button>
        <button class="btn primary" onclick="editarCliente('${c.id}')">✏️ Editar</button>
        <button class="btn" onclick="cancelarCliente('${c.id}')" ${c.status === "cancelado" ? "disabled" : ""}>${c.status === "cancelado" ? "Cancelada" : "Cancelar"}</button>
      </td>
    </tr>`;
  }).join("");
}

function updateSaaSStats(clients) {
  const total = clients.length;
  const ativos = clients.filter(c => c.status === "ativo").length;
  const testes = clients.filter(c => c.status === "teste").length;
  const receita = clients.reduce((acc, c) => {
    if (c.status === "ativo" || c.status === "teste") return acc + (window.BetLocalTenant.plans[c.plano || "teste"]?.preco || 0);
    return acc;
  }, 0);
  const el = document.getElementById("saas-stats");
  if (el) el.innerHTML = `
    <div class="stat-big"><div class="label">Total Clientes</div><div class="value orange">${total}</div></div>
    <div class="stat-big"><div class="label">Ativos</div><div class="value green">${ativos}</div></div>
    <div class="stat-big"><div class="label">Em Teste</div><div class="value blue">${testes}</div></div>
    <div class="stat-big"><div class="label">Receita Potencial</div><div class="value orange">R$ ${receita.toLocaleString("pt-BR")}</div></div>
  `;
}

function renovarCliente(id) {
  showConfirm("Renovar licença por +30 dias?").then(ok => {
    if (!ok) return;
    try {
      window.BetLocalTenant.renewClient(id, 30);
      loadClientes();
      showToast("Licença renovada por +30 dias.");
    } catch (e) { showToast(e.message, "error"); }
  });
}

function cancelarCliente(id) {
  showConfirm("Tem certeza? O cliente perderá acesso.").then(ok => {
    if (!ok) return;
    try {
      window.BetLocalTenant.cancelClientLicense(id);
      loadClientes();
      showToast("Licença cancelada.");
    } catch (e) { showToast(e.message, "error"); }
  });
}

function editarCliente(id) {
  const clients = window.BetLocalTenant.loadClients();
  const c = clients.find(cl => cl.id === id);
  if (!c) return showToast("Cliente não encontrado.", "error");
  const existing = document.querySelector(".edit-client-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay edit-client-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  const tema = c.tema || {};
  overlay.innerHTML = `
    <div class="confirm-box" style="max-width:520px;max-height:90vh;overflow-y:auto;">
      <h3 style="margin:0 0 16px;">✏️ Editar ${esc(c.nome)}</h3>
      <form id="edit-client-form" style="display:grid;gap:12px;">
        <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
          Nome<input name="nome" value="${esc(c.nome)}" required style="width:100%;border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
        </label>
        <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
          Email<input name="email" type="email" value="${esc(c.email)}" required style="width:100%;border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
            Plano<select name="plano" style="border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
              <option value="teste" ${(c.plano||"teste")==="teste"?"selected":""}>🎁 Teste</option>
              <option value="padrao" ${c.plano==="padrao"?"selected":""}>📦 Padrão</option>
              <option value="plus" ${c.plano==="plus"?"selected":""}>⭐ Plus</option>
              <option value="master" ${c.plano==="master"?"selected":""}>👑 Master</option>
            </select>
          </label>
          <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
            Status<select name="status" style="border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
              <option value="ativo" ${(c.status||"ativo")==="ativo"?"selected":""}>Ativo</option>
              <option value="teste" ${c.status==="teste"?"selected":""}>Teste</option>
              <option value="atrasado" ${c.status==="atrasado"?"selected":""}>Atrasado</option>
              <option value="cancelado" ${c.status==="cancelado"?"selected":""}>Cancelado</option>
            </select>
          </label>
        </div>
        <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
          Vencimento<input name="vencimento" type="date" value="${c.vencimento||""}" style="width:100%;border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
        </label>
        <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
          Nome do sistema<input name="nome_sistema" value="${esc(tema.nome_sistema||"")}" style="width:100%;border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
        </label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
            Cor principal<input name="cor_primaria" type="color" value="${tema.cor_primaria||"#ff5a16"}" style="height:40px;border:1px solid var(--line);border-radius:8px;background:#080c13;padding:2px;">
          </label>
          <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
            Cor fundo<input name="cor_fundo" type="color" value="${tema.cor_fundo||"#090b10"}" style="height:40px;border:1px solid var(--line);border-radius:8px;background:#080c13;padding:2px;">
          </label>
        </div>
        <label style="display:grid;gap:4px;font-size:0.85rem;color:var(--soft);">
          Logo URL<input name="logo_url" type="url" value="${esc(tema.logo_url||"")}" style="width:100%;border:1px solid var(--line);border-radius:8px;background:#080c13;color:var(--text);padding:9px 12px;">
        </label>
        <div class="confirm-actions" style="margin-top:8px;">
          <button class="ghost-btn" type="button" id="edit-cancel">Cancelar</button>
          <button class="primary-btn" type="submit">💾 Salvar</button>
        </div>
      </form>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("confirm-visible"));
  const close = () => { overlay.classList.remove("confirm-visible"); overlay.addEventListener("transitionend", () => overlay.remove(), { once: true }); setTimeout(() => overlay.remove(), 300); };
  overlay.querySelector("#edit-cancel").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", function h(e) { if (e.key === "Escape") { close(); document.removeEventListener("keydown", h); } });
  overlay.querySelector("#edit-client-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const idx = clients.findIndex(cl => cl.id === id);
    if (idx === -1) return;
    clients[idx] = { ...clients[idx], nome: data.nome, email: data.email, plano: data.plano, status: data.status, vencimento: data.vencimento, tema: { nome_sistema: data.nome_sistema || data.nome, cor_primaria: data.cor_primaria || "#ff5a16", cor_fundo: data.cor_fundo || "#090b10", logo_url: data.logo_url || "" } };
    window.BetLocalTenant.saveClients(clients);
    close();
    loadClientes();
    showToast(`Cliente "${data.nome}" atualizado!`);
  });
}

/* ========== MINHA CASA ========== */

function initCasa() {
  const client = window.BetLocalTenant.getCurrentClient();
  if (!client) return;

  const info = document.getElementById("casa-info");
  if (info) {
    const plan = window.BetLocalTenant.plans[client.plano];
    const status = window.BetLocalTenant.computedLicenseStatus(client);
    const days = window.BetLocalTenant.daysRemaining(client);
    info.innerHTML = `
      <div><strong>🏠 Nome:</strong> ${esc(client.nome)}</div>
      <div><strong>📧 Email:</strong> ${esc(client.email)}</div>
      <div><strong>📦 Plano:</strong> ${esc(plan?.nome || client.plano)}</div>
      <div><strong>📅 Vencimento:</strong> ${esc(client.vencimento)}</div>
      <div><strong>⏳ Dias restantes:</strong> ${days ?? "?"}</div>
      <div><strong>🚦 Status:</strong> <span class="status ${status}">${esc(status)}</span></div>
      <div><strong>👥 Usuários:</strong> ${client.usuarios?.length || 0}</div>
    `;
  }

  const allBets = getAllClientBets();
  const casaBets = allBets.filter(b => b.cliente_id === client.id);
  const totalStaked = casaBets.reduce((s, b) => s + Number(b.valor || 0), 0);
  const abertas = casaBets.filter(b => b.status === "Aberta").length;
  const pagas = casaBets.filter(b => b.status === "Paga").length;

  const stats = document.getElementById("casa-stats");
  if (stats) {
    stats.innerHTML = `
      <div class="stat-big"><div class="label">🎫 Total Apostas</div><div class="value blue">${casaBets.length}</div></div>
      <div class="stat-big"><div class="label">💰 Apostado</div><div class="value orange">${window.BetLocal.currency.format(totalStaked)}</div></div>
      <div class="stat-big"><div class="label">📂 Em Aberto</div><div class="value blue">${abertas}</div></div>
      <div class="stat-big"><div class="label">✅ Pagas</div><div class="value green">${pagas}</div></div>
    `;
  }

  initUserForm();
  renderUsers();
}

function initUserForm() {
  const form = document.getElementById("user-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const client = window.BetLocalTenant.getCurrentClient();
    const session = window.BetLocalTenant.getSession();
    const role = String(data.get("role"));
    if (session?.role !== "dono" && role === "dono") {
      showToast("Apenas o dono pode criar outro dono.", "warning");
      return;
    }
    try {
      window.BetLocalTenant.addUserToClient(client.id, {
        nome: String(data.get("nome")).trim(),
        email: String(data.get("email")).trim().toLowerCase(),
        senha_demo: String(data.get("senha")),
        role
      });
      e.currentTarget.reset();
      renderUsers();
      showToast(`Usuário adicionado!`);
    } catch (err) {
      showToast(err.message, "error");
    }
  });
}

function renderUsers() {
  const tbody = document.getElementById("usuarios-tbody");
  if (!tbody) return;
  const client = window.BetLocalTenant.getCurrentClient();
  const session = window.BetLocalTenant.getSession();
  const users = client?.usuarios || [];
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:20px;">Nenhum usuário.</td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${esc(u.nome)}</td>
      <td>${esc(u.email)}</td>
      <td><span class="status ${statusClass(u.role)}">${esc(u.role)}</span></td>
      <td>${session?.role === "dono" && session?.email !== u.email
        ? `<button class="btn" data-email="${esc(u.email)}">🗑️ Remover</button>`
        : `<span style="color:var(--muted);font-size:0.8rem;">—</span>`}</td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-email]").forEach(btn => {
    btn.addEventListener("click", () => {
      showConfirm(`Remover ${btn.dataset.email}?`).then(ok => {
        if (!ok) return;
        const client = window.BetLocalTenant.getCurrentClient();
        try {
          window.BetLocalTenant.removeUserFromClient(client.id, btn.dataset.email);
          renderUsers();
          showToast("Usuário removido.");
        } catch (err) { showToast(err.message, "error"); }
      });
    });
  });
}

function esc(str) {
  return (str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;");
}
