const BETLOCAL_TENANT_KEYS = {
  clients: "betlocal.clients",
  session: "betlocal.session"
};

const BETLOCAL_PLANS = {
  teste: {
    nome: "Teste grátis", preco: 0, dias: 30,
    features: {}
  },
  padrao: {
    nome: "Plano Padrão", preco: 150, dias: 30,
    features: {}
  },
  plus: {
    nome: "Plano Plus", preco: 180, dias: 30,
    features: { nome_personalizado: true }
  },
  master: {
    nome: "Plano Master", preco: 200, dias: 30,
    features: { nome_personalizado: true, cores_personalizadas: true, ajustes_visuais: true }
  }
};

function getPlanFeatures(planId) {
  const plan = BETLOCAL_PLANS[planId];
  return plan ? plan.features : {};
}

function planHasFeature(planId, feature) {
  return !!getPlanFeatures(planId)[feature];
}

const DEFAULT_CLIENT_ID = "cliente-local";

// Cliente de demonstracao SEM credenciais hardcoded.
// O login demo (usuario/senha) e fornecido via window.__BETLOCAL_DEMO_USERS__
// em js/config.local.js (nao versionado) e so ativa em gameMode "demo".
const DEFAULT_CLIENTS = [
  {
    id: DEFAULT_CLIENT_ID,
    nome: "Bet Local",
    email: "dono@betlocal.local",
    plano: "master",
    inicio: new Date().toISOString().slice(0, 10),
    vencimento: addDays(new Date(), 30).toISOString().slice(0, 10),
    status: "teste",
    tema: {
      nome_sistema: "Bet Local",
      cor_primaria: "#ff5a16",
      cor_fundo: "#090b10",
      logo_url: ""
    },
    usuarios: []
  }
];

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadClients() {
  const clients = readJSON(BETLOCAL_TENANT_KEYS.clients, null);
  if (Array.isArray(clients) && clients.length) return clients;
  saveJSON(BETLOCAL_TENANT_KEYS.clients, DEFAULT_CLIENTS);
  return DEFAULT_CLIENTS;
}

function saveClients(clients) {
  saveJSON(BETLOCAL_TENANT_KEYS.clients, clients);
  window.dispatchEvent(new CustomEvent("betlocal:clients-updated"));
}

function getSession() {
  return readJSON(BETLOCAL_TENANT_KEYS.session, null);
}

function isValidSession(session) {
  return session && typeof session === "object"
    && typeof session.email === "string"
    && typeof session.role === "string"
    && typeof session.cliente_id === "string";
}

function setSession(session) {
  if (!isValidSession(session)) throw new Error("Sessão inválida.");
  saveJSON(BETLOCAL_TENANT_KEYS.session, session);
  window.dispatchEvent(new CustomEvent("betlocal:session-updated"));
}

function getClientById(clientId) {
  // Cliente virtual de demonstração
  if (clientId === "demo") {
    return {
      id: "demo",
      nome: "Demonstração",
      plano: "demo",
      status: "demo",
      vencimento: null,
      tema: {
        nome_sistema: "Bet Local — Demonstração",
        cor_primaria: "#ff5a16",
        cor_fundo: "#090b10",
        logo_url: null
      },
      usuarios: []
    };
  }
  return loadClients().find((client) => client.id === clientId) || loadClients()[0];
}

function getCurrentClient() {
  const params = new URLSearchParams(window.location.search);
  // Se tem ?demo, força cliente demo
  if (params.has("demo")) {
    return getClientById("demo");
  }
  const clientFromUrl = params.get("cliente");
  const session = getSession();
  return getClientById(clientFromUrl || session?.cliente_id || DEFAULT_CLIENT_ID);
}

function daysRemaining(client) {
  if (!client?.vencimento) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(`${client.vencimento}T00:00:00`);
  return Math.ceil((dueDate - today) / 86400000);
}

function computedLicenseStatus(client) {
  if (!client) return "suspenso";
  if (client.status === "cancelado" || client.status === "suspenso") return client.status;
  const remaining = daysRemaining(client);
  if (remaining >= 0) return client.status || "ativo";
  if (remaining >= -5) return "atrasado";
  return "suspenso";
}

function canAccessClient(client) {
  const status = computedLicenseStatus(client);
  return !["suspenso", "cancelado"].includes(status);
}

function isValidHexColor(str) {
  return /^#[0-9a-fA-F]{3,8}$/.test(String(str).trim());
}

