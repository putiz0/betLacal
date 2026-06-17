// supabase/cron/jogos-refresh.yml
// Cron job que atualiza o cache de jogos 2x por dia (06:00 e 18:00 Brasília)
// Para configurar:
//   1. No Supabase Dashboard, vá em Database → Cron Jobs (ou use a CLI)
//   2. Cole este conteúdo OU use: supabase db push (após colocar em migrations)
//
// Alternativa sem CLI: criar via Dashboard
//   Database → Cron Jobs → Create job
//   Name: refresh-jogos-morning
//   Schedule: 0 9 * * *  (9:00 UTC = 06:00 Brasília)
//   SQL: select net.http_get('https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/refresh');
//
//   Name: refresh-jogos-evening
//   Schedule: 0 21 * * *  (21:00 UTC = 18:00 Brasília)
//   SQL: (mesmo)

jobs:
  - name: refresh-jogos-morning
    schedule: "0 9 * * *"
    command: |
      select net.http_get(
        'https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/refresh',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.functions_jwt_secret'))
      );

  - name: refresh-jogos-evening
    schedule: "0 21 * * *"
    command: |
      select net.http_get(
        'https://uagwqerjcjjlnftytkqe.supabase.co/functions/v1/api-football/refresh',
        headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.functions_jwt_secret'))
      );
