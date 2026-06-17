const BETLOCAL_CONFIG = {
  // API backend: Supabase Edge Function (online) ou local
  // Edge Function: https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football
  // Local (Python): http://localhost:8000
  backendUrl: "https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football",
  
  // Modo de jogos: "auto" = tenta API real primeiro, "demo" = sempre fake, "api" = sempre tenta API
  gameMode: "auto",
  
  // Intervalo de refresh automático em segundos (0 = desligado)
  autoRefreshSeconds: 300,
  
  // Mostrar badge indicando fonte dos dados (API real vs Demo)
  showDataSourceBadge: true,
  
  // Cache TTL em segundos para evitar requisições excessivas
  cacheTtlSeconds: 120,
};

// Persistir config no localStorage
function loadConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem("betlocal.config") || "null");
    if (saved) Object.assign(BETLOCAL_CONFIG, saved);
  } catch {}
}

function saveConfig() {
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
  // Se for Edge Function do Supabase, o path já está incluído na URL base
  const base = BETLOCAL_CONFIG.backendUrl.replace(/\/$/, "");
  if (base.includes("supabase.co")) {
    return `${base}${path}`;
  }
  // Se for backend local Python
  return `${base}${path}`;
}

loadConfig();

window.BetLocalConfig = {
  ...BETLOCAL_CONFIG,
  setGameMode,
  setBackendUrl,
  getBackendUrl,
  saveConfig,
};
