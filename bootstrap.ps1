<#
.SYNOPSIS
  Bootstrap do Agentic Starter (Windows nativo / PowerShell 5.1+ / pwsh 7+).

.DESCRIPTION
  Espelho de bootstrap.sh para ambientes sem bash. Detecta stack do projeto,
  pergunta PRODUCT_NAME/TEAM/DOMAIN/STACK (interativo) ou aceita via flags,
  substitui <PLACEHOLDERS> em arquivos texto, salva `.starter-meta.json` e
  imprime próximos passos.

.EXAMPLE
  PS> .\bootstrap.ps1
  PS> .\bootstrap.ps1 -Product "MyApp" -Team "Squad-X" -Domain "fintech" -Stack "node-ts"

.NOTES
  Para macOS/Linux use `./bootstrap.sh`. Os dois arquivos produzem o mesmo
  resultado. Mantenha em sincronia ao alterar.
#>
[CmdletBinding()]
param(
  [string]$Product = "",
  [string]$Team    = "",
  [string]$Domain  = "",
  [string]$Stack   = "",
  [switch]$NonInteractive
)

$ErrorActionPreference = "Stop"

# ---------------------------------------------------------------------------
# auto-detect stack
# ---------------------------------------------------------------------------
function Detect-Stack {
  if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw
    if     ($pkg -match '"next"')                      { return "next-ts" }
    elseif ($pkg -match '"react"')                     { return "react-ts" }
    elseif ($pkg -match '"vue"')                       { return "vue-ts" }
    elseif ($pkg -match '"@nestjs/core"|"nestjs"')     { return "nestjs" }
    elseif ($pkg -match '"express"')                   { return "node-express" }
    else                                               { return "node-ts" }
  }
  if (Get-ChildItem -Filter "*.csproj" -File -ErrorAction SilentlyContinue) { return "dotnet" }
  if (Get-ChildItem -Filter "*.sln"    -File -ErrorAction SilentlyContinue) { return "dotnet" }
  if ((Test-Path "pyproject.toml") -or (Test-Path "requirements.txt")) {
    $py = ""
    if (Test-Path "pyproject.toml")    { $py += (Get-Content "pyproject.toml" -Raw) }
    if (Test-Path "requirements.txt")  { $py += (Get-Content "requirements.txt" -Raw) }
    if     ($py -match '(?i)django')  { return "python-django" }
    elseif ($py -match '(?i)fastapi') { return "python-fastapi" }
    elseif ($py -match '(?i)flask')   { return "python-flask" }
    else                              { return "python" }
  }
  if (Test-Path "go.mod")           { return "go" }
  if (Test-Path "Cargo.toml")       { return "rust" }
  if (Test-Path "pubspec.yaml")     { return "flutter" }
  if (Test-Path "composer.json") {
    if ((Get-Content "composer.json" -Raw) -match "laravel/framework") { return "laravel" }
    return "php"
  }
  if (Test-Path "Gemfile")          { return "ruby" }
  if (Test-Path "mix.exs")          { return "elixir" }
  if (Test-Path "build.gradle.kts") { return "kotlin-gradle" }
  if (Test-Path "build.gradle")     { return "java-gradle" }
  if (Test-Path "pom.xml")          { return "java-maven" }
  return "unknown"
}

# ---------------------------------------------------------------------------
# interactive
# ---------------------------------------------------------------------------
$interactive = -not $NonInteractive -and -not ($Product -or $Team -or $Domain -or $Stack)

if ($interactive) {
  Write-Host "=========================================="
  Write-Host "  Agentic Starter - Bootstrap (PowerShell)"
  Write-Host "=========================================="
  Write-Host ""

  $defaultProduct = (Get-Item -Path ".").Name
  $resp = Read-Host "Nome do produto [$defaultProduct]"
  if (-not $Product) { $Product = if ($resp) { $resp } else { $defaultProduct } }

  $resp = Read-Host "Time/Squad responsavel [Plataforma]"
  if (-not $Team) { $Team = if ($resp) { $resp } else { "Plataforma" } }

  $resp = Read-Host "Dominio de negocio (ex: fintech, healthtech, edtech) [generico]"
  if (-not $Domain) { $Domain = if ($resp) { $resp } else { "generico" } }

  $detected = Detect-Stack
  $resp = Read-Host "Stack [$detected]"
  if (-not $Stack) { $Stack = if ($resp) { $resp } else { $detected } }
}

