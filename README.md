# LLM Project Mapper

> 🇺🇸 English. Leia em português: [README.pt-BR.md](README.pt-BR.md).
> Live docs site: [wesleysimplicio.github.io/llm-project-mapper](https://wesleysimplicio.github.io/llm-project-mapper/)

AI-friendly, stack-neutral repository scaffold. Drop it into **any** project — new or existing — and any agent CLI (Claude Code, Codex, Cursor, GitHub Copilot, Aider with Deepseek/Kimi/MiniMax/GLM, Hermes, OpenClaw) gets the context it needs to ship work the same day.

> Starter pack, not a framework. Ships structure, instructions, process. Stack is yours.

![LLM Project Mapper hero](assets/llm-project-mapper-hero.png)

> Visual summary: drop the starter into a messy software project and it turns scattered context into structure, reusable skills, tests, docs, and guardrails for AI coding agents.

### Watch: why llm-project-mapper? (53s)

[![Watch the video](video/assets/why-cover.png)](https://github.com/wesleysimplicio/llm-project-mapper/raw/main/video/assets/why-llm-project-mapper.mp4)

> Click the cover to play. Direct link: [`video/assets/why-llm-project-mapper.mp4`](video/assets/why-llm-project-mapper.mp4) · English version: [`video/assets/why-llm-project-mapper-en.mp4`](video/assets/why-llm-project-mapper-en.mp4) · both renders now ship with narration plus burned-in captions.

---

## Operational Docs For Agents

This starter now includes generic, fill-in templates that make any project easier for agents to operate:

- `docs/local-setup.md`: how to install, start, validate and access the project.
- `docs/domain-map.md`: business concepts, critical rules and edge cases.
- `docs/architecture-map.md`: system shape, request path and integrations.
- `docs/features/README.md`: feature documentation template with files, endpoints, rules and evidence.
- `docs/evidence/README.md`: screenshot/video/trace policy and artifact naming.
- `docs/troubleshooting.md`: repeatable diagnosis and fixes.
- `scripts/`: stack-neutral placeholders for start, test and evidence commands.
- `tests/e2e/smoke.spec.ts`: generic Playwright smoke test driven by `BASE_URL`.

Fill these files after installing the starter in a real project. The goal is to reduce discovery time for humans and agents without forcing a framework.

## Machine-Readable Mapper Outputs

The bootstrap also writes `.simplicio/project-map.json` and
`.simplicio/precedent-index.json` for tools such as `simplicio-dev-cli` and
`simplicio-sprint`.

Refresh them without re-running the full starter:

```bash
npx @wesleysimplicio/llm-project-mapper map
npx @wesleysimplicio/llm-project-mapper map --incremental
npx @wesleysimplicio/llm-project-mapper update
```

### New: standalone Python CLI

The mapper also ships as a Python package, so Python-first teams can generate
the same artifacts without a Node toolchain. It uses lightweight performance
dependencies (`orjson` and `diskcache`) for faster JSON serialization and
persistent file-processing cache:

```bash
pip install simplicio-mapper

simplicio-mapper map                 # write .simplicio/ artifacts
simplicio-mapper update              # refresh and record changed files
simplicio-mapper map --watch         # re-map as files change locally
```

Both `simplicio-mapper` and `llm-project-mapper` console scripts are installed,
and the Python output follows the same artifact schema as the Node mapper.

Use `--watch` during long agent sessions to keep the map fresh. The schema and
Python consumption example live in [SIMPLICIO_INTEGRATION.md](SIMPLICIO_INTEGRATION.md).

---

## Patterns

- Canonical spec: [YOOL_TUPLE_HAMT.md](YOOL_TUPLE_HAMT.md)
- Receipts schema and storage conventions: [Receipt schema](YOOL_TUPLE_HAMT.md#184-receipt-schema-reference)

The yool / tuple / HAMT pattern is the capability-addressing model this scaffold is standardizing for multi-agent repos. Keep the root spec vendored so agents can reach it from the repository root in one click.
