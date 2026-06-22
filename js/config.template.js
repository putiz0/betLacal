const BETLOCAL_CONFIG = {
  // API backend: Supabase Edge Function (online) ou local
  // Edge Function: https://SEU_PROJETO.supabase.co/functions/v1/api-football
  // Local (Python): http://localhost:8000
  backendUrl: "https://SEU_PROJETO.supabase.co/functions/v1/api-football",

  // Supabase
  supabaseUrl: "https://SEU_PROJETO.supabase.co",
  supabaseAnonKey: "sua-chave-anon-publica",

  // Modo de jogos: "auto" = tenta API real primeiro, "demo" = sempre fake, "api" = sempre tenta API
  gameMode: "auto",

  // Intervalo de refresh automático em segundos (0 = desligado)
  autoRefreshSeconds: 300,

  // Mostrar badge indicando fonte dos dados (API real vs Demo)
  showDataSourceBadge: true,

  // Cache TTL em segundos para evitar requisições excessivas
  cacheTtlSeconds: 120,
};
