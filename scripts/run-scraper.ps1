param(
  [switch]$Commit
)

$ErrorActionPreference = "Stop"
$ProjectDir = "C:\projetoBetLocal"

# Garantir que TOR_PROXY está definido para os scrapers
if (-not $env:TOR_PROXY) {
  $env:TOR_PROXY = "socks5://127.0.0.1:9150"
  Write-Host "[TOR] TOR_PROXY definido como $env:TOR_PROXY" -ForegroundColor Cyan
}

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Iniciando scrapers..." -ForegroundColor Cyan

Set-Location -LiteralPath $ProjectDir

# Passo 1: scraping de estatisticas (sofascore.com)
Write-Host "[SOFASCORE] Iniciando..." -ForegroundColor Yellow
node scrape-sofascore.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "[AVISO] scrape-sofascore falhou, continuando mesmo assim..." -ForegroundColor Yellow
}

# Garantir que api/estatisticas.json existe
if (-not (Test-Path "api/estatisticas.json")) {
  '{"_scrapedAt": null, "times": {}}' | Out-File "api/estatisticas.json" -Encoding utf8
}

# Passo 2: scraping de jogos (placardefutebol.com.br)
Write-Host "[PLACAR] Iniciando..." -ForegroundColor Yellow
node scrape-placar.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERRO] scrape-placar falhou com codigo $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[OK] Scrapers concluidos com sucesso!" -ForegroundColor Green

if ($Commit) {
  git add api/placar-jogos.json api/estatisticas.json js/team-logos-data.json
  git commit -m "scrapers: atualizacao automatica $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  git push
  Write-Host "[OK] Alterações commitadas e enviadas ao GitHub." -ForegroundColor Green
}
