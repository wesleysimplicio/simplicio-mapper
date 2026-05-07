#!/usr/bin/env bash
# bootstrap.sh — inicializa o Agentic Starter num projeto novo.
#
# O que faz:
#   1. Detecta stack do projeto (Node, .NET, Python, Go, Rust, Flutter, PHP, Ruby)
#   2. Pergunta PRODUCT_NAME, TEAM, DOMAIN (interativo) ou aceita via flags
#   3. Substitui <PLACEHOLDERS> em todos .md
#   4. Salva escolhas em .starter-meta.json
#   5. Imprime próximos passos (rodar Claude Code com INIT.md)
#
# Uso interativo:
#   ./bootstrap.sh
#
# Uso não-interativo (CI):
#   ./bootstrap.sh --product "MyApp" --team "Squad-X" --domain "fintech" --stack "node-ts"

set -euo pipefail

# ---------------------------------------------------------------------------
# args
# ---------------------------------------------------------------------------
PRODUCT_NAME=""
TEAM=""
DOMAIN=""
STACK=""
INTERACTIVE=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --product) PRODUCT_NAME="$2"; INTERACTIVE=0; shift 2 ;;
    --team)    TEAM="$2";         INTERACTIVE=0; shift 2 ;;
    --domain)  DOMAIN="$2";       INTERACTIVE=0; shift 2 ;;
    --stack)   STACK="$2";        INTERACTIVE=0; shift 2 ;;
    -h|--help) sed -n '2,18p' "$0"; exit 0 ;;
    *) echo "flag desconhecida: $1" >&2; exit 1 ;;
  esac
done

# ---------------------------------------------------------------------------
# auto-detect stack
# ---------------------------------------------------------------------------
detect_stack() {
  if [[ -f package.json ]]; then
    if   grep -q '"next"'                package.json; then echo "next-ts"
    elif grep -q '"react"'               package.json; then echo "react-ts"
    elif grep -q '"vue"'                 package.json; then echo "vue-ts"
    elif grep -q '"@nestjs/core"\|"nestjs"' package.json; then echo "nestjs"
    elif grep -q '"express"'             package.json; then echo "node-express"
    else echo "node-ts"
    fi
  elif compgen -G "*.csproj" >/dev/null 2>&1; then echo "dotnet"
  elif compgen -G "*.sln"    >/dev/null 2>&1; then echo "dotnet"
  elif [[ -f pyproject.toml || -f requirements.txt ]]; then
    if   grep -qi 'django'  pyproject.toml requirements.txt 2>/dev/null; then echo "python-django"
    elif grep -qi 'fastapi' pyproject.toml requirements.txt 2>/dev/null; then echo "python-fastapi"
    elif grep -qi 'flask'   pyproject.toml requirements.txt 2>/dev/null; then echo "python-flask"
    else echo "python"
    fi
  elif [[ -f go.mod ]];        then echo "go"
  elif [[ -f Cargo.toml ]];    then echo "rust"
  elif [[ -f pubspec.yaml ]];  then echo "flutter"
  elif [[ -f composer.json ]]; then
    if grep -q 'laravel/framework' composer.json; then echo "laravel"
    else echo "php"
    fi
  elif [[ -f Gemfile ]];       then echo "ruby"
  elif [[ -f mix.exs ]];       then echo "elixir"
  elif [[ -f build.gradle.kts ]]; then echo "kotlin-gradle"
  elif [[ -f build.gradle ]];     then echo "java-gradle"
  elif [[ -f pom.xml ]];          then echo "java-maven"
  else echo "unknown"
  fi
}

# ---------------------------------------------------------------------------
# interactive
# ---------------------------------------------------------------------------
if [[ "$INTERACTIVE" == "1" ]]; then
  echo "=========================================="
  echo "  Agentic Starter - Bootstrap"
  echo "=========================================="
  echo ""

  default_product="$(basename "$PWD")"
  read -r -p "Nome do produto [$default_product]: " input
  PRODUCT_NAME="${input:-$default_product}"

  read -r -p "Time/Squad responsável [Plataforma]: " input
  TEAM="${input:-Plataforma}"

  read -r -p "Domínio de negócio (ex: fintech, healthtech, edtech) [generico]: " input
  DOMAIN="${input:-generico}"

  detected="$(detect_stack)"
  read -r -p "Stack [$detected]: " input
  STACK="${input:-$detected}"
fi

