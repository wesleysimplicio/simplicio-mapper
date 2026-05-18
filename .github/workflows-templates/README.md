# Workflow templates

Templates the starter ships for **consumer projects** to copy into `.github/workflows/`. They are **not** active in this repo — copy them over after running the bootstrap.

| Template | Purpose | Required secrets |
|---|---|---|
| `llm-project-mapper-init.yml` | Auto-run `INIT.md` once, right after the host project gets bootstrapped. Opens a draft PR with the agent's `.specs/**` results. | `ANTHROPIC_API_KEY` (or swap the step for Codex / OpenAI / OpenRouter as your model preference) |

## How to enable

```bash
mkdir -p .github/workflows
cp .github/workflows-templates/llm-project-mapper-init.yml .github/workflows/
```

Then set the required secret(s) under `Settings → Secrets and variables → Actions`.

## Why not active here

The starter repo itself does not need `INIT.md` to run — `.specs/**` are already template files maintained by hand. Consumer projects, on the other hand, want this workflow to fire on first push so the agent fills `.specs/**` without anybody opening a CLI.
