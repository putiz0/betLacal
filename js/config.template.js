// ============================================
// Bet Local - TEMPLATE de configuração local (NÃO versionar)
// ============================================
// COMO USAR:
//   1. Copie este arquivo para: js/config.local.js
//   2. Preencha os valores abaixo.
//   3. Adicione a tag <script src="js/config.local.js"></script> ANTES
//      de <script src="js/config.js"></script> nas páginas que precisarem,
//      OU carregue-o globalmente.
//   4. js/config.local.js já está no .gitignore — nunca será commitado.
//
// Este arquivo define window.__BETLOCAL_CONFIG__, lido por js/config.js.

window.__BETLOCAL_CONFIG__ = {
  // API backend: Supabase Edge Function (produção) ou backend local.
  // Produção:  https://SEU_PROJETO.supabase.co/functions/v1/api-football
  // Local:     http://localhost:8000
  backendUrl: "https://SEU_PROJETO.supabase.co/functions/v1/api-football",

  // Supabase
  supabaseUrl: "https://SEU_PROJETO.supabase.co",
  // anon/public key do Supabase (é pública por design, mas NUNCA a service_role key).
  supabaseAnonKey: "COLE_AQUI_SUA_SUPABASE_ANON_KEY",

  // Modo de jogos: "auto" | "demo" | "api"
  gameMode: "auto",

  autoRefreshSeconds: 300,
  showDataSourceBadge: true,
  cacheTtlSeconds: 120,
};