# ---------------------------------------------------------------------------
# fallback defaults
# ---------------------------------------------------------------------------
PRODUCT_NAME="${PRODUCT_NAME:-$(basename "$PWD")}"
TEAM="${TEAM:-Plataforma}"
DOMAIN="${DOMAIN:-generico}"
STACK="${STACK:-$(detect_stack)}"

echo ""
echo "→ PRODUCT_NAME: $PRODUCT_NAME"
echo "→ TEAM:         $TEAM"
echo "→ DOMAIN:       $DOMAIN"
echo "→ STACK:        $STACK"
echo ""

# ---------------------------------------------------------------------------
# substitui placeholders
# ---------------------------------------------------------------------------
EXCLUDES=(
  "-not" "-name" "_BOOTSTRAP.md"
  "-not" "-name" "INIT.md"
  "-not" "-name" "bootstrap.sh"
  "-not" "-path" "./node_modules/*"
  "-not" "-path" "./.git/*"
  "-not" "-path" "./presentation/*.pdf"
  "-not" "-path" "./presentation/*.pptx"
)

echo "Substituindo placeholders em arquivos .md/.json/.toml/.yml/.ts..."
TOUCHED=0
while IFS= read -r f; do
  if file "$f" | grep -q text; then
    if sed --version >/dev/null 2>&1; then
      sed -i \
        -e "s|<PRODUCT_NAME>|$PRODUCT_NAME|g" \
        -e "s|<TEAM>|$TEAM|g" \
        -e "s|<DOMAIN>|$DOMAIN|g" \
        -e "s|<STACK>|$STACK|g" \
        "$f"
    else
      sed -i '' \
        -e "s|<PRODUCT_NAME>|$PRODUCT_NAME|g" \
        -e "s|<TEAM>|$TEAM|g" \
        -e "s|<DOMAIN>|$DOMAIN|g" \
        -e "s|<STACK>|$STACK|g" \
        "$f"
    fi
    TOUCHED=$((TOUCHED+1))
  fi
done < <(find . -type f \
  \( -name "*.md" -o -name "*.json" -o -name "*.toml" -o -name "*.yml" -o -name "*.yaml" -o -name "*.ts" \) \
  "${EXCLUDES[@]}")

echo "→ $TOUCHED arquivos atualizados."
echo ""

# ---------------------------------------------------------------------------
# salva metadados
# ---------------------------------------------------------------------------
cat > .starter-meta.json <<EOF
{
  "product_name": "$PRODUCT_NAME",
  "team": "$TEAM",
  "domain": "$DOMAIN",
  "stack": "$STACK",
  "bootstrapped_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "starter_version": "0.1.0"
}
EOF
echo "→ .starter-meta.json salvo."
echo ""

