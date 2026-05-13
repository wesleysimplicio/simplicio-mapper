# Agentic Starter Pack

> 🇧🇷 Versão em português. Read this in English: [README.md](README.md).

Esqueleto de repositório AI-friendly, neutro de stack. Joga em **qualquer** projeto — novo ou existente — e qualquer agente CLI (Claude Code, Codex, Cursor, GitHub Copilot, Aider com Deepseek/Kimi/MiniMax/GLM, Hermes, OpenClaw) ganha o contexto que precisa pra entregar trabalho no mesmo dia.

> Starter pack, não framework. Entrega estrutura, instruções, processo. A stack é sua.

---

## Documentação operacional para agentes

Este starter agora inclui templates genéricos e preenchíveis para deixar qualquer projeto mais fácil de operar por agentes:

- `docs/local-setup.md`: como instalar, subir, validar e acessar o projeto.
- `docs/domain-map.md`: conceitos de negócio, regras críticas e casos especiais.
- `docs/architecture-map.md`: formato do sistema, caminho da requisição e integrações.
- `docs/features/README.md`: template de feature com arquivos, endpoints, regras e evidências.
- `docs/evidence/README.md`: política de screenshot/video/trace e nome de artefatos.
- `docs/troubleshooting.md`: diagnóstico e correções repetíveis.
- `scripts/`: placeholders neutros de stack para start, test e evidência.
- `tests/e2e/smoke.spec.ts`: smoke test Playwright genérico baseado em `BASE_URL`.

Preencha esses arquivos depois de instalar o starter em um projeto real. O objetivo é reduzir tempo de descoberta para humanos e agentes sem impor framework.

---

## TL;DR — começa em 60 segundos

Escolha **um** caminho de instalação abaixo, rode dentro da pasta do projeto, e deixa o agente executar `INIT.md`.

| SO | Comando único recomendado |
|---|---|
| **macOS** | `npx @wesleysimplicio/agentic-starter` |
| **Linux** | `npx @wesleysimplicio/agentic-starter` |
| **Windows (PowerShell)** | `npx @wesleysimplicio/agentic-starter` |
| **Windows (cmd.exe)** | `npx @wesleysimplicio/agentic-starter` |

Mesmo comando em todo lugar. Sem dependência de bash, sem clone, sem instalação global.

---

## 🎬 Vídeo tutorial das skills

Tutorial animado de 59 segundos (Remotion · 1080p · em pt-BR) explicando todas as skills do starter — o que são, como invocar (trigger explícito vs. implícito), as duas inclusas (`playwright-e2e`, `conventional-commits`) e como criar a sua a partir do `_template`.

> 🌎 Prefere inglês? O [README em inglês](README.md) tem a versão equivalente em English do mesmo vídeo.

[![Capa do tutorial de Skills](video/assets/cover.png)](video/assets/skills-tutorial.mp4)

> 🎥 **Assistir o vídeo completo:** [`video/assets/skills-tutorial.mp4`](video/assets/skills-tutorial.mp4) (19 MB · 1080p · H.264)
> 🛠️ **Código / re-render:** [`video/`](video/README.md) · `cd video && npm install && npm run build`

<details>
<summary>Player embarcado (clique para expandir)</summary>

<video src="video/assets/skills-tutorial.mp4" controls width="100%"></video>

</details>

### Walkthrough — todas as cenas em imagens

Prefere imagens? Cada cena foi capturada no estado estabilizado. Lê de cima pra baixo pra acompanhar o fluxo completo do tutorial.

#### 01 · Intro — gancho "Skills"

![Cena 01 Intro](video/evidence/01-intro-frame-130.png)

> Logo animado + tagline + as CLIs de agente que leem o mesmo arquivo de skill (Claude Code, Codex, Copilot, Cursor, Aider).

#### 02 · O que é uma skill?

![Cena 02 O que são skills](video/evidence/02-what-are-skills-frame-310.png)

> Skill é um manual curto em Markdown em `.skills/<nome>/SKILL.md` com frontmatter (`name`, `description`) e quatro sections: **Trigger**, **Steps**, **Padrões**, **Definition of Done**. Concisa, idempotente, single-responsibility.

