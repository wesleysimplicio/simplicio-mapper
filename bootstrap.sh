#!/usr/bin/env bash
# bootstrap.sh — Agentic Starter installer/upgrader.
#
# What it does:
#   1. Auto-detects PRODUCT_NAME (cwd basename), DOMAIN ("generico"), TEAM ("Plataforma"),
#      STACK (Node, .NET, Python, Go, Rust, Flutter, PHP, Ruby, Kotlin, Java, Elixir).
#      The agent (INIT.md) refines TEAM/DOMAIN with the human afterwards.
#   2. Asks only TWO questions:
#      - Append our recommended ignore entries to .gitignore? (y/N)
#      - Which CLI/LLM should run INIT.md?
#   3. Substitutes <PRODUCT_NAME>/<TEAM>/<DOMAIN>/<STACK> ONLY inside starter-managed
#      paths (.specs/, .agents/, .skills/, .claude/, .codex/, .github/copilot*,
#      .github/workflows/{ci,dod}.yml, plus root AGENTS.md/CLAUDE.md/INIT.md/README*.md
#      ONLY if those root files contain a placeholder).
#   4. NEVER overwrites/modifies pre-existing user files (.razor, .cs, .ts, .py,
#      package.json, README.md, AGENTS.md, CLAUDE.md, INIT.md, .gitignore, etc).
#      Existing instruction files are flagged in .starter-meta.json so INIT.md
#      can read them and improve in place (essence preserved).
#   5. Hands off to the chosen CLI to execute INIT.md.
#
# Usage interactive:
#   ./bootstrap.sh
#
# Usage non-interactive (CI):
#   ./bootstrap.sh --yes --cli claude --append-gitignore yes

set -euo pipefail

# ---------------------------------------------------------------------------
# args
# ---------------------------------------------------------------------------
NON_INTERACTIVE=0
CLI_PRESET=""
APPEND_GITIGNORE_PRESET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes)              NON_INTERACTIVE=1; shift ;;
    --cli)                 CLI_PRESET="$2"; shift 2 ;;
    --append-gitignore)    APPEND_GITIGNORE_PRESET="$2"; shift 2 ;;  # yes|no
    -h|--help)             sed -n '2,28p' "$0"; exit 0 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
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
  elif [[ -f Gemfile ]];          then echo "ruby"
  elif [[ -f mix.exs ]];          then echo "elixir"
  elif [[ -f build.gradle.kts ]]; then echo "kotlin-gradle"
  elif [[ -f build.gradle ]];     then echo "java-gradle"
  elif [[ -f pom.xml ]];          then echo "java-maven"
  else echo "unknown"
  fi
}

PRODUCT_NAME="$(basename "$PWD")"
TEAM="Plataforma"
DOMAIN="generico"
STACK="$(detect_stack)"

echo "=========================================="
echo "  Agentic Starter - Bootstrap"
echo "=========================================="
echo ""
echo "Auto-detected (INIT.md will refine TEAM/DOMAIN with you):"
echo "  PRODUCT_NAME: $PRODUCT_NAME"
echo "  TEAM:         $TEAM"
echo "  DOMAIN:       $DOMAIN"
echo "  STACK:        $STACK"
echo ""

# ---------------------------------------------------------------------------
# detect existing instruction files (DO NOT overwrite — flag for INIT.md)
# ---------------------------------------------------------------------------
EXISTING_INSTRUCTION_FILES=()
for f in AGENTS.md CLAUDE.md INIT.md .github/copilot-instructions.md; do
  if [[ -f "$f" ]]; then
    # if it's clearly ours (contains template marker) skip; else flag
    if ! grep -q 'Agentic Starter\|<PRODUCT_NAME>\|<STACK>' "$f" 2>/dev/null; then
      EXISTING_INSTRUCTION_FILES+=("$f")
    fi
  fi
done

