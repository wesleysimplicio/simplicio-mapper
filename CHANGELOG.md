# Changelog

All notable changes to **LLM Project Mapper** are documented in this file.

Format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Root-level `YOOL_TUPLE_HAMT.md` vendored alongside the existing `docs/` copy so the canonical pattern spec is reachable directly from the repository root and ships with the npm package.
- `build-hamt-catalog` wrapper plus stdlib-only `scripts/build_hamt.py`, enabling `npx @wesleysimplicio/llm-project-mapper build-hamt-catalog` to emit `.catalog/agents.json`.
- Runtime scaffold defaults for `.catalog/.gitkeep`, `.catalog/agents.json`, `.receipts/.gitkeep`, and optional `mcp/server.{ts,py}` edge adapters via `--mcp-edge`.
- Dedicated docs-site coverage for YOOL / tuple / HAMT, including the public `/yool-tuple-hamt` route and regression tests for the new page.

### Changed
- `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` now point to the root spec, document the receipts schema, and align the generated catalog output on `.catalog/agents.json`.
- The Node bootstrap path now mirrors the shell/PowerShell runtime scaffold so fresh `npx` installs create the catalog, receipts, and optional MCP edge templates consistently.

## [0.4.2] - 2026-05-19

### Added
- `.skills/rtk-cli/SKILL.md` skill manifest (force-added past the `.skills/`
  gitignore exclusion to match the other tracked starter skills). Documents
  RTK CLI usage with trigger, steps, do-not list, and DoD. Already shipped
  via npm tarball; now tracked in git so consumers can discover it on
  GitHub.

### Notes
- Closes #71. RTK guidance was already present in AGENTS.md, CLAUDE.md and
  `.github/copilot-instructions.md` — the missing piece was the skill folder
  visibility on GitHub.

## [0.4.1] - 2026-05-19