chmod +x .claude/hooks/*.sh 2>/dev/null || true

# ---------------------------------------------------------------------------
# rodar INIT.md automaticamente (opcional, interativo)
# ---------------------------------------------------------------------------
INIT_PROMPT='Le INIT.md e executa. Mapeia o codigo deste repo e preenche .specs/product/ + .specs/architecture/ com dados reais. Use multi-agents em paralelo.'

run_init_now=0
chosen_cli=""

if [[ "$INTERACTIVE" == "1" && -f "INIT.md" ]]; then
  echo "=========================================="
  echo "  Mapeamento profundo (INIT.md)"
  echo "=========================================="
  echo ""
  echo "Posso rodar AGORA o mapeamento profundo do projeto"
  echo "(le seu codigo e preenche .specs/ com entidades,"
  echo "integracoes e comandos reais — multi-agents)."
  echo ""

  has_claude=0;   command -v claude   >/dev/null 2>&1 && has_claude=1
  has_codex=0;    command -v codex    >/dev/null 2>&1 && has_codex=1
  has_copilot=0;  command -v gh       >/dev/null 2>&1 && gh extension list 2>/dev/null | grep -q copilot && has_copilot=1
  has_hermes=0;   command -v hermes   >/dev/null 2>&1 && has_hermes=1
  has_openclaw=0; command -v openclaw >/dev/null 2>&1 && has_openclaw=1

  echo "CLIs detectadas nesta maquina:"
  [[ $has_claude   == 1 ]] && echo "  [c] Claude Code         (recomendado — agentic loop completo)"
  [[ $has_codex    == 1 ]] && echo "  [x] Codex"
  [[ $has_copilot  == 1 ]] && echo "  [g] GitHub Copilot CLI  (sem agentic loop — copia prompt pro clipboard)"
  [[ $has_hermes   == 1 ]] && echo "  [h] Hermes Agent        (Nous Research)"
  [[ $has_openclaw == 1 ]] && echo "  [o] OpenClaw"
  if [[ $has_claude == 0 && $has_codex == 0 && $has_copilot == 0 && $has_hermes == 0 && $has_openclaw == 0 ]]; then
    echo "  (nenhuma encontrada — instale uma e rode manualmente depois)"
  fi
  echo "  [n] Nao rodar agora"
  echo ""
  read -r -p "Escolha [n]: " choice
  choice="${choice:-n}"

  case "$choice" in
    c|C)
      if [[ $has_claude == 1 ]]; then run_init_now=1; chosen_cli="claude"
      else echo "Claude Code nao instalado. Instala: https://docs.claude.com/claude-code"; fi
      ;;
    x|X)
      if [[ $has_codex == 1 ]]; then run_init_now=1; chosen_cli="codex"
      else echo "Codex nao instalado. Instala: https://github.com/openai/codex"; fi
      ;;
    g|G)
      if [[ $has_copilot == 1 ]]; then chosen_cli="copilot"
      else echo "GitHub Copilot CLI nao instalado. Instala: gh extension install github/gh-copilot"; fi
      ;;
    h|H)
      if [[ $has_hermes == 1 ]]; then run_init_now=1; chosen_cli="hermes"
      else echo "Hermes Agent nao instalado. Instala: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash"; fi
      ;;
    o|O)
      if [[ $has_openclaw == 1 ]]; then run_init_now=1; chosen_cli="openclaw"
      else echo "OpenClaw nao instalado. Instala: npm install -g openclaw@latest"; fi
      ;;
    *) ;;
  esac
fi

# ---------------------------------------------------------------------------
# executa CLI escolhida (handoff para o agente)
# ---------------------------------------------------------------------------
if [[ "$run_init_now" == "1" && "$chosen_cli" == "claude" ]]; then
  echo ""
  echo "=========================================="
  echo "  Executando Claude Code com INIT.md"
  echo "=========================================="
  echo ""
  exec claude "$INIT_PROMPT"
elif [[ "$run_init_now" == "1" && "$chosen_cli" == "codex" ]]; then
  echo ""
  echo "=========================================="
  echo "  Executando Codex com INIT.md"
  echo "=========================================="
  echo ""
  exec codex exec "$INIT_PROMPT"
elif [[ "$run_init_now" == "1" && "$chosen_cli" == "hermes" ]]; then
  echo ""
  echo "=========================================="
  echo "  Executando Hermes Agent com INIT.md"
  echo "=========================================="
  echo ""
  if command -v pbcopy >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | pbcopy
  elif command -v xclip >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | xclip -selection clipboard
  fi
  echo "(prompt copiado pro clipboard como fallback — cole se Hermes abrir vazio)"
  echo ""
  exec hermes "$INIT_PROMPT"
elif [[ "$run_init_now" == "1" && "$chosen_cli" == "openclaw" ]]; then
  echo ""
  echo "=========================================="
  echo "  Executando OpenClaw com INIT.md"
  echo "=========================================="
  echo ""
  if command -v pbcopy >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | pbcopy
  elif command -v xclip >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | xclip -selection clipboard
  fi
  echo "(prompt copiado pro clipboard como fallback — cole se OpenClaw abrir vazio)"
  echo ""
  exec openclaw "$INIT_PROMPT"
elif [[ "$chosen_cli" == "copilot" ]]; then
  echo ""
  echo "GitHub Copilot CLI nao executa agentic loop autonomo (so sugere comandos)."
  echo ""
  if command -v pbcopy >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | pbcopy
    echo "→ Prompt copiado pro clipboard (pbcopy). Cole com Cmd+V no Copilot Chat (VS Code)."
  elif command -v xclip >/dev/null 2>&1; then
    printf "%s" "$INIT_PROMPT" | xclip -selection clipboard
    echo "→ Prompt copiado pro clipboard (xclip). Cole com Ctrl+V no Copilot Chat."
  else
    echo "(clipboard indisponivel — copie o prompt abaixo manualmente)"
  fi
  echo ""
  echo "Prompt:"
  echo "  $INIT_PROMPT"
  echo ""
fi

# ---------------------------------------------------------------------------
# proximos passos (so chega aqui se NAO fez handoff via exec)
# ---------------------------------------------------------------------------
cat <<'EOF'
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
   - Commit: git add -A && git commit -m "chore: bootstrap agentic starter"

3) (opcional) Apaga este script + _BOOTSTRAP.md + INIT.md
   apos mapeamento, se nao quiser deixar no repo final.

EOF
