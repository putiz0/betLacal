param(
  [switch]$Commit
)

$ErrorActionPreference = "Stop"
$ProjectDir = "C:\projetoBetLocal"

Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Iniciando scraper..." -ForegroundColor Cyan

Set-Location -LiteralPath $ProjectDir

node scrape-placar.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "[ERRO] Scraper falhou com codigo $LASTEXITCODE" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host "[OK] Scraper concluido com sucesso!" -ForegroundColor Green

if ($Commit) {
  git add api/placar-jogos.json js/team-logos-data.json
  git commit -m "scraper: atualizacao automatica $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  git push
  Write-Host "[OK] Alterações commitadas e enviadas ao GitHub." -ForegroundColor Green
}