### Added
- Vendored YOOL/tuple/HAMT spec at `docs/YOOL_TUPLE_HAMT.md` (v0.2 from
  https://github.com/wesleysimplicio/yool-tuple-hamt) plus `AGENTS.md` /
  `CLAUDE.md` blocks defining the agent capability declaration template
  (`yool_id`, `authority`, `lane`, `agent_terms` with **mandatory**
  `cpu_quota_pct`, `disk_quota_mb`, `timeout_s`).
- `bootstrap.sh` now scaffolds `.catalog/` (receipts/, artifacts/, README) so
  the HAMT catalog has a predictable home in every starter-generated project.
- Guardrail rationale anchored to Victor Genaro's review: *"precisa de
  guardrail pra não fritar o processador. Você precisa de garbage collector
  também pra não encher 100% do disco."*

## [0.4.0] - 2026-05-19

### Added
- Added a local `rtk-cli` skill that teaches agents when and how to use RTK's compact shell output for repository exploration, `git`, `grep/find`, and verbose validation commands.

### Changed
- Updated `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, and session-start hooks to prefer RTK for shell-heavy workflows when it is installed, while explicitly keeping `curl`, `playwright`, and interactive or streaming commands on raw output.
- Allowed `Bash(rtk *)` in `.claude/settings.json` so Claude Code sessions can invoke RTK without extra local permission friction.
- Extended regression coverage to assert the shipped RTK skill, hook reminders, and contributor docs stay aligned.

## [0.3.2] - 2026-05-18

### Changed
- Documented a project-specific default release policy: release-relevant work in `llm-project-mapper` must finish with npm, Git tag, GitHub Release, `main`, and validation all synchronized in the same cycle.

## [0.3.1] - 2026-05-18

### Changed
- Replaced the remaining historical legacy-name references in repository documentation so the package and project naming stay fully aligned as `llm-project-mapper`.

## [0.3.0] - 2026-05-18

### Added
- Automatic local project mapping immediately after bootstrap. `bin/auto-map.js` now inspects the host project, infers stack/domain/team/integrations, generates `.specs/journal/inspection-YYYY-MM-DD.md`, and pre-fills the starter-managed docs without waiting for a manual `INIT.md` handoff.
- Regression coverage for the automatic mapping flow in both `tests/unit/cli-install.test.js` and `tests/e2e/cli.spec.ts`, including placeholder-clean assertions on the generated starter-managed files.
- `vscode-extension/` scaffold for `wesleysimplicio.llm-project-mapper-vscode`. Ships a TreeView for `.specs/sprints/`, plus commands `lpm.openCurrentTask`, `lpm.createAdr`, `lpm.runInit`, `lpm.refresh` and a live status-bar indicator. Pure filesystem walker (`src/scan.ts`) covered by `node --test` unit tests.
- `--telemetry on|off` flag on `bin/cli.js` (default off). Honored via `LLM_PROJECT_MAPPER_TELEMETRY` env var. Persists user choice to `~/.config/llm-project-mapper/telemetry.json`. Hard-disabled under `CI`, `--dry-run`, or when no `LLM_PROJECT_MAPPER_TELEMETRY_URL` is set.
- `PRIVACY.md` documenting telemetry payload shape, opt-in mechanics, and kill switches.
- `.github/workflows-templates/telemetry-worker.js` — reference Cloudflare Worker template (PII-sanitized aggregator).
- README sections (EN + PT-BR) under "Companion tooling" linking the new extension and PRIVACY.md.
- `tests/unit/cli-telemetry.test.js` — 5 new tests covering opt-in/out persistence and help-text presence.

### Changed
- Bootstrap messaging now explains that the mapping pass starts automatically and that `INIT.md` is an optional second-pass refinement step.
- Package version bumped to `0.3.0` to ship the automatic mapping workflow and updated regression coverage.

## [0.2.2] - 2026-05-18

### Added
- Local PT-BR + EN narration pipeline for `video/assets/why-llm-project-mapper{,-en}.mp4`, generated from `video/src/why/narration.json` via `say` + `ffmpeg`.
- Burned-in captions for the Why video via `@remotion/captions`, driven by the same narration source file.
- Versioned `video/public/captions/why-{pt,en}.srt` exports from the narration pipeline for timing review.
- `video/TTS-EVALUATION.md` comparing ElevenLabs, OpenAI `tts-1-hd`, and Azure Neural for future upgrades.

### Changed
- `video/public/sfx/rock-bg.mp3` is now mixed under narration at `volume=0.15`.
- Root lint now checks `video/scripts/*.mjs`.

## [0.2.1] - 2026-05-18

### Added
- `docs-site/` Docusaurus hub with GitHub Pages deployment workflow, local search, and versioned docs generated from repository markdown sources.
- Animated overlay-install screencast at `assets/overlay-install.svg`, embedded in the README and install guides.
- `LICENSE` (MIT) at repository root and shipped in npm tarball.
- `CHANGELOG.md` (this file) covering history v0.1.0 → v0.2.0.
- `npm run lint` script — wraps ESLint-equivalent checks for `bin/`, `tests/`, `scripts/`, shell scripts and Markdown.
- `npm test` script — `node --test tests/unit` runner (no extra dependency).
- Unit tests for `bin/cli.js`: `parseArgs`, `detectStack`, `detectProjectMode`, `mergeGitignore`, `.starter-meta.json` shape.
- Concrete `tests/e2e/smoke.spec.ts` exercising the real `npx` install flow (dry-run, fresh install, update, stack detection, monorepo detection).
- `INIT.en.md` + `INSTALL.en.md` — English translations of the install guide.
- `docs/placeholders.md` — catalog of every `<PLACEHOLDER>` token used by the starter.
- `docs/api-examples/{rest,graphql,webhook,cli}.md` — fill-in templates for documenting APIs.
- `SHOWCASE.md` — community list of consumer projects.
- PSScriptAnalyzer job in `scaffold-self-check.yml` covering `bootstrap.ps1` and `*.ps1` scripts.
- Cross-platform matrix (ubuntu/macos/windows) in `scaffold-self-check.yml`.
- `--preset <stack>` flag in `bin/cli.js` (nextjs, dotnet, fastapi, go, rails, flutter) — preset list at `--preset list`.
- `--no-update-check` flag and embedded semver notifier in `bin/cli.js`.
- `.github/workflows-templates/llm-project-mapper-init.yml` — GitHub Action wrapper template.
- `docs/sessionstart-hook.md` — operational doc for `.claude/hooks/session-start-skills.sh`.

### Changed
- `package.json` now lists `LICENSE`, `CHANGELOG.md`, `INIT.en.md`, `INSTALL.en.md` in `files[]` so they ship with the npm package.
- `ci.yml` and `dod.yml` no longer skip the `llm-project-mapper` repo itself (eat-your-own-dog-food).
- `presentation/slides.md` regenerated after rename — PDF + PPTX rebuilt.

### Fixed
- Residual legacy naming mentions removed from `_BOOTSTRAP.md` and inline examples (legacy detection in `bin/cli.js` preserved for back-compat overlays).

## [0.2.0] - 2026-05-16

### Changed
- **BREAKING** Renamed the npm package to `@wesleysimplicio/llm-project-mapper`. ([#15](https://github.com/wesleysimplicio/llm-project-mapper/pull/15))
- **BREAKING** Renamed the CLI command to `npx @wesleysimplicio/llm-project-mapper`.
- **BREAKING** Source override env var renamed to `LLM_PROJECT_MAPPER_SOURCE`.
- Video compositions renamed to `WhyLlmProjectMapper{PT,EN}`.
- Assets renamed to `assets/llm-project-mapper-*.png`.

### Deprecated
- The previous package name is marked deprecated and redirects users to `@wesleysimplicio/llm-project-mapper`.

## [0.1.6] - 2026-05-15

### Added
- Rock backing track on the Why explainer video (kick/snare/hi-hat/power chord drone synthesized with ffmpeg). ([#14](https://github.com/wesleysimplicio/llm-project-mapper/pull/14))
- Static cover linked from `README.md` and `README.pt-BR.md`.

### Changed
- Why video re-paced: 80s → 53s, 17.7 MB → 14.1 MB. Animation delays reduced from `frame - 50..280` to `frame - 4..170`.

## [0.1.5] - 2026-05-15

### Added
- WhyLlmProjectMapper explainer video in PT-BR and EN (9 scenes, 80s, 1080p). ([#12](https://github.com/wesleysimplicio/llm-project-mapper/pull/12))
- `video/src/why/` isolated directory with own i18n provider (`WhyLangProvider`, `STRINGS_WHY`).
- npm scripts `build:why`, `build:why:en`, `build:why:all`, `still:why`, `still:why:en`.

### Fixed
- Hook execution repair + starter hero image.

## [0.1.4] - 2026-05-14

### Added
- `workflow_dispatch:` trigger on the `Publish to npm` workflow. ([#10](https://github.com/wesleysimplicio/llm-project-mapper/pull/10))
- `Verify npm auth (whoami)` early-failure step on the publish workflow.

## [0.1.3] - 2026-05-14

### Added
- Safe starter update command (`npx ... --update`).
- `scripts/update-starter.sh` / `scripts/update-starter.ps1`.

## [0.1.2] - 2026-05-13

### Added
- `.github/workflows/publish-npm.yml` — auto-publishes to npm on every push to `main` when `package.json` version differs from registry, with `--provenance --access public` and automatic `vX.Y.Z` tag. ([#7](https://github.com/wesleysimplicio/llm-project-mapper/pull/7))

## [0.1.1] - 2026-05-13

### Added
- `INSTALL.md` — step-by-step overlay install guide for existing host projects. ([#4](https://github.com/wesleysimplicio/llm-project-mapper/pull/4))
- Always-on skills: `ralph-loop`, `caveman`, `everything-claude-code`. ([#3](https://github.com/wesleysimplicio/llm-project-mapper/pull/3))
- `.claude/hooks/session-start-skills.sh` SessionStart hook.
- `# Agentic starter tracked files` block to `.gitignore`. ([#5](https://github.com/wesleysimplicio/llm-project-mapper/issues/5), [#6](https://github.com/wesleysimplicio/llm-project-mapper/pull/6))

### Changed
- Replaced `projects/` convention with workspace-signal mode detection (`pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, `rush.json`, `package.json` workspaces, or ≥2 manifests under `apps/`/`packages/`/`services/`). ([#4](https://github.com/wesleysimplicio/llm-project-mapper/pull/4))
- Unified `.starter-meta.json` schema across `bootstrap.sh`, `bootstrap.ps1`, `bin/cli.js`.

## [0.1.0] - 2026-05-09

### Added
- Initial release.
- Master instruction file `AGENTS.md` + mirrors `CLAUDE.md` and `.github/copilot-instructions.md`.
- `.specs/` skeleton (product, architecture, workflow, sprints).
- `.skills/` catalog (playwright-e2e, conventional-commits, _template).
- `.agents/` catalog (ralph-loop, tdd, reviewer, architect).
- `.claude/` hooks (post-edit, pre-commit).
- `.codex/config.toml`.
- CI workflows (`ci.yml`, `dod.yml`, `scaffold-self-check.yml`).
- PR + Issue templates.
- Bootstrap installers: `bootstrap.sh`, `bootstrap.ps1`, `bin/cli.js` (`npx @wesleysimplicio/llm-project-mapper`).
- Marp presentation (`presentation/slides.md` → PDF + PPTX).
- Remotion skills tutorial video in PT-BR. ([#1](https://github.com/wesleysimplicio/llm-project-mapper/pull/1))
- i18n layer + English skills tutorial video. ([#2](https://github.com/wesleysimplicio/llm-project-mapper/pull/2))

[Unreleased]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.3.2...v0.4.0
[0.3.2]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.2.0
[0.1.6]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.6
[0.1.5]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.5
[0.1.4]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.4
[0.1.3]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.3
[0.1.2]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.2
[0.1.1]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.1
[0.1.0]: https://github.com/wesleysimplicio/llm-project-mapper/releases/tag/v0.1.0
