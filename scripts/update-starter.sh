#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -n "${AGENTIC_STARTER_SOURCE:-}" && -f "$AGENTIC_STARTER_SOURCE/bin/cli.js" ]]; then
  node "$AGENTIC_STARTER_SOURCE/bin/cli.js" --update
else
  npx --yes @wesleysimplicio/agentic-starter@latest --update
fi
