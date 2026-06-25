param(
  [switch]$Remove
)

$TaskName = "BetLocal-Scraper"
$ProjectDir = "C:\projetoBetLocal"
$ScriptPath = "$ProjectDir\scripts\run-scraper.ps1"

if ($Remove) {
  Write-Host "[TASK] Removendo tarefa '$TaskName'..." -ForegroundColor Yellow
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
  Write-Host "[OK] Tarefa removida." -ForegroundColor Green
  return
}

# Verificar se o script existe
if (-not (Test-Path $ScriptPath)) {
  Write-Host "[ERRO] Script não encontrado: $ScriptPath" -ForegroundColor Red
  exit 1
}

# Verificar se Tor está instalado
$TorPath = "C:\ProgramData\Tor\tor\tor.exe"
if (-not (Test-Path $TorPath)) {
  Write-Host "[AVISO] Tor não encontrado em $TorPath" -ForegroundColor Yellow
  Write-Host "[AVISO] Instale o Tor Expert Bundle em C:\ProgramData\Tor\ e configure o serviço" -ForegroundColor Yellow
}

Write-Host "[TASK] Registrando tarefa '$TaskName'..." -ForegroundColor Cyan
Write-Host "[TASK] Script: $ScriptPath" -ForegroundColor Cyan
Write-Host "[TASK] Horários: 06:00 e 12:00 (diário)" -ForegroundColor Cyan

# Ação: executar PowerShell com o script
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""

# Trigger 1: 06:00 todos os dias
$Trigger1 = New-ScheduledTaskTrigger -Daily -At "06:00"

# Trigger 2: 12:00 todos os dias
$Trigger2 = New-ScheduledTaskTrigger -Daily -At "12:00"

# Configurações: rodar mesmo sem usuário logado, parar após 30min
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

# Usuário atual (precisa estar logado, Tor deve estar rodando)
$CurrentUser = "$env:USERDOMAIN\$env:USERNAME"

try {
  Register-ScheduledTask -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger1, $Trigger2 `
    -Settings $Settings `
    -User $CurrentUser `
    -RunLevel Highest `
    -Description "Executa scrapers do Bet Local (placardefutebol.com.br + soccerstats.com) 2x ao dia"

  Write-Host "[OK] Tarefa '$TaskName' registrada com sucesso!" -ForegroundColor Green
  Write-Host ""
  Write-Host "Resumo:" -ForegroundColor Cyan
  Write-Host "  Nome:     $TaskName" -ForegroundColor Gray
  Write-Host "  Script:   $ScriptPath" -ForegroundColor Gray
  Write-Host "  Horários: 06:00 e 12:00 (diário)" -ForegroundColor Gray
  Write-Host "  Usuário:  $CurrentUser" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Para testar agora:" -ForegroundColor Yellow
  Write-Host "  Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
  Write-Host ""
  Write-Host "Para remover:" -ForegroundColor Yellow
  Write-Host "  .\scripts\register-task.ps1 -Remove" -ForegroundColor White
} catch {
  Write-Host "[ERRO] Falha ao registrar tarefa: $_" -ForegroundColor Red
  exit 1
}
