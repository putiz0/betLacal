document.addEventListener("DOMContentLoaded", () => {
  window.BetLocalTenant.requireRoles(["super_admin"], initMaster);
});

function initMaster(session) {
  // Mostra usuário logado
  const userEl = document.getElementById("master-user");
  if (userEl && session) userEl.textContent = `👤 ${session.email}`;

  // Logout
  document.getElementById("master-logout")?.addEventListener("click", () => {
    window.BetLocalTenant.signOut();
  });

  // Formulário
  const form = document.getElementById("client-form");
  form?.addEventListener("submit", handleClientSubmit);

  // Busca
  const searchInput = document.getElementById("search-client");
  searchInput?.addEventListener("input", () => renderMaster());
  document.getElementById("clear-search")?.addEventListener("click", () => {
    searchInput.value = "";
    renderMaster();
  });

  // Render inicial
  renderMaster();
  window.addEventListener("betlocal:clients-updated", renderMaster);
}

function handleClientSubmit(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const clients = window.BetLocalTenant.loadClients();
  const id = createClientId(String(form.get("nome")));

  const client = {
    id,
    nome: String(form.get("nome")).trim(),
    email: String(form.get("email")).trim().toLowerCase(),
    senha_demo: String(form.get("senha")),
    plano: String(form.get("plano")),
    inicio: new Date().toISOString().slice(0, 10),
    vencimento: String(form.get("vencimento")),
    status: String(form.get("status")),
    tema: {
      nome_sistema: String(form.get("nome_sistema") || form.get("nome")).trim(),
      cor_primaria: String(form.get("cor_primaria") || "#ff5a16"),
      cor_fundo: String(form.get("cor_fundo") || "#090b10"),
      logo_url: String(form.get("logo_url") || "").trim()
    },
    usuarios: [
      {
        email: String(form.get("email")).trim().toLowerCase(),
        senha_demo: String(form.get("senha")),
        role: "dono",
        nome: String(form.get("nome")).trim()
      }
    ]
  };

  window.BetLocalTenant.saveClients([client, ...clients]);
  event.currentTarget.reset();
  alert(`✅ Cliente "${client.nome}" criado!\n\n🔗 URL de acesso:\n${buildClientUrl(client.id)}`);
}

function renderMaster() {
  const clients = window.BetLocalTenant.loadClients();
  const query = (document.getElementById("search-client")?.value || "").trim().toLowerCase();

  const filtered = query
    ? clients.filter(c =>
        c.nome.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.id.toLowerCase().includes(query)
      )
    : clients;

  renderStats(clients);
  renderClientsTable(filtered);
  renderRevenueChart(clients);
  document.getElementById("client-count").textContent = `${filtered.length} de ${clients.length} clientes`;
}

function renderStats(clients) {
  const stats = document.getElementById("master-stats");
  if (!stats) return;

  const active = clients.filter(c => window.BetLocalTenant.canAccessClient(c)).length;
  const overdue = clients.filter(c => window.BetLocalTenant.computedLicenseStatus(c) === "atrasado").length;
  const suspended = clients.filter(c => window.BetLocalTenant.computedLicenseStatus(c) === "suspenso").length;
  const monthly = clients.reduce((total, c) => {
    const plan = window.BetLocalTenant.plans[c.plano];
    return total + Number(plan?.preco || 0);
  }, 0);

  stats.innerHTML = `
    <article class="stat-big">
      <div class="label">Clientes Ativos</div>
      <div class="value up">${active}</div>
    </article>
    <article class="stat-big">
      <div class="label">Atrasados</div>
      <div class="value down">${overdue}</div>
    </article>
    <article class="stat-big">
      <div class="label">Suspensos</div>
      <div class="value down">${suspended}</div>
    </article>
    <article class="stat-big">
      <div class="label">Receita Mensal</div>
      <div class="value money">${window.BetLocalMasterCurrency.format(monthly)}</div>
    </article>
  `;
}

