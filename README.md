# Agentic Starter Pack

> 🇺🇸 English. Leia em português: [README.pt-BR.md](README.pt-BR.md).


AI-friendly, stack-neutral repository template. Designed to drop into any new project and give the agent (Claude Code, Codex, Copilot, Cursor, Aider, Hermes, OpenClaw, etc.) the context it needs to ship releases per day.

> This is a starter pack, not a framework. It delivers structure, instruction and process. The execution stack is your call.

---

## What it is

A ready-made skeleton containing:

- Instruction files (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`) that drive the agent.
- Specs (`/.specs/`) with VISION, DOMAIN, PERSONAS, DESIGN, ADRs, WORKFLOW and sprint backlog.
- Reusable skills (`/.skills/`) the agent invokes when context matches.
- Hooks (`.claude/hooks/`) and config (`.claude/settings.json`, `.codex/config.toml`) ready to go.
- CI pipeline (`.github/workflows/`) with Definition of Done gate.
- PR and Issue templates.
- Presentation under `presentation/` covering the AI Agent Specialist method.

Everything stack-neutral: the actual stack plugs in via `<PLACEHOLDERS>` when you adapt it to your project.

---

## How to use

Three install paths. Pick the one that fits your flow.

### Option A — `npx` (recommended, zero clone)

Inside your project directory:

```bash
# interactive (asks product/team/domain/stack)
npx @wesleysimplicio/agentic-starter

# non-interactive (CI or automation)
npx @wesleysimplicio/agentic-starter \
  --product "MyApp" --team "Squad-X" --domain "fintech" --stack "next-ts" --yes

# preview without writing anything
npx @wesleysimplicio/agentic-starter --dry-run --yes
```

The CLI:

1. Copies the template (`AGENTS.md`, `CLAUDE.md`, `.specs/`, `.skills/`, `.agents/`, `.claude/`, `.codex/`, `.github/`, hooks, workflows, Playwright config, etc.) into `cwd`.
2. Auto-detects the stack (`package.json`/`pyproject.toml`/`go.mod`/etc.) or accepts it via `--stack`.
3. Replaces `<PRODUCT_NAME>`, `<TEAM>`, `<DOMAIN>`, `<STACK>` across all text files.
4. Generates `.gitignore`, `.gitattributes` and `.starter-meta.json`.
5. Prints next steps to run Claude Code / Codex / Copilot with `INIT.md`.

By default it **does not overwrite** existing files — use `--force` if you want overwrite. Works on macOS, Linux and Windows (Node >= 16.7, no bash dependency).

Flags: `--product`, `--team`, `--domain`, `--stack`, `-f|--force`, `-y|--yes`, `--dry-run`, `--silent`, `--skip-meta`, `--skip-gitignore`, `-v|--version`, `-h|--help`.

### Option B — Clone + bootstrap script (legacy)

If you prefer the old flow (no npm), it still works:

```bash
# clone from GitHub straight into the project
git clone --depth=1 https://github.com/wesleysimplicio/agentic-starter.git tmp-starter
cp -R tmp-starter/. ./
rm -rf tmp-starter
```

Or if you already have the starter locally:

```bash
cp -R /path/to/agentic-starter/. ./
```

### Option C — Run the bootstrap script directly (after clone)

**macOS / Linux / Git Bash (Windows):**

```bash
./bootstrap.sh
```

**Native Windows (PowerShell 5.1+ / pwsh 7+):**

```powershell
pwsh -File .\bootstrap.ps1
# or on PowerShell 5.1:
powershell -ExecutionPolicy Bypass -File .\bootstrap.ps1
```

Both scripts behave identically (same prompts, same `.starter-meta.json`, same handoff to the picked CLI). Use the one that matches your shell.

Interactive mode asks:

1. `PRODUCT_NAME`, `TEAM`, `DOMAIN`, `STACK` (auto-detects stack via `package.json`/`pyproject.toml`/`go.mod`/etc.).
2. **Which CLI to use for deep mapping:**
   - `[c]` Claude Code (recommended)
   - `[x]` Codex
   - `[g]` GitHub Copilot CLI (copies prompt to clipboard, paste into Copilot Chat)
   - `[h]` Hermes Agent (Nous Research)
   - `[o]` OpenClaw
   - `[n]` Skip mapping for now

If you pick `c` or `x`, the bootstrap **calls the agent directly** with the `INIT.md` prompt. The agent will:

- Inspect folders, models, dependencies, integrations.
- Rewrite `VISION.md`, `DOMAIN.md`, `DESIGN.md`, `PATTERNS.md`, `BACKLOG.md` with **real data from the code**.
- Update `AGENTS.md`/`CLAUDE.md`/`copilot-instructions.md` with real commands (npm scripts, makefile, etc.).
- Report what landed clean and what needs human input.

CI/script mode (non-interactive, only replaces placeholders, no mapping):

```bash
# bash
./bootstrap.sh --product "MyApp" --team "Squad-X" --domain "fintech" --stack "next-ts"
```

```powershell
# PowerShell
pwsh -File .\bootstrap.ps1 -Product "MyApp" -Team "Squad-X" -Domain "fintech" -Stack "next-ts"
```

### 3. (optional) Clean up starter files

```bash
# bash
rm _BOOTSTRAP.md INIT.md bootstrap.sh bootstrap.ps1
git add -A && git commit -m "chore: remove starter bootstrap files"
```

```powershell
# PowerShell
Remove-Item _BOOTSTRAP.md, INIT.md, bootstrap.sh, bootstrap.ps1
git add -A; git commit -m "chore: remove starter bootstrap files"
```

---

## Suggested reading order (human)

1. `README.md` (this file) — overview.
2. `AGENTS.md` — agent master instruction.
3. `.specs/README.md` — specs navigation map.
4. `.specs/product/VISION.md` — product.
5. `.specs/architecture/DESIGN.md` — architecture.
6. `.specs/workflow/WORKFLOW.md` — process.
7. `.skills/README.md` — agent capabilities.

---

## Quickstart for the AI agent

When the agent opens the freshly cloned repo, it must:

1. Read `AGENTS.md` (root). That is the contract.
2. Read `.specs/product/VISION.md` to grasp the why.
3. Read `.specs/architecture/DESIGN.md` and `PATTERNS.md` to grasp the how.
4. Pull the next task from `.specs/sprints/sprint-XX/`.
5. Run the mandatory loop: read task -> plan -> edit -> lint -> unit -> e2e -> fix -> commit.
6. Validate Definition of Done before opening a PR.

---

## Folder layout

```
agentic-starter/
├── README.md                  # this file
├── AGENTS.md                  # agent master instruction
├── CLAUDE.md                  # mirror/symlink of AGENTS.md
├── .gitignore
├── .github/                   # CI, templates, Copilot custom agents
├── .specs/                    # all product/architecture/workflow docs
│   ├── product/               # VISION, DOMAIN, PERSONAS
│   ├── architecture/          # DESIGN, PATTERNS, ADRs
│   ├── workflow/              # WORKFLOW, CONTRIBUTING, RELEASE
│   └── sprints/               # BACKLOG + sprints
├── .skills/                   # reusable agent skills
├── .claude/                   # Claude Code config + hooks
├── .codex/                    # Codex config
├── playwright.config.ts       # default E2E
└── presentation/              # method slides (Marp)
```

---

## Philosophy

- **Specs as code.** What is not written, the agent does not see.
- **Atomic tasks.** One task = one small reviewable PR.
- **Automated Definition of Done.** What does not pass the gate, does not merge.
- **Reusable skills.** A capability that becomes a pattern becomes a `SKILL.md`.
- **Tight loop.** Edit, test, fix, repeat. Never accumulate invisible debt.

---

## License

`<LICENSE_PLACEHOLDER>` (replace with MIT, Apache-2.0, proprietary, or whatever fits the project).

---

## Next steps

- Adapt the placeholders.
- Fill the specs with real product context.
- Run the first sprint using the template under `.specs/sprints/sprint-01/`.
- Watch the deck at `presentation/ai-agent-specialist.pdf` to grasp the full method.
