# projects/

Convention folder for project location detection by agents (Claude Code, Codex, Hermes, OpenClaw, Cursor, Copilot).

## Rule

When an agent starts a task in this repo, it MUST check `projects/`:

- **`projects/` empty (only `.gitkeep`)** -> the project to analyze IS the repo root. Treat the repo root as the single working project.
- **`projects/` contains one or more subfolders** -> each subfolder is a separate project. Treat them as a monorepo of projects. The repo root is workspace-level only (tooling, docs, shared config).

## Why

Single rule, no ambiguity. Agent does not have to guess whether the codebase lives at root or under a `apps/`, `packages/`, `services/` folder. One check: `ls projects/`.

## How to use

### Single-project repo (root)

Leave `projects/` empty. All code, specs, tests live at repo root. This is the default for the Agentic Starter template.

### Multi-project repo (monorepo)

Create one subfolder per project:

```
projects/
  api/            # backend service
  web/            # frontend app
  worker/         # background jobs
```

Each subfolder has its own `package.json` / `pyproject.toml` / `*.csproj` / `Cargo.toml` and is self-contained. Shared specs/skills/agents stay at repo root in `.specs/`, `.skills/`, `.agents/`.

## Not allowed

- Mixing both modes (code at root AND under `projects/`). Pick one.
- Removing `projects/` folder. The folder itself is the signal.
- Renaming to `apps/`, `packages/`, `services/`. Convention is fixed: `projects/`.
