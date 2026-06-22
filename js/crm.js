const CRM_STORAGE_KEY = "betlocal.operador.clientes";

function getClientes() {
  try {
    return JSON.parse(localStorage.getItem(CRM_STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveClientes(clientes) {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(clientes));
}

function cadastrarCliente(nome, telefone, apelido) {
  const clientes = getClientes();
  if (telefone && clientes.some(c => c.telefone && c.telefone === telefone)) {
    showToast("Já existe um cliente com este telefone.", "warning");
    return null;
  }
  const cliente = {
    id: `cliente-${Date.now().toString(36)}`,
    nome: nome.trim(),
    telefone: telefone.trim(),
    apelido: apelido.trim(),
    cadastradoEm: new Date().toLocaleString("pt-BR"),
  };
  clientes.push(cliente);
  saveClientes(clientes);
  return cliente;
}

function getClienteHistory(clienteId) {
  const history = window.BetLocal.getBetHistory();
  return history.filter(b => b.cliente_id === clienteId);
}

function renderClientes(boxId = "lista-clientes", detalhesId = "cliente-detalhes", historicoId = "cliente-historico-conteudo") {
  const box = document.getElementById(boxId);
  if (!box) return;
  const clientes = getClientes();
  if (!clientes.length) {
    box.innerHTML = `<div class="empty-state"><div class="empty-icon">👥</div><div class="empty-text">Nenhum cliente cadastrado.</div></div>`;
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
    card.addEventListener("click", () => showClienteDetalhes(card.dataset.clienteId, boxId, detalhesId, historicoId));
  });
}

function showClienteDetalhes(clienteId, boxId, detalhesId, historicoId) {
  const clientes = getClientes();
  const cliente = clientes.find(c => c.id === clienteId);
  if (!cliente) return;

  const apostas = getClienteHistory(clienteId);
  const totalApostado = apostas.reduce((sum, b) => sum + Number(b.valor || 0), 0);
  const ganhos = apostas.filter(b => b.status === "Ganha" || b.status === "Paga").length;
  const perdas = apostas.filter(b => b.status === "Perdida").length;

  const detalhes = document.getElementById(detalhesId);
  const conteudo = document.getElementById(historicoId);
  if (!detalhes || !conteudo) return;

  conteudo.innerHTML = `
    <div style="margin-bottom:16px;">
      <h3>${window.BetLocal.escapeHTML(cliente.nome)}</h3>
      <p style="color:var(--muted);">📞 ${window.BetLocal.escapeHTML(cliente.telefone || "—")}</p>
    </div>
    <div class="stats-row-admin" style="margin-bottom:16px;">
      <div class="stat-box"><div class="label">Bilhetes</div><div class="value">${apostas.length}</div></div>
      <div class="stat-box"><div class="label">Total Apostado</div><div class="value orange">${window.BetLocal.currency.format(totalApostado)}</div></div>
      <div class="stat-box"><div class="label">Ganhos</div><div class="value green">${ganhos}</div></div>
      <div class="stat-box"><div class="label">Perdas</div><div class="value red">${perdas}</div></div>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>Código</th><th>Data</th><th>Valor</th><th>Retorno</th><th>Status</th></tr></thead>
        <tbody>
          ${apostas.map(b => `
            <tr>
              <td><span class="bet-code">${window.BetLocal.escapeHTML(b.codigo)}</span></td>
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

function initClientesForm(formId, boxId, detalhesId, historicoId) {
  const form = document.getElementById(formId);
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const nome = String(data.get("nome") || "").trim();
    if (!nome) return showToast("Nome do cliente é obrigatório.", "warning");

    const cliente = cadastrarCliente(
      nome,
      String(data.get("telefone") || ""),
      String(data.get("apelido") || "")
    );
    if (!cliente) return;

    e.currentTarget.reset();
    renderClientes(boxId, detalhesId, historicoId);
    showToast(`Cliente "${cliente.nome}" cadastrado!`);
  });

  renderClientes(boxId, detalhesId, historicoId);
}