function sanitizeUrl(str) {
  const value = String(str || "").trim();
  if (!value) return "";
  // Permite apenas http(s) e caminhos relativos. Bloqueia javascript:, data:, etc.
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("/") || value.startsWith("./")) {
    // Remove caracteres perigosos para contexto CSS/url().
    return value.replace(/[<>"'`{}|^\\]/g, "");
  }
  return "";
}

function applyClientTheme(client = getCurrentClient()) {
  const theme = client?.tema || {};
  const features = getPlanFeatures(client?.plano);
  const root = document.documentElement;
  if (features.cores_personalizadas) {
    const primaria = String(theme.cor_primaria || "").trim();
    if (primaria && isValidHexColor(primaria)) {
      root.style.setProperty("--orange", primaria);
      root.style.setProperty("--orange-2", primaria);
    }
    const fundo = String(theme.cor_fundo || "").trim();
    if (fundo && isValidHexColor(fundo)) {
      root.style.setProperty("--bg", fundo);
    }
  }

  if (features.nome_personalizado) {
    document.querySelectorAll("[data-brand-name]").forEach((element) => {
      element.textContent = theme.nome_sistema || client?.nome || "Bet Local";
    });
    document.querySelectorAll(".brand-mark").forEach((element) => {
      if (theme.logo_url) {
        element.style.background = `url("${sanitizeUrl(theme.logo_url)}") center/cover`;
        element.textContent = "";
      } else {
        element.style.background = "";
        element.textContent = (theme.nome_sistema || client?.nome || "BL").slice(0, 2).toUpperCase();
      }
    });
  }
}

function showLicenseBlock(client) {
  document.body.innerHTML = `
    <main class="auth-shell">
      <section class="auth-card">
        <span class="eyebrow">Licenca bloqueada</span>
        <h1>Sistema suspenso</h1>
        <p>O acesso deste cliente esta ${computedLicenseStatus(client)}. Reative no painel geral para liberar novamente.</p>
        <a class="primary-link" href="admin-master.html">Abrir painel geral</a>
      </section>
    </main>
  `;
}

function getExpiryWarning(client) {
  if (!client?.vencimento) return null;
  const remaining = daysRemaining(client);
  const status = computedLicenseStatus(client);
  if (status === "suspenso" || status === "cancelado") {
    return { level: "critical", message: `Licença ${status}. Renove para reativar.` };
  }
  if (remaining < 0) {
    return { level: "danger", message: `Atrasado há ${Math.abs(remaining)} dia(s). Renove imediatamente!` };
  }
  if (remaining <= 5) {
    return { level: "warning", message: `Vence em ${remaining} dia(s). Renove para evitar bloqueio.` };
  }
  return null;
}

function renderExpiryBanner() {
  const client = getCurrentClient();
  const warning = getExpiryWarning(client);
  if (!warning) return;
  const banner = document.createElement("div");
  banner.className = `license-banner license-${warning.level}`;
  banner.innerHTML = `
    <span>⚠️ ${warning.message}</span>
    <button onclick="this.parentElement.remove()" aria-label="Fechar">&times;</button>
  `;
  document.body.prepend(banner);
}

function renewClient(clientId, days = 30) {
  const clients = loadClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) throw new Error("Cliente não encontrado.");
  const currentVenc = client.vencimento ? new Date(client.vencimento) : new Date();
  const newVenc = addDays(currentVenc, days);
  client.vencimento = newVenc.toISOString().slice(0, 10);
  if (client.status === "suspenso" || client.status === "cancelado" || client.status === "atrasado") {
    client.status = "ativo";
  }
  saveClients(clients);
  return client;
}

function cancelClientLicense(clientId) {
  const clients = loadClients();
  const client = clients.find(c => c.id === clientId);
  if (!client) throw new Error("Cliente não encontrado.");
  if (client.status === "cancelado") throw new Error("Licença já está cancelada.");
  client.status = "cancelado";
  saveClients(clients);
  return client;
}

function enforceClientLicense() {
  const client = getCurrentClient();
  applyClientTheme(client);
  if (!canAccessClient(client) && !document.body.dataset.page?.includes("master")) {
    showLicenseBlock(client);
    return false;
  }
  renderExpiryBanner();
  return true;
}

const _loginAttempts = new Map();

// Indica se o modo demo local (sem Supabase Auth) esta habilitado.
// So e verdadeiro quando o app esta em gameMode "demo" e existem usuarios
// demo definidos em window.__BETLOCAL_DEMO_USERS__ (js/config.local.js).
function isLocalDemoAuthEnabled() {
  const mode = window.BetLocalConfig?.gameMode;
  const demoUsers = window.__BETLOCAL_DEMO_USERS__;
  return mode === "demo" && Array.isArray(demoUsers) && demoUsers.length > 0;
}