function renderClientsTable(clients) {
  const tbody = document.getElementById("clientes-tbody");
  if (!tbody) return;

  if (!clients.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--muted); padding:30px;">Nenhum cliente encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = clients.map(client => {
    const status = window.BetLocalTenant.computedLicenseStatus(client);
    const plan = window.BetLocalTenant.plans[client.plano];
    const days = window.BetLocalTenant.daysRemaining(client);
    const url = buildClientUrl(client.id);
    const adminUrl = buildClientAdminUrl(client.id);

    const daysClass = days > 7 ? "ok" : days > 0 ? "warn" : "danger";
    const statusClass = status === "ativo" || status === "teste" ? "ativo" : status;

    return `
      <tr class="client-row">
        <td>
          <div class="client-name">${escapeMaster(client.nome)}</div>
          <div class="client-email">${escapeMaster(client.email)}</div>
          <div class="client-url">${escapeMaster(url)}</div>
        </td>
        <td><span class="badge-plan ${escapeMaster(client.plano)}">${escapeMaster(plan?.nome || client.plano)}</span></td>
        <td>${escapeMaster(client.vencimento)}</td>
        <td><span class="days-pill ${daysClass}">${days} dias</span></td>
        <td><span class="status ${statusClass}">${escapeMaster(status)}</span></td>
        <td>
          <div class="action-btns">
            <a class="btn primary" href="${escapeMaster(url)}" target="_blank">🔗 Login</a>
            <a class="btn" href="${escapeMaster(adminUrl)}">⚙️ Admin</a>
            <button class="btn" data-action="ativo" data-id="${escapeMaster(client.id)}">✅ Ativar</button>
            <button class="btn" data-action="suspenso" data-id="${escapeMaster(client.id)}">🚫 Suspender</button>
            <button class="btn" data-action="cancelado" data-id="${escapeMaster(client.id)}">❌ Cancelar</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  tbody.querySelectorAll("[data-action][data-id]").forEach(btn => {
    btn.addEventListener("click", () => updateClientStatus(btn.dataset.id, btn.dataset.action));
  });
}

function renderRevenueChart(clients) {
  const chart = document.getElementById("revenue-chart");
  const labels = document.getElementById("revenue-labels");
  if (!chart || !labels) return;

  // Agrupa por plano
  const byPlan = { teste: 0, padrao: 0, personalizado: 0 };
  clients.forEach(c => {
    const plan = window.BetLocalTenant.plans[c.plano];
    byPlan[c.plano] = (byPlan[c.plano] || 0) + Number(plan?.preco || 0);
  });

  const max = Math.max(...Object.values(byPlan), 1);
  const planNames = { teste: "Teste", padrao: "Padrão", personalizado: "Personalizado" };

  chart.innerHTML = Object.entries(byPlan).map(([key, val]) => {
    const pct = Math.round((val / max) * 100);
    return `<div class="bar" style="height:${pct}%;" title="${planNames[key]}: R$ ${val}"></div>`;
  }).join("");

  labels.innerHTML = Object.entries(planNames).map(([key, name]) =>
    `<span>${name}</span>`
  ).join("");
}

function updateClientStatus(id, status) {
  const clients = window.BetLocalTenant.loadClients().map(client =>
    client.id === id ? { ...client, status } : client
  );
  window.BetLocalTenant.saveClients(clients);
}

function buildClientUrl(clientId) {
  const base = window.location.origin + window.location.pathname.replace("admin-master.html", "login.html");
  return `${base}?cliente=${encodeURIComponent(clientId)}`;
}

function buildClientAdminUrl(clientId) {
  const base = window.location.origin + window.location.pathname.replace("admin-master.html", "admin.html");
  return `${base}?cliente=${encodeURIComponent(clientId)}`;
}

function createClientId(name) {
  const base = String(name || "cliente")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "cliente";
  return `${base}-${Date.now().toString(36)}`;
}

function escapeMaster(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.BetLocalMasterCurrency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