#### 03 · Catálogo — o que vem no starter

![Cena 03 Catálogo](video/evidence/03-catalog-frame-490.png)

> Três skills inclusas: `playwright-e2e`, `conventional-commits` e `_template` (base pra criar novas). Skills locais ficam em `.skills/`; globais em `~/.claude/skills/`.

#### 04 · Skill #1 — `playwright-e2e`

![Cena 04 Skill playwright](video/evidence/04-playwright-frame-730.png)

> Ativa em **toda task técnica** antes do commit. Hard rule: sem **trace + screenshot + video** não faz merge. Use `getByRole / getByLabel / getByTestId`; nunca `waitForTimeout` ou mock pra fazer passar.

#### 05 · Skill #2 — `conventional-commits`

![Cena 05 Skill conventional commits](video/evidence/05-commits-frame-970.png)

> `<type>(<scope>)?: <subject>` — 10 tipos cobertos (`feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `style`). Breaking change usa `!` após o type ou footer `BREAKING CHANGE:`. Habilita SemVer + changelog automáticos.

#### 06 · Como invocar uma skill

![Cena 06 Como invocar](video/evidence/06-how-to-invoke-frame-1180.png)

> Dois modos: **explícito** (`$skill-name` no prompt) e **implícito** (o agente casa o pedido contra o `description` do frontmatter). O `description` é a coisa mais importante de uma skill — escreve como uma query.

#### 07 · Skill #3 — Crie a sua a partir do `_template`

![Cena 07 Crie a sua](video/evidence/07-create-your-own-frame-1390.png)

> `cp -R .skills/_template .skills/<sua-skill>` → preenche o frontmatter → escreve as 4 sections → adiciona em `.skills/README.md`. O agente já pega no próximo prompt que casar com o description.

#### 08 · Boas práticas

![Cena 08 Boas práticas](video/evidence/08-best-practices-frame-1570.png)

> Skills que envelhecem bem são **concisas** (30–100 linhas), **idempotentes**, **single-responsibility**, com **linguagem direta** e **DoD verificável**. Não cria skill pra coisa única, convenção universal ou conhecimento genérico de stack.

#### 09 · Outro — recap & CTA

![Cena 09 Outro](video/evidence/09-outro-frame-1750.png)

> Skills transformam convenções repetidas em superpoderes do agente. `cp -R .skills/_template .skills/<sua-skill>` e cria a sua hoje.

---

## Pré-requisitos

| Requisito | macOS | Linux | Windows |
|---|---|---|---|
| **Node.js >= 16.7** (para `npx`) | `brew install node` | `sudo apt install nodejs npm` (Debian/Ubuntu) · `sudo dnf install nodejs npm` (Fedora) · ou [nvm](https://github.com/nvm-sh/nvm) | [nodejs.org installer](https://nodejs.org) ou `winget install OpenJS.NodeJS.LTS` |
| **Git** | preinstalado / `brew install git` | `sudo apt install git` / `sudo dnf install git` | [git-scm.com](https://git-scm.com) ou `winget install Git.Git` |
| **Bash 4+** (só pra `bootstrap.sh`) | preinstalado (Bash 3.2 também roda) | preinstalado | Git Bash (vem com Git for Windows) ou WSL |
| **PowerShell 5.1+ / pwsh 7+** (só pra `bootstrap.ps1`) | `brew install --cask powershell` | `sudo snap install powershell --classic` | preinstalado |

Escolha **um** runtime: `npx` funciona em todo lugar; `bootstrap.sh` pra shells Unix; `bootstrap.ps1` pra Windows nativo.

---

## O que vem dentro

```
seu-projeto/
├── AGENTS.md                 # instruções mestre (lidas por toda CLI)
├── CLAUDE.md                 # espelho de AGENTS.md (Claude Code)
├── INIT.md                   # prompt one-shot que o agente roda após bootstrap
├── .github/
│   ├── copilot-instructions.md    # espelho de AGENTS.md (Copilot)
│   ├── workflows/                  # CI + gate de Definition of Done
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
├── .specs/                   # docs canônicas (specs como código)
│   ├── product/              # VISION, DOMAIN, PERSONAS
│   ├── architecture/         # DESIGN, PATTERNS, ADRs
│   ├── workflow/             # WORKFLOW, CONTRIBUTING, RELEASE
│   └── sprints/              # BACKLOG + pastas de sprint
├── .skills/                  # skills reutilizáveis do agente
├── .agents/                  # sub-agents customizados
├── .claude/                  # config + hooks Claude Code
├── .codex/                   # config Codex CLI
├── playwright.config.ts      # E2E padrão
└── presentation/             # slides do método (Marp)
```

Neutro de stack: tudo que é específico da sua stack vai ser preenchido pelo `INIT.md` quando o agente inspecionar o código real.

---

## Caminhos de instalação

### A. `npx` — recomendado, cross-platform, zero clone

```bash
# dentro da pasta do projeto (funciona em macOS, Linux, Windows)
npx @wesleysimplicio/agentic-starter
```

Roda interativo. Pergunta **só**:

1. **Qual CLI/LLM usar pro handoff** (auto-detecta quais estão instaladas e marca `[installed]`).
2. **Adicionar ignores recomendados ao `.gitignore`?** (sim/não — nunca sobrescreve o seu `.gitignore` existente).

Tudo o resto — `PRODUCT_NAME`, stack, dependências — auto-detectado de `package.json` / `pyproject.toml` / `go.mod` / `*.csproj` / `Cargo.toml` / `pubspec.yaml` / `composer.json` / `Gemfile` / `mix.exs` / `pom.xml` / `build.gradle*`.

#### Não-interativo (CI / scripts)

```bash
npx @wesleysimplicio/agentic-starter --yes --cli skip --append-gitignore no
```

#### Preview sem escrever

```bash
npx @wesleysimplicio/agentic-starter --dry-run --yes
```

#### Lista completa de flags

| Flag | Para que serve |
|---|---|
| `-y, --yes` | Não-interativo (defaults: sem append no `.gitignore`, pula handoff) |
| `-f, --force` | Sobrescreve arquivos do template do starter. **Nunca** toca arquivos de instrução do usuário (`AGENTS.md`, `CLAUDE.md`, `INIT.md`, `.github/copilot-instructions.md`, `.gitignore`) |
| `--dry-run` | Imprime ações sem escrever |
| `--cli <key>` | Escolhe CLI pro handoff do `INIT.md`: `claude`, `codex`, `copilot`, `cursor`, `deepseek`, `kimi`, `minimax`, `glm`, `hermes`, `openclaw`, `aider`, `other`, `skip` |
| `--append-gitignore <yes\|no>` | Adiciona ignores recomendados ao `.gitignore` |
| `--skip-meta` | Não escreve `.starter-meta.json` |
| `--silent` | Saída mínima |
| `-v, --version` | Mostra versão |
| `-h, --help` | Mostra ajuda |

### B. `bootstrap.sh` — shells Unix (macOS / Linux / Git Bash / WSL)

Clona o starter e roda o script:

```bash
git clone --depth=1 https://github.com/wesleysimplicio/agentic-starter.git tmp-starter
cp -R tmp-starter/. ./ && rm -rf tmp-starter
chmod +x ./bootstrap.sh   # só na primeira vez
./bootstrap.sh
```

### C. `bootstrap.ps1` — Windows nativo (PowerShell)

```powershell
git clone --depth=1 https://github.com/wesleysimplicio/agentic-starter.git tmp-starter
Copy-Item -Recurse -Force tmp-starter\* .\
Remove-Item -Recurse -Force tmp-starter

# PowerShell 7+ (pwsh)
pwsh -File .\bootstrap.ps1

# PowerShell 5.1 (built-in no Windows 10/11)
powershell -ExecutionPolicy Bypass -File .\bootstrap.ps1
```

Os três caminhos produzem o mesmo resultado e fazem as mesmas duas perguntas.

---

## Handoff de CLI — agentes suportados

Após o scaffold, o bootstrap pergunta qual CLI/LLM lançar com o `INIT.md`. Instalações detectadas ganham `[installed]` no menu.

| # | CLI / LLM | Loop de agente nativo? | Docs de instalação |
|---|---|---|---|
| 1 | **Claude Code** | sim | <https://docs.claude.com/claude-code> |
| 2 | **Codex CLI** | sim | <https://github.com/openai/codex> |
| 3 | **GitHub Copilot CLI** | não — cola prompt manual | `gh extension install github/gh-copilot` |
| 4 | **Cursor Agent** | sim | `npm i -g cursor-agent` (ou Cursor IDE) |
| 5 | **Deepseek** (via Aider) | sim | `pip install aider-chat` |
| 6 | **Kimi K2.6** (via Aider, OpenRouter) | sim | `pip install aider-chat` |
| 7 | **MiniMax M2.7** (via Aider, OpenRouter) | sim | `pip install aider-chat` |
| 8 | **GLM 5.1** (via Aider, OpenRouter) | sim | `pip install aider-chat` |
| 9 | **Hermes Agent** (Nous Research) | sim | <https://github.com/NousResearch> |
| 10 | **OpenClaw** | sim | <https://github.com/openclaw> |
| 11 | **Aider** (escolhe modelo interativo) | sim | `pip install aider-chat` |
| 12 | Outro / manual (clipboard) | — | — |
| 13 | Pular — rodo `INIT.md` depois | — | — |

Pra Copilot CLI (sem loop de agente nativo), o bootstrap copia o prompt pro clipboard (`pbcopy` no macOS, `xclip`/`wl-copy` no Linux, `clip.exe` no Windows/WSL) e você cola no Copilot Chat.

---

## O que `INIT.md` faz — o contrato de segurança

Quando a CLI escolhida roda `INIT.md`, ela lê `.starter-meta.json` e segue três regras inegociáveis:

1. **`read_only_globs` são intocáveis.** Qualquer arquivo casando esses globs (`**/*.razor`, `**/*.cs`, `**/*.csproj`, `**/*.sln`, `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`, `**/*.py`, `**/*.go`, `**/*.rs`, `**/*.java`, `**/*.kt`, `**/*.dart`, `**/*.php`, `**/*.rb`) é read-only. O agente lê pra contexto mas nunca escreve. Se `git status` mostra qualquer um após init — é bug.
2. **`init_must_merge` preserva sua essência.** Se `AGENTS.md` / `CLAUDE.md` / `.github/copilot-instructions.md` já existiam antes do bootstrap, o agente **lê eles**, **preserva o conteúdo**, e **mescla** a estrutura do starter por cima. Nunca reescreve do zero.
3. **`init_must_ask` pergunta só 4 coisas.** `team`, `domain`, `vision_oneliner`, `primary_personas` — uma vez, em uma única mensagem. Tudo mais (`product_name`, `stack`) é auto-detectado.

O agente então escreve — e só escreve — dentro da whitelist:

```
.specs/**          .agents/**         .skills/**
.claude/**         .codex/**
.github/copilot-instructions.md
.github/copilot/**
.github/PULL_REQUEST_TEMPLATE.md
.github/ISSUE_TEMPLATE/**
.github/workflows/ci.yml
.github/workflows/dod.yml
AGENTS.md  CLAUDE.md  README.md  README.pt-BR.md
playwright.config.ts (só se faltando ou for nosso template)
```

Qualquer coisa fora dessa whitelist **e** que não vem do template do starter = não tocada.

---

## Troubleshooting

### macOS / Linux

| Sintoma | Solução |
|---|---|
| `./bootstrap.sh: Permission denied` | `chmod +x ./bootstrap.sh` |
| `command not found: npx` | Instala Node.js (ver Pré-requisitos) |
| `Claude Code not installed` após escolher | Instala o Claude Code ou escolhe `[12] Other` pra copiar o prompt pro clipboard |
| Bash antigo no macOS (`bash --version` mostra 3.2) | Funciona — script é Bash 3.2-compatível. Se der problema, `brew install bash` pra Bash 5+ |

### Windows

| Sintoma | Solução |
|---|---|
| `bootstrap.ps1 cannot be loaded ... execution policy` | Roda com `powershell -ExecutionPolicy Bypass -File .\bootstrap.ps1` (bypass por sessão, sem mudança permanente) |
| Line endings quebrados ao rodar `.sh` no Git Bash | `git config --global core.autocrlf input` e re-clona |
| `npx` não achado no cmd.exe | Abre novo terminal após instalar Node (atualiza PATH), ou usa caminho completo `C:\Program Files\nodejs\npx.cmd` |
| `pwsh` não encontrado | Você tem PowerShell 5.1 (built-in) — usa o formato `powershell -ExecutionPolicy Bypass ...`. Pra instalar pwsh 7: `winget install Microsoft.PowerShell` |

### Cross-platform

| Sintoma | Solução |
|---|---|
| Bootstrap sai com `aborting: existing files would be overwritten` | Re-roda com `--force` (só sobrescreve arquivos do template do starter, nunca seus arquivos de instrução) |
| `git status` mostra `package.json` / arquivos fonte modificados após init | Para. Isso é violação de `read_only_globs`. Abre issue com o caminho do arquivo |
| `.gitignore` foi reescrito | O starter nunca sobrescreve — só adiciona se você disse `yes`. Se o seu foi substituído, você rodou `--force`; restaura pelo git |
| Quero re-rodar `INIT.md` depois | `claude "$(cat INIT.md)"` (ou equivalente da sua CLI). O handoff é só um lançador |

---

## Ordem de leitura sugerida (humano)

1. `README.md` (este arquivo) — visão geral.
2. `AGENTS.md` — instrução mestre do agente.
3. `.specs/README.md` — mapa de navegação das specs.
4. `.specs/product/VISION.md` — contexto do produto.
5. `.specs/architecture/DESIGN.md` — arquitetura.
6. `.specs/workflow/WORKFLOW.md` — processo.
7. `.skills/README.md` — capacidades do agente.

---

## Quickstart pro agente (depois do `INIT.md`)

1. Lê `AGENTS.md` (raiz). Esse é o contrato.
2. Lê `.specs/product/VISION.md` pro porquê.
3. Lê `.specs/architecture/DESIGN.md` e `PATTERNS.md` pro como.
4. Pega a próxima task em `.specs/sprints/sprint-XX/`.
5. Roda o loop obrigatório: ler task → planejar → editar → lint → unit → e2e → corrigir → commit.
6. Valida Definition of Done antes de abrir PR.

---

## Opcional: limpar arquivos do starter

Após o agente terminar `INIT.md`, os arquivos de bootstrap não são mais necessários.

**macOS / Linux / Git Bash / WSL:**

```bash
rm _BOOTSTRAP.md INIT.md bootstrap.sh bootstrap.ps1
git add -A && git commit -m "chore: remove starter bootstrap files"
```

**Windows PowerShell:**

```powershell
Remove-Item _BOOTSTRAP.md, INIT.md, bootstrap.sh, bootstrap.ps1
git add -A; git commit -m "chore: remove starter bootstrap files"
```

`.starter-meta.json` fica como referência pra re-runs futuros.

---

## Filosofia

- **Specs como código.** O que não está em `.specs/`, o agente não vê.
- **Tasks atômicas.** Uma task = um PR pequeno e revisável.
- **DoD automatizada.** O que não passa no gate, não merge.
- **Skills reutilizáveis.** Capacidade que vira padrão, vira `SKILL.md`.
- **Loop curto.** Editar, testar, corrigir, repetir. Nunca acumular dívida invisível.
- **Nunca destruir.** Arquivos do usuário são read-only; arquivos do starter mesclam ao invés de sobrescrever.

---

## Licença

`<LICENSE_PLACEHOLDER>` (substitua por MIT, Apache-2.0, proprietária ou o que fizer sentido).

---

## Próximos passos

- Roda o bootstrap.
- Deixa o agente executar `INIT.md`.
- Preenche specs com contexto real do produto (o agente faz a maior parte a partir do código).
- Roda a primeira sprint usando `.specs/sprints/sprint-01/`.
- Vê `presentation/ai-agent-specialist.pdf` pro método completo.