# fallback defaults
if (-not $Product) { $Product = (Get-Item -Path ".").Name }
if (-not $Team)    { $Team    = "Plataforma" }
if (-not $Domain)  { $Domain  = "generico" }
if (-not $Stack)   { $Stack   = Detect-Stack }

Write-Host ""
Write-Host "-> PRODUCT_NAME: $Product"
Write-Host "-> TEAM:         $Team"
Write-Host "-> DOMAIN:       $Domain"
Write-Host "-> STACK:        $Stack"
Write-Host ""

# ---------------------------------------------------------------------------
# substitui placeholders
# ---------------------------------------------------------------------------
Write-Host "Substituindo placeholders em arquivos .md/.json/.toml/.yml/.ts..."

$exts     = @("*.md","*.json","*.toml","*.yml","*.yaml","*.ts")
$skipName = @("_BOOTSTRAP.md","INIT.md","bootstrap.sh","bootstrap.ps1")
$skipPath = @("\node_modules\","\.git\","\presentation\")

$touched = 0
$files = Get-ChildItem -Path . -Recurse -File -Include $exts -ErrorAction SilentlyContinue
foreach ($f in $files) {
  if ($skipName -contains $f.Name) { continue }
  $skip = $false
  foreach ($p in $skipPath) { if ($f.FullName -like "*$p*") { $skip = $true; break } }
  if ($skip) { continue }

  # detect text (skip se primeiros 8KB tem byte NUL)
  $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
  $head  = if ($bytes.Length -gt 8192) { $bytes[0..8191] } else { $bytes }
  if ($head -contains 0) { continue }

  $content = [System.IO.File]::ReadAllText($f.FullName)
  $orig    = $content
  $content = $content.Replace("<PRODUCT_NAME>", $Product)
  $content = $content.Replace("<TEAM>",         $Team)
  $content = $content.Replace("<DOMAIN>",       $Domain)
  $content = $content.Replace("<STACK>",        $Stack)
  if ($content -ne $orig) {
    [System.IO.File]::WriteAllText($f.FullName, $content)
    $touched++
  }
}
Write-Host "-> $touched arquivos atualizados."
Write-Host ""

# ---------------------------------------------------------------------------
# salva metadados (.starter-meta.json)
# ---------------------------------------------------------------------------
$meta = [ordered]@{
  product_name     = $Product
  team             = $Team
  domain           = $Domain
  stack            = $Stack
  bootstrapped_at  = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  starter_version  = "0.1.0"
}
$meta | ConvertTo-Json | Out-File -FilePath ".starter-meta.json" -Encoding utf8
Write-Host "-> .starter-meta.json salvo."
Write-Host ""

# ---------------------------------------------------------------------------
# rodar INIT.md automaticamente (opcional, interativo)
# ---------------------------------------------------------------------------
$initPrompt = 'Le INIT.md e executa. Mapeia o codigo deste repo e preenche .specs/product/ + .specs/architecture/ com dados reais. Use multi-agents em paralelo.'
$runInit    = $false
$chosenCli  = ""

if ($interactive -and (Test-Path "INIT.md")) {
  Write-Host "=========================================="
  Write-Host "  Mapeamento profundo (INIT.md)"
  Write-Host "=========================================="
  Write-Host ""
  Write-Host "Posso rodar AGORA o mapeamento profundo do projeto"
  Write-Host "(le seu codigo e preenche .specs/ com entidades,"
  Write-Host "integracoes e comandos reais - multi-agents)."
  Write-Host ""

  function Has-Cmd($name) { [bool](Get-Command $name -ErrorAction SilentlyContinue) }
  $hasClaude   = Has-Cmd "claude"
  $hasCodex    = Has-Cmd "codex"
  $hasCopilot  = (Has-Cmd "gh") -and (gh extension list 2>$null | Select-String -Quiet "copilot")
  $hasHermes   = Has-Cmd "hermes"
  $hasOpenclaw = Has-Cmd "openclaw"

  Write-Host "CLIs detectadas nesta maquina:"
  if ($hasClaude)   { Write-Host "  [c] Claude Code         (recomendado - agentic loop completo)" }
  if ($hasCodex)    { Write-Host "  [x] Codex" }
  if ($hasCopilot)  { Write-Host "  [g] GitHub Copilot CLI  (sem agentic loop - copia prompt pro clipboard)" }
  if ($hasHermes)   { Write-Host "  [h] Hermes Agent        (Nous Research)" }
  if ($hasOpenclaw) { Write-Host "  [o] OpenClaw" }
  if (-not ($hasClaude -or $hasCodex -or $hasCopilot -or $hasHermes -or $hasOpenclaw)) {
    Write-Host "  (nenhuma encontrada - instale uma e rode manualmente depois)"
  }
  Write-Host "  [n] Nao rodar agora"
  Write-Host ""
  $choice = Read-Host "Escolha [n]"
  if (-not $choice) { $choice = "n" }

  switch ($choice.ToLower()) {
    "c" { if ($hasClaude)   { $runInit=$true; $chosenCli="claude" }   else { Write-Host "Claude Code nao instalado. Instala: https://docs.claude.com/claude-code" } }
    "x" { if ($hasCodex)    { $runInit=$true; $chosenCli="codex" }    else { Write-Host "Codex nao instalado. Instala: https://github.com/openai/codex" } }
    "g" { if ($hasCopilot)  {                $chosenCli="copilot" }   else { Write-Host "GitHub Copilot CLI nao instalado. Instala: gh extension install github/gh-copilot" } }
    "h" { if ($hasHermes)   { $runInit=$true; $chosenCli="hermes" }   else { Write-Host "Hermes Agent nao instalado. Instala: https://github.com/NousResearch/hermes-agent" } }
    "o" { if ($hasOpenclaw) { $runInit=$true; $chosenCli="openclaw" } else { Write-Host "OpenClaw nao instalado. Instala: npm install -g openclaw@latest" } }
  }
}

# ---------------------------------------------------------------------------
# executa CLI escolhida (handoff)
# ---------------------------------------------------------------------------
function Copy-ToClipboard($text) {
  try { Set-Clipboard -Value $text } catch { }
}

if ($runInit -and $chosenCli -eq "claude") {
  Write-Host ""
  Write-Host "=========================================="
  Write-Host "  Executando Claude Code com INIT.md"
  Write-Host "=========================================="
  Write-Host ""
  & claude $initPrompt
  exit $LASTEXITCODE
}
elseif ($runInit -and $chosenCli -eq "codex") {
  Write-Host ""
  Write-Host "=========================================="
  Write-Host "  Executando Codex com INIT.md"
  Write-Host "=========================================="
  Write-Host ""
  & codex exec $initPrompt
  exit $LASTEXITCODE
}
elseif ($runInit -and $chosenCli -eq "hermes") {
  Write-Host ""
  Write-Host "=========================================="
  Write-Host "  Executando Hermes Agent com INIT.md"
  Write-Host "=========================================="
  Write-Host ""
  Copy-ToClipboard $initPrompt
  Write-Host "(prompt copiado pro clipboard como fallback - cole se Hermes abrir vazio)"
  Write-Host ""
  & hermes $initPrompt
  exit $LASTEXITCODE
}
elseif ($runInit -and $chosenCli -eq "openclaw") {
  Write-Host ""
  Write-Host "=========================================="
  Write-Host "  Executando OpenClaw com INIT.md"
  Write-Host "=========================================="
  Write-Host ""
  Copy-ToClipboard $initPrompt
  Write-Host "(prompt copiado pro clipboard como fallback - cole se OpenClaw abrir vazio)"
  Write-Host ""
  & openclaw $initPrompt
  exit $LASTEXITCODE
}
elseif ($chosenCli -eq "copilot") {
  Write-Host ""
  Write-Host "GitHub Copilot CLI nao executa agentic loop autonomo (so sugere comandos)."
  Write-Host ""
  Copy-ToClipboard $initPrompt
  Write-Host "-> Prompt copiado pro clipboard. Cole com Ctrl+V no Copilot Chat (VS Code)."
  Write-Host ""
  Write-Host "Prompt:"
  Write-Host "  $initPrompt"
  Write-Host ""
}

# ---------------------------------------------------------------------------
# proximos passos
# ---------------------------------------------------------------------------
@'
=========================================
  PROXIMOS PASSOS
=========================================

1) Abra um agente nesta pasta e cole o prompt:

   "Le INIT.md e executa. Mapeia o codigo deste repo e
    preenche .specs/product/ + .specs/architecture/ com
    dados reais. Use multi-agents em paralelo."

   Opcoes: claude, codex, ou Copilot Chat (VS Code).

2) Apos mapeamento:
   - Reveja VISION.md, DOMAIN.md, DESIGN.md
   - Crie sprint-02 e primeira task em .specs/sprints/
   - Commit: git add -A; git commit -m "chore: bootstrap agentic starter"

3) (opcional) Apaga este script + _BOOTSTRAP.md + INIT.md
   apos mapeamento, se nao quiser deixar no repo final.
'@ | Write-Host
