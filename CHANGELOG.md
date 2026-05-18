# Changelog

All notable changes to **LLM Project Mapper** are documented in this file.

Format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
- Residual `agentic-starter` mentions removed from `_BOOTSTRAP.md` and inline examples (legacy detection in `bin/cli.js` preserved for back-compat overlays).

## [0.2.0] - 2026-05-16

### Changed
- **BREAKING** Renamed npm package `@wesleysimplicio/agentic-starter` → `@wesleysimplicio/llm-project-mapper`. ([#15](https://github.com/wesleysimplicio/llm-project-mapper/pull/15))
- **BREAKING** Renamed CLI command `npx @wesleysimplicio/agentic-starter` → `npx @wesleysimplicio/llm-project-mapper`.
- **BREAKING** Env var `AGENTIC_STARTER_SOURCE` → `LLM_PROJECT_MAPPER_SOURCE`.
- Video compositions renamed: `WhyAgenticStarter{PT,EN}` → `WhyLlmProjectMapper{PT,EN}`.
- Assets renamed: `assets/agentic-starter-*.png` → `assets/llm-project-mapper-*.png`.

### Deprecated
- npm package `@wesleysimplicio/agentic-starter` is marked deprecated and redirects users to the new name.

## [0.1.6] - 2026-05-15

### Added
- Rock backing track on the Why explainer video (kick/snare/hi-hat/power chord drone synthesized with ffmpeg). ([#14](https://github.com/wesleysimplicio/llm-project-mapper/pull/14))
- Static cover linked from `README.md` and `README.pt-BR.md`.

### Changed
- Why video re-paced: 80s → 53s, 17.7 MB → 14.1 MB. Animation delays reduced from `frame - 50..280` to `frame - 4..170`.

## [0.1.5] - 2026-05-15

### Added
- WhyAgenticStarter explainer video in PT-BR and EN (9 scenes, 80s, 1080p). ([#12](https://github.com/wesleysimplicio/llm-project-mapper/pull/12))
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

[Unreleased]: https://github.com/wesleysimplicio/llm-project-mapper/compare/v0.2.2...HEAD
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