async function signIn(email, password) {
  const normalizedEmail = String(email).toLowerCase().trim();
  const attempts = _loginAttempts.get(normalizedEmail) || 0;
  if (attempts >= 5) {
    throw new Error("Muitas tentativas. Aguarde 30 segundos.");
  }

  if (window.BetLocalSupabase?.client?.auth) {
    const { data, error } = await window.BetLocalSupabase.client.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (!error && data?.user) {
      _loginAttempts.delete(normalizedEmail);
      const profile = await window.BetLocalSupabase.fetchCurrentProfile?.();
      const client = getClientById(profile?.cliente_id || getCurrentClient().id);
      const session = {
        email: data.user.email,
        role: profile?.role || "dono",
        cliente_id: client.id,
        provider: "supabase"
      };
      setSession(session);
      return session;
    }
  }

  // Fallback de demonstracao: SOMENTE em gameMode "demo" com usuarios
  // definidos via config local nao-versionada. Nunca hardcodeado.
  if (isLocalDemoAuthEnabled()) {
    const demoUsers = window.__BETLOCAL_DEMO_USERS__;
    const user = demoUsers.find((u) =>
      String(u.email || "").toLowerCase().trim() === normalizedEmail && u.password === password
    );
    if (user) {
      _loginAttempts.delete(normalizedEmail);
      const client = getClientById(user.cliente_id || DEFAULT_CLIENT_ID);
      const session = {
        email: user.email,
        role: user.role || "dono",
        cliente_id: client.id,
        provider: "local-demo"
      };
      setSession(session);
      return session;
    }
  }

  _loginAttempts.set(normalizedEmail, attempts + 1);
  setTimeout(() => _loginAttempts.delete(normalizedEmail), 30000);
  throw new Error("Email ou senha invalidos.");
}

function signOut() {
  localStorage.removeItem(BETLOCAL_TENANT_KEYS.session);
  window.BetLocalSupabase?.client?.auth?.signOut?.();
  window.location.href = "index.html";
}

function requireRoles(roles, onAllowed) {
  const session = getSession();
  const client = getCurrentClient();
  applyClientTheme(client);

  if (!session || !roles.includes(session.role) || !canAccessClient(client)) {
    renderLoginGate(roles);
    return;
  }

  onAllowed?.(session, client);
}

function renderLoginGate(roles) {
  document.body.innerHTML = `
    <main class="auth-shell">
      <form class="auth-card" id="tenant-login-form">
        <span class="eyebrow">Acesso restrito</span>
        <h1>Entrar no painel</h1>
        <label>Email<input name="email" type="email" autocomplete="email" required></label>
        <label>Senha<input name="password" type="password" autocomplete="current-password" required></label>
        <button class="primary-btn" type="submit">Entrar</button>
      </form>
    </main>
  `;

  document.getElementById("tenant-login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const session = await signIn(String(form.get("email")), String(form.get("password")));
      if (!roles.includes(session.role)) throw new Error("Usuario sem permissao para esta tela.");
      window.location.reload();
    } catch (error) {
      alert(error.message || "Nao foi possivel entrar.");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadClients();
  enforceClientLicense();
});

function addUserToClient(clientId, user) {
  const clients = loadClients();
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error("Cliente não encontrado.");
  if (!client.usuarios) client.usuarios = [];
  if (client.usuarios.some((u) => u.email === user.email)) {
    throw new Error("Já existe um usuário com este email.");
  }
  client.usuarios.push(user);
  saveClients(clients);
}

function removeUserFromClient(clientId, email) {
  const clients = loadClients();
  const client = clients.find((c) => c.id === clientId);
  if (!client) throw new Error("Cliente não encontrado.");
  const session = getSession();
  // Impede remover a si mesmo ou o último dono
  const remainingDonos = client.usuarios.filter((u) => u.role === "dono");
  const target = client.usuarios.find((u) => u.email === email);
  if (!target) throw new Error("Usuário não encontrado.");
  if (target.role === "dono" && remainingDonos.length <= 1) {
    throw new Error("Não é possível remover o único dono.");
  }
  if (session?.email === email) {
    throw new Error("Você não pode remover a si mesmo.");
  }
  client.usuarios = client.usuarios.filter((u) => u.email !== email);
  saveClients(clients);
}

window.BetLocalTenant = {
  plans: BETLOCAL_PLANS,
  getPlanFeatures,
  planHasFeature,
  loadClients,
  saveClients,
  getSession,
  setSession,
  signIn,
  signOut,
  getCurrentClient,
  getClientById,
  daysRemaining,
  computedLicenseStatus,
  getExpiryWarning,
  canAccessClient,
  applyClientTheme,
  enforceClientLicense,
  requireRoles,
  addUserToClient,
  removeUserFromClient,
  renewClient,
  cancelClientLicense
};
