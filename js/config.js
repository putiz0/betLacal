// ============================================
// Bet Local - Configuração (sem secrets hardcoded)
// ============================================
// Este arquivo NÃO contém chaves nem URLs de produção.
// As configurações sensíveis (Supabase URL/anon key, backendUrl)
// devem vir de UMA das fontes abaixo, em ordem de prioridade:
//
//   1. window.__BETLOCAL_CONFIG__  -> definida por um arquivo local
//      não-versionado (ex.: js/config.local.js), carregado antes deste.
//   2. localStorage["betlocal.config"] -> setado pelo painel admin.
//   3. Defaults não-secretos abaixo (modo degradado/demo).
//
// Veja js/config.template.js para criar o seu js/config.local.js.

const BETLOCAL_CONFIG_DEFAULTS = {
  // API backend: Supabase Edge Function (produção) ou local.
  // Vazio por padrão -> o app avisa no console e roda em modo demo.
  backendUrl: "",

  // Supabase
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Modo de jogos: "auto" = tenta API real primeiro, "demo" = sempre fake, "api" = sempre tenta API
  gameMode: "demo",

  // Intervalo de refresh automático em segundos (0 = desligado)
  autoRefreshSeconds: 300,

  // Mostrar badge indicando fonte dos dados (API real vs Demo)
  showDataSourceBadge: true,

  // Cache TTL em segundos para evitar requisições excessivas
  cacheTtlSeconds: 120,
};

function readInjectedConfig() {
  // 1. Config injetada por arquivo local não-versionado (config.local.js)
  if (typeof window !== "undefined" && window.__BETLOCAL_CONFIG__) {
    return window.__BETLOCAL_CONFIG__;
  }
  // 2. Config persistida no localStorage pelo painel admin
  try {
    const saved = JSON.parse(localStorage.getItem("betlocal.config") || "null");
    if (saved && typeof saved === "object") return saved;
  } catch {
    /* ignora localStorage inválido */
  }
  return {};
}

function loadConfig() {
  const injected = readInjectedConfig();
  return Object.assign({}, BETLOCAL_CONFIG_DEFAULTS, injected);
}

const BETLOCAL_CONFIG = loadConfig();

function saveConfig() {
  // Só persiste o que não é default sensível; mantém compatibilidade com painel admin.
  localStorage.setItem("betlocal.config", JSON.stringify(BETLOCAL_CONFIG));
}

function setGameMode(mode) {
  BETLOCAL_CONFIG.gameMode = mode;
  saveConfig();
}

function setBackendUrl(url) {
  BETLOCAL_CONFIG.backendUrl = url;
  saveConfig();
}

function getBackendUrl(path = "/fixtures") {
  const base = (BETLOCAL_CONFIG.backendUrl || "").replace(/\/$/, "");
  if (!base) return "";
  // Edge Function do Supabase já inclui o path base na URL.
  return `${base}${path}`;
}

function isConfigured() {
  return Boolean(BETLOCAL_CONFIG.backendUrl && BETLOCAL_CONFIG.supabaseUrl && BETLOCAL_CONFIG.supabaseAnonKey);
}

if (!isConfigured() && typeof console !== "undefined") {
  console.warn(
    "[BetLocal] Configuração incompleta: backendUrl/supabaseUrl/supabaseAnonKey ausentes. " +
      "Defina-os via js/config.local.js (veja js/config.template.js). Rodando em modo demo/degradado."
  );
}

window.BetLocalConfig = {
  ...BETLOCAL_CONFIG,
  setGameMode,
  setBackendUrl,
  getBackendUrl,
  saveConfig,
  isConfigured,
  supabaseUrl: BETLOCAL_CONFIG.supabaseUrl,
  supabaseAnonKey: BETLOCAL_CONFIG.supabaseAnonKey,
};