if (( ${#EXISTING_INSTRUCTION_FILES[@]} > 0 )); then
  echo "Detected pre-existing instruction files (will be preserved):"
  for f in "${EXISTING_INSTRUCTION_FILES[@]}"; do
    echo "  - $f"
  done
  echo "  -> INIT.md will READ them and IMPROVE in place (essence preserved)."
  echo ""
fi

# ---------------------------------------------------------------------------
# substitute placeholders ONLY in starter-managed paths
#
# Rule: if the file contains a <PRODUCT_NAME>/<STACK>/<TEAM>/<DOMAIN> placeholder,
# it's a starter file -> substitute. Otherwise skip (it's user content).
# ---------------------------------------------------------------------------
STARTER_DIRS=(.specs .agents .skills .claude .codex)
STARTER_GITHUB_PATTERNS=(
  ".github/copilot-instructions.md"
  ".github/copilot"
  ".github/PULL_REQUEST_TEMPLATE.md"
  ".github/ISSUE_TEMPLATE"
  ".github/workflows/ci.yml"
  ".github/workflows/dod.yml"
)
STARTER_ROOT_FILES=(
  AGENTS.md CLAUDE.md INIT.md _BOOTSTRAP.md
  README.md README.pt-BR.md
  playwright.config.ts
)

TOUCHED=0

substitute_in_file() {
  local f="$1"
  [[ -f "$f" ]] || return 0
  grep -Iq . "$f" 2>/dev/null || return 0
  grep -q '<PRODUCT_NAME>\|<TEAM>\|<DOMAIN>\|<STACK>' "$f" 2>/dev/null || return 0
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
}

echo "Substituting placeholders inside starter-managed paths..."

for dir in "${STARTER_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    while IFS= read -r f; do
      substitute_in_file "$f"
    done < <(find "$dir" -type f \( -name "*.md" -o -name "*.json" -o -name "*.toml" -o -name "*.yml" -o -name "*.yaml" -o -name "*.ts" \))
  fi
done

for p in "${STARTER_GITHUB_PATTERNS[@]}"; do
  if [[ -d "$p" ]]; then
    while IFS= read -r f; do
      substitute_in_file "$f"
    done < <(find "$p" -type f)
  elif [[ -f "$p" ]]; then
    substitute_in_file "$p"
  fi
done

for f in "${STARTER_ROOT_FILES[@]}"; do
  substitute_in_file "$f"
done

echo "-> $TOUCHED files updated (only starter-managed paths)."
echo ""

# ---------------------------------------------------------------------------
# .gitignore — NEVER overwrite. Append (or create) on opt-in only.
# ---------------------------------------------------------------------------
RECOMMENDED_IGNORES='# === Agentic Starter (auto-managed) — do not remove this header ===
# Local agent state and ephemeral artifacts created by the starter.
.starter-meta.json
.codex/local
.codex/history
.claude/sessions
.claude/cache

# Test artifacts (Playwright + coverage)
test-results/
playwright-report/
playwright/.cache/
coverage/
.nyc_output/

# Env vars
.env
.env.*
!.env.example

# Editor / OS
.DS_Store
Thumbs.db
*.swp
*.swo

# Build / dist (most common)
node_modules/
dist/
build/
out/
.next/
.nuxt/
.turbo/
.vercel/
*.tsbuildinfo

# Logs
*.log
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Tarballs
*.tgz
*.tar.gz
'

handle_gitignore() {
  local choice="${APPEND_GITIGNORE_PRESET:-}"
  if [[ -z "$choice" && "$NON_INTERACTIVE" == "0" ]]; then
    echo "=========================================="
    echo "  .gitignore"
    echo "=========================================="
    if [[ -f .gitignore ]]; then
      echo "An existing .gitignore was found."
      echo "I can APPEND recommended entries (your existing content is NEVER modified)."
    else
      echo "No .gitignore found. I can CREATE one with recommended entries."
    fi
    read -r -p "Proceed? [y/N]: " ans
    ans="${ans:-n}"
    case "${ans:0:1}" in
      y|Y|s|S) choice="yes" ;;
      *)       choice="no"  ;;
    esac
    echo ""
  fi
  choice="${choice:-no}"

  if [[ "$choice" != "yes" ]]; then
    echo "-> .gitignore left untouched."
    return
  fi

  if [[ -f .gitignore ]]; then
    if grep -q "Agentic Starter (auto-managed)" .gitignore 2>/dev/null; then
      echo "-> Recommended entries already present in .gitignore. Nothing to do."
    else
      printf '\n%s\n' "$RECOMMENDED_IGNORES" >> .gitignore
      echo "-> Recommended entries APPENDED to .gitignore (original content preserved)."
    fi
  else
    printf '%s\n' "$RECOMMENDED_IGNORES" > .gitignore
    echo "-> .gitignore CREATED."
  fi
}

handle_gitignore
echo ""

# ---------------------------------------------------------------------------
# .starter-meta.json (machine-readable handoff for INIT.md)
# ---------------------------------------------------------------------------
existing_files_json="[]"
if (( ${#EXISTING_INSTRUCTION_FILES[@]} > 0 )); then
  existing_files_json="["
  for f in "${EXISTING_INSTRUCTION_FILES[@]}"; do
    existing_files_json+="\"$f\","
  done
  existing_files_json="${existing_files_json%,}]"
fi

cat > .starter-meta.json <<EOF
{
  "product_name": "$PRODUCT_NAME",
  "team": "$TEAM",
  "domain": "$DOMAIN",
  "stack": "$STACK",
  "bootstrapped_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "starter_version": "0.2.0",
  "existing_instruction_files": $existing_files_json,
  "init_must_ask": ["team", "domain", "vision_oneliner", "primary_personas"],
  "init_must_merge": $existing_files_json,
  "read_only_globs": ["**/*.razor", "**/*.cs", "**/*.csproj", "**/*.sln", "package.json", "pnpm-lock.yaml", "yarn.lock", "package-lock.json", "**/*.py", "**/*.go", "**/*.rs", "**/*.java", "**/*.kt", "**/*.dart", "**/*.php", "**/*.rb"]
}
EOF
echo "-> .starter-meta.json saved."
echo ""

chmod +x .claude/hooks/*.sh 2>/dev/null || true

# ---------------------------------------------------------------------------
# choose CLI / LLM
# ---------------------------------------------------------------------------
INIT_PROMPT='Read INIT.md and execute it. Do NOT modify any user source files (.razor, .cs, .ts, .py, .go, .rs, package.json, etc). Only write inside .specs/, .agents/, .skills/, .claude/, .codex/, .github/copilot*, .github/workflows/dod.yml plus root AGENTS.md/CLAUDE.md/INIT.md/README*.md. If AGENTS.md/CLAUDE.md/copilot-instructions.md already existed before bootstrap (see .starter-meta.json), READ them and IMPROVE in place — preserve their essence. Ask the human only the questions listed in .starter-meta.json -> init_must_ask (team, domain, vision oneliner, personas). Use parallel multi-agents.'

declare -a CLI_OPTS=(
  "claude|Claude Code|claude"
  "codex|Codex CLI|codex"
  "copilot|GitHub Copilot CLI (chat — no agent loop)|gh"
  "cursor|Cursor Agent (cursor-agent)|cursor-agent"
  "deepseek|Deepseek (via aider --model deepseek/deepseek-coder)|aider"
  "kimi|Kimi K2.6 (via aider --model openrouter/moonshotai/kimi-k2)|aider"
  "minimax|MiniMax M2.7 (via aider --model openrouter/minimax/minimax-text-01)|aider"
  "glm|GLM 5.1 (via aider --model openrouter/z-ai/glm-4.5)|aider"
  "hermes|Hermes Agent (Nous Research)|hermes"
  "openclaw|OpenClaw|openclaw"
  "aider|Aider (pick model interactively)|aider"
  "other|Other / manual (copy prompt to clipboard)|"
  "skip|Skip — I will run INIT.md later|"
)

choose_cli() {
  if [[ -n "$CLI_PRESET" ]]; then echo "$CLI_PRESET"; return; fi
  if [[ "$NON_INTERACTIVE" == "1" ]]; then echo "skip"; return; fi

  {
    echo "=========================================="
    echo "  Choose the CLI/LLM to run INIT.md"
    echo "=========================================="
    echo ""
    local i=1
    for opt in "${CLI_OPTS[@]}"; do
      IFS='|' read -r key label cmd <<< "$opt"
      local mark=""
      if [[ -n "$cmd" ]] && command -v "$cmd" >/dev/null 2>&1; then
        mark="  [installed]"
      fi
      printf "  [%2d] %s%s\n" "$i" "$label" "$mark"
      i=$((i+1))
    done
    echo ""
  } >&2

  read -r -p "Number [13]: " idx
  idx="${idx:-13}"
  if ! [[ "$idx" =~ ^[0-9]+$ ]] || (( idx < 1 || idx > ${#CLI_OPTS[@]} )); then
    idx=13
  fi
  IFS='|' read -r key _ _ <<< "${CLI_OPTS[$((idx-1))]}"
  echo "$key"
}

CLI_CHOICE="$(choose_cli)"

# ---------------------------------------------------------------------------
# clipboard helper (best-effort)
# ---------------------------------------------------------------------------
copy_to_clipboard() {
  local text="$1"
  if   command -v pbcopy   >/dev/null 2>&1; then printf '%s' "$text" | pbcopy
  elif command -v xclip    >/dev/null 2>&1; then printf '%s' "$text" | xclip -selection clipboard
  elif command -v wl-copy  >/dev/null 2>&1; then printf '%s' "$text" | wl-copy
  elif command -v clip.exe >/dev/null 2>&1; then printf '%s' "$text" | clip.exe
  else return 1
  fi
  return 0
}

# ---------------------------------------------------------------------------
# handoff
# ---------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "  Handing off to: $CLI_CHOICE"
echo "=========================================="
echo ""

case "$CLI_CHOICE" in
  claude)
    command -v claude >/dev/null 2>&1 || { echo "Claude Code not installed: https://docs.claude.com/claude-code"; exit 1; }
    exec claude "$INIT_PROMPT"
    ;;
  codex)
    command -v codex >/dev/null 2>&1 || { echo "Codex CLI not installed: https://github.com/openai/codex"; exit 1; }
    exec codex exec "$INIT_PROMPT"
    ;;
  copilot)
    command -v gh >/dev/null 2>&1 || { echo "gh CLI not installed: https://cli.github.com"; exit 1; }
    copy_to_clipboard "$INIT_PROMPT" && echo "Prompt copied to clipboard." || echo "(clipboard unavailable — copy manually below)"
    echo ""
    echo "GitHub Copilot CLI does not run an autonomous agent loop."
    echo "Open Copilot Chat (VS Code / IDE) and paste the prompt:"
    echo ""
    echo "  $INIT_PROMPT"
    echo ""
    ;;
  cursor)
    command -v cursor-agent >/dev/null 2>&1 || { echo "Cursor Agent CLI not installed (Cursor 3.0+)."; exit 1; }
    exec cursor-agent "$INIT_PROMPT"
    ;;
  deepseek)
    command -v aider >/dev/null 2>&1 || { echo "aider not installed: pipx install aider-chat"; exit 1; }
    exec aider --model deepseek/deepseek-coder --message "$INIT_PROMPT"
    ;;
  kimi)
    command -v aider >/dev/null 2>&1 || { echo "aider not installed: pipx install aider-chat"; exit 1; }
    exec aider --model openrouter/moonshotai/kimi-k2 --message "$INIT_PROMPT"
    ;;
  minimax)
    command -v aider >/dev/null 2>&1 || { echo "aider not installed: pipx install aider-chat"; exit 1; }
    exec aider --model openrouter/minimax/minimax-text-01 --message "$INIT_PROMPT"
    ;;
  glm)
    command -v aider >/dev/null 2>&1 || { echo "aider not installed: pipx install aider-chat"; exit 1; }
    exec aider --model openrouter/z-ai/glm-4.5 --message "$INIT_PROMPT"
    ;;
  hermes)
    command -v hermes >/dev/null 2>&1 || { echo "Hermes Agent not installed: https://github.com/NousResearch/hermes-agent"; exit 1; }
    copy_to_clipboard "$INIT_PROMPT" && echo "(prompt copied to clipboard as fallback)"
    exec hermes "$INIT_PROMPT"
    ;;
  openclaw)
    command -v openclaw >/dev/null 2>&1 || { echo "OpenClaw not installed: npm install -g openclaw@latest"; exit 1; }
    copy_to_clipboard "$INIT_PROMPT" && echo "(prompt copied to clipboard as fallback)"
    exec openclaw "$INIT_PROMPT"
    ;;
  aider)
    command -v aider >/dev/null 2>&1 || { echo "aider not installed: pipx install aider-chat"; exit 1; }
    exec aider --message "$INIT_PROMPT"
    ;;
  other)
    if copy_to_clipboard "$INIT_PROMPT"; then
      echo "Prompt copied to clipboard. Paste it into your CLI/agent of choice."
    else
      echo "(clipboard unavailable — copy the prompt below manually)"
    fi
    echo ""
    echo "Prompt:"
    echo "  $INIT_PROMPT"
    echo ""
    ;;
  skip|*)
    cat <<EOF
Skipped CLI handoff. To run INIT.md later, open your agent and paste:

  $INIT_PROMPT

Recommended next steps:
  1) Open an agent in this folder.
  2) Paste the prompt above.
  3) Review .specs/product/VISION.md, DOMAIN.md, architecture/DESIGN.md.
  4) git add -A && git commit -m "chore: bootstrap agentic starter"

Docs: https://github.com/wesleysimplicio/agentic-starter
EOF
    ;;
esac
