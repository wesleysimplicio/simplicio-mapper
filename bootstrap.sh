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
# próximos passos
# ---------------------------------------------------------------------------
cat <<'EOF'
=========================================
  PROXIMOS PASSOS
=========================================

1) Abra Claude Code (ou Codex) nesta pasta:

   $ claude

2) Cole o seguinte prompt (ele vai mapear seu projeto e
   preencher .specs/ com arquitetura/dominio reais):

   "Le INIT.md e executa. Mapeia o codigo deste repo e
    preenche .specs/product/ + .specs/architecture/ com
    dados reais. Use multi-agents em paralelo."

3) Apos mapeamento:
   - Reveja VISION.md, DOMAIN.md, DESIGN.md
   - Crie sprint-02 e primeira task em .specs/sprints/
   - Commit: git add -A && git commit -m "chore: bootstrap agentic starter"

4) (opcional) Apaga este script + _BOOTSTRAP.md + INIT.md
   apos mapeamento, se nao quiser deixar no repo final.

EOF
