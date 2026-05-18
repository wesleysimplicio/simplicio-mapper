# CLAUDE.md

> Este arquivo espelha [AGENTS.md](./AGENTS.md). Edite ambos juntos OU mantenha apenas `AGENTS.md` e symlink `CLAUDE.md` -> `AGENTS.md` (`ln -sf AGENTS.md CLAUDE.md`). O Claude Code lê arquivo regular, não símbolo.

---

# AGENTS.md

## Operational Context

Before changing code, agents should check the project-specific operational docs:

| Need | File |
|---|---|
| Local setup, services, URLs and credentials policy | `docs/local-setup.md` |
| Domain concepts, rules and edge cases | `docs/domain-map.md` |
| Architecture, request path and integrations | `docs/architecture-map.md` |
| Feature entry points and expected scenarios | `docs/features/README.md` |
| Evidence policy and artifact naming | `docs/evidence/README.md` |
| Common failures and fixes | `docs/troubleshooting.md` |
| Reusable local commands | `scripts/README.md` |

Key placeholders to replace in real projects:

- `<APP_NAME>`
- `<FRONTEND_URL>`
- `<BACKEND_URL>`
- `<DATABASE_REQUIREMENT>`
- `<AUTH_FLOW>`
- `<EVIDENCE_COMMAND>`

Agent checklist:

- [ ] Confirm whether the project lives at repo root or under `projects/`.
- [ ] Read `docs/local-setup.md` and relevant `docs/features/*`.
- [ ] Confirm real start/test/build commands.
- [ ] Run validation before edits when practical.
- [ ] Keep changes small and scoped.
- [ ] Run relevant tests/build after edits.
- [ ] Generate screenshot/video/trace for UI or end-to-end flows.
- [ ] Report blockers with the command, log excerpt and likely cause.

> Master instruction file lido por **Claude Code**, **Codex CLI**, **GitHub Copilot**, **Hermes Agent** (Nous Research), **OpenClaw**, **Cursor**, **Aider** e qualquer outro agent que respeite o padrão `AGENTS.md`. É o contrato entre humano e IA neste repositório.
>
> Mudou algo aqui? Reflete em `CLAUDE.md` e `.github/copilot-instructions.md` (mantém os três alinhados ou usa symlink).

Este arquivo dá ao agent **tudo que ele precisa saber pra entregar uma task** sem perguntar: stack, comandos, fluxo de trabalho, padrões, proibições, skills disponíveis e atalhos. Lê ele inteiro antes de escrever a primeira linha de código.

---

## Modo do projeto (CHECK OBRIGATÓRIO no início de toda task)

Antes de qualquer análise, o agent **DEVE** ler `.starter-meta.json` e respeitar `project_mode`:

- **`root`** — projeto único na raiz do repo (default). Stack/PRODUCT_NAME na raiz; `.specs/` único.
- **`monorepo`** — workspace com vários subprojetos. Detectado via `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, `rush.json`, `package.json` com `"workspaces"`, ou **≥2 subpastas com manifesto** em `apps/` / `packages/` / `services/` / `projects/`. Cada subprojeto recebe seu próprio `.specs/`.

**Fallback sem `.starter-meta.json`**: assuma `root`. Não invente monorepo só porque existe uma pasta `apps/` ou `packages/` com um único subprojeto — a regra é workspace signal explícito **OU** ≥2 manifests irmãos.

> Nota sobre instalação overlay: quando o starter é colocado em cima de um projeto host existente (ver `INSTALL.md`), os arquivos do starter podem estar gitignored. Isso não muda o `project_mode` — só muda a visibilidade no git do host.

---

## Stack

`<STACK>` (placeholder — substitui pela stack real do projeto, ex: `Node.js 20 + TypeScript + Next.js 14 + Playwright + Vitest`).

Detalhes completos:

- Linguagem principal: `<STACK>`
- Framework web/API: `<STACK>`
- Banco de dados: `<STACK>`
- Test runner unit: `<STACK>` (sugestão: Vitest, Jest, pytest, xUnit)
- Test runner E2E: **Playwright** (config em `playwright.config.ts`)
- Linter/formatter: `<STACK>` (sugestão: ESLint + Prettier, Ruff, dotnet format)
- CI/CD: GitHub Actions (ver `.github/workflows/`)
- Deploy: `<STACK>` (Vercel/Netlify/Docker/Azure/AWS — ver `.specs/workflow/RELEASE.md`)

> Antes de adicionar dependência nova: **pergunta ao usuário**. Sem exceção.

---

## Comandos importantes

```bash
# desenvolvimento
npm run dev                  # sobe app local
npm run build                # build de producao

# qualidade
npm run lint                 # lint + format check
npm run lint:fix             # lint + format auto-fix
npm test                     # unit tests
npm test -- --coverage       # unit + coverage report (gate >= 80%)

# E2E
npx playwright install       # instala browsers (1a vez)
npx playwright test          # roda suite E2E
npx playwright test --ui     # modo interativo
npx playwright show-report   # abre relatorio ultimo run

# git/PR
git checkout -b feat/<task-id>-<slug>
gh pr create --fill          # usa template de PR
gh run watch                 # acompanha CI do branch atual
```

Adapta os comandos pra stack real (`pnpm`, `yarn`, `bun`, `dotnet`, `python`, `go`).

---

## Padrão de sincronização deste projeto

Para este repositório, sempre que a mudança for **release-relevant**, o fechamento padrão deve deixar tudo sincronizado no mesmo ciclo:

- npm publicado na versão atual de `package.json`
- tag GitHub `vX.Y.Z` criada e enviada
- GitHub Release correspondente criada/atualizada
- `main` limpa e sincronizada com `origin/main`

Validação padrão obrigatória antes de publicar/sincronizar:

```bash
npm run lint
npm test
npm run docs:build
npm run test:e2e -- --reporter=list,html
```

Se qualquer item acima falhar, **não** publique e **não** crie a release/tag até corrigir.

---

## Workflow loop OBRIGATÓRIO

Toda task técnica passa por esses passos. Não pula etapa.

1. **Ler task** — abre arquivo em `.specs/sprints/sprint-XX/<task-id>.task.md`. Lê contexto + acceptance criteria + test plan + DoD.
2. **Planejar** — escreve plano interno curto: o que muda, quais arquivos, como verificar, efeitos colaterais. Se task ambígua → pergunta antes de codar.
3. **Carregar contexto** — lê `.specs/architecture/PATTERNS.md` + ADRs relevantes em `.specs/architecture/ADR-*.md`. Verifica skills aplicáveis em `.skills/`.
4. **Editar** — aplica edits cirúrgicos. Só toca o que a task pede. Sem refactor extra, sem renomeação, sem comentário a mais.
5. **Lint** — `npm run lint`. Vermelho = corrige antes de seguir.
6. **Unit** — `npm test`. Vermelho = corrige antes de seguir. Coverage do diff >= 80%.
7. **E2E (OBRIGATÓRIO em TODA task)** — `npx playwright test --reporter=list,html`. Captura **trace + screenshot + video** (todos, não "ou"). Sem evidência salva em `playwright-report/` + `test-results/` = task não fechada. Vermelho = corrige.
8. **Fix loop** — se qualquer etapa falhou: volta ao passo 4. Repete até verde.
9. **Commit** — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`). Mensagem em **inglês**. Body explica *why*, não *what*.
10. **PR** — `gh pr create`. Preenche template inteiro: link da task, evidências (screenshots Playwright), checklist DoD marcado.

---

## Definition of Done

PR só faz merge quando **todos** os itens abaixo estão marcados:

- [ ] Unit tests passam (`npm test` verde)
- [ ] Lint passa (`npm run lint` verde)
- [ ] E2E Playwright passa com **evidência anexada em TODA task** — `playwright-report/index.html` + `test-results/<spec>/trace.zip` + screenshots por cenário + video (when retry). Hard rule: sem evidência, sem merge.
- [ ] Coverage do diff >= 80%
- [ ] Acceptance Criteria da task: todos os checkboxes marcados
- [ ] PR template preenchido (link task + descrição + evidências)
- [ ] Conventional commit no merge
- [ ] ADR criado em `.specs/architecture/` se mudou decisão arquitetural
- [ ] Changelog atualizado se release-relevant
- [ ] Sem warning novo no console
- [ ] Sem `console.log` / `print` / `Debug.WriteLine` deixado pra trás
- [ ] Sem TODO sem dono e sem prazo

CI bloqueia merge se DoD falhar (`.github/workflows/dod.yml`).

---

## Padrões de código

Padrões completos em `.specs/architecture/PATTERNS.md`. Resumo:

- Naming, estrutura de pastas, criação de endpoint/componente/teste, tratamento de erro, logging, validação — **tudo lá**.
- Decisões irreversíveis viram **ADR** em `.specs/architecture/ADR-XXX-*.md` (template em `.specs/architecture/ADR-template.md`).
- Antes de escrever código novo: lê `PATTERNS.md` da seção relevante. Não inventa estilo próprio.

---

## Onde encontrar contexto

| Pergunta | Onde olha |
|---|---|
| Por que esse produto existe? | `.specs/product/VISION.md` |
| Quem é o usuário? | `.specs/product/PERSONAS.md` |
| Quais entidades de negócio? | `.specs/product/DOMAIN.md` |
| Como o sistema é desenhado? | `.specs/architecture/DESIGN.md` |
| Como escrever código aqui? | `.specs/architecture/PATTERNS.md` |
| Por que decidimos X? | `.specs/architecture/ADR-*.md` |
| Como faço PR/branch/release? | `.specs/workflow/WORKFLOW.md`, `RELEASE.md`, `CONTRIBUTING.md` |
| O que tá no backlog? | `.specs/sprints/BACKLOG.md` |
| Sprint atual? | `.specs/sprints/sprint-XX/SPRINT.md` |
| Tasks abertas? | `.specs/sprints/sprint-XX/*.task.md` |
| Skills/capacidades reutilizáveis? | `.skills/README.md` + `.skills/*/SKILL.md` |
| Custom agents (sub-agents)? | `.agents/README.md` + `.agents/*.agent.md` |

---

## Proibido

Lista negra. Nada aqui é negociável.

- **Pular testes** — sem unit/E2E = sem merge.
- **Mockar pra fazer passar** — mock só pra isolar dependência externa real (HTTP, DB), nunca pra esconder falha.
- **Commit com vermelho** — lint/test falhando = não commita. Hook `.claude/hooks/pre-commit.sh` bloqueia.
- **Ignorar ADR** — decisão registrada em ADR é lei. Reverter/mudar ADR exige novo ADR ("Supersedes ADR-XXX").
- **Adicionar dependência sem perguntar** — toda nova dep (`npm install`, `dotnet add`, etc.) passa por confirmação humana.
- **Editar arquivo não lido** — lê antes de editar. Sempre.
- **Refactor escondido em PR de feature** — refactor = PR separado.
- **Force push em `main`/`master`** — bloqueado por hook e por settings do repo.
- **Commitar segredo** — `.env`, token, key, senha → nunca. Usa `.gitignore` + secrets manager.
- **Reformatar arquivo inteiro num PR pequeno** — diff polui review.

---

## Skills disponíveis

Skills moram em `.skills/<nome>/SKILL.md` e são capacidades reutilizáveis que o agent invoca quando o trigger casa. Lista atual:

### Ativadas por padrão no início da sessão

Estas três skills são **ativadas automaticamente no começo de toda sessão** (via `.claude/settings.json` SessionStart hook). A política de uso de cada uma é a seguinte:

- **`caveman`** — modo terse de resposta. Economiza ~65% tokens de output sem perder substância técnica. Default level: `full`. Boundaries: código, commits, PRs e docs canônicos permanecem em prosa normal. **Ativada por padrão**, mas pode ser desativada quando o contexto pedir resposta em prosa normal, via `stop caveman` / `normal mode`.
- **`ralph-loop`** — loop autônomo `read → plan → execute → lint → unit → e2e → fix → repeat` até DoD verde. **Obrigatório** em TODA task técnica com AC mensurável. Dual exit gate: indicadores verdes + `EXIT_SIGNAL: true`.
- **`everything-claude-code`** — bundle de ~60 agents + ~221 skills. Padrão: usar o **máximo de agents ECC em paralelo** a cada alteração (single message, múltiplas Agent calls). Reviewers da stack + `security-reviewer` **obrigatórios** após edits.

### Sob demanda

- **`playwright-e2e`** — como escrever teste Playwright neste projeto. Trigger: nova feature de UI ou fluxo end-to-end. Cobre fixtures, page objects, evidências (trace/screenshot/video) e padrões de assert.
- **`conventional-commits`** — regras de commit (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `perf:`, `style:`, `ci:`, `build:`). Trigger: hora de commitar. Inclui exemplos, breaking changes (`!`/`BREAKING CHANGE:`) e scope.
- **`_template`** — base pra criar skill nova. Copia, renomeia pasta, preenche frontmatter (`name`, `description`, `trigger`, `steps`, `dod`).

Detalhes completos: `.skills/README.md`.

---

## Custom agents disponíveis

Sub-agents customizados moram em `.agents/<slug>.agent.md` (padrão **AGENTS.md ecosystem**, lido por Claude Code, Codex, Hermes, OpenClaw, Cursor, Aider). Espelhados em `.github/copilot/agents/` para o GitHub Copilot Workspace. Lista atual:

- **`ralph-loop.agent.md`** — Ralph Loop (padrão autônomo, Ralph Wiggum technique). Loop `read → plan → execute → lint → unit → Playwright → fix → repeat` até DoD verde. **Mapeia para comando nativo de cada ferramenta**: Claude Code → `/ralph-loop "<prompt>"` (plugin oficial `claude-plugins-official`); Codex CLI ≥0.128 → `/goal <objective>`; GitHub Copilot CLI → `copilot --autopilot --max-autopilot-continues N`; VS Code Agent Mode → permission level "Autopilot"; Cursor ≥3.0 → Background Agent / `/multitask`. Aciona em **toda task técnica** com AC mensurável. Tools: `edit`, `terminal`, `search`.
- **`tdd.agent.md`** — TDD Specialist. Escreve teste falhando antes do código. Loop red-green-refactor. Tools: `edit`, `terminal`, `search`. Aciona em feature/bugfix com cobertura nova.
- **`reviewer.agent.md`** — Code Reviewer. Read-only. Comenta problemas e sugestões. Tools: `search`, `read`. Aciona em revisão de PR aberto, sem editar.
- **`architect.agent.md`** — Architect. Desenha arquitetura, cria ADRs, atualiza `PATTERNS.md`. Não escreve código de produção. Tools: `edit`, `search`, `read`. Aciona em decisão arquitetural, refactor amplo, integração nova.
- **`_template.agent.md`** — base para criar agent novo. Copia, renomeia, preenche frontmatter (`name`, `description`, `tools`).

Detalhes completos: `.agents/README.md`.

---

## Comandos especiais

### Criar nova ADR

```bash
# encontra proximo numero
ls .specs/architecture/ADR-*.md | tail -1
# copia template
cp .specs/architecture/ADR-template.md .specs/architecture/ADR-XXX-<slug>.md
# edita: Status, Contexto, Decisao, Consequencias, Alternativas
# commita junto com a feature que motivou a decisao
```

### Abrir PR

```bash
git push -u origin $(git branch --show-current)
gh pr create --fill        # usa template padrao (.github/PULL_REQUEST_TEMPLATE.md)
gh pr view --web           # abre no browser pra revisar
gh run watch               # acompanha CI
```

### Criar task nova

```bash
cp .specs/sprints/task-template.md .specs/sprints/sprint-XX/<id>-<slug>.task.md
# preenche: Contexto, Acceptance Criteria, Out of scope, Test plan, DoD, Pegadinhas, Links
# adiciona linha em .specs/sprints/BACKLOG.md
```

### Criar skill nova

```bash
cp -R .skills/_template .skills/<nome-da-skill>
# edita SKILL.md: name, description, trigger, steps, padroes, DoD
# referencia em .skills/README.md
```

### Rodar checklist DoD localmente antes de PR

```bash
npm run lint && npm test -- --coverage && npx playwright test
# se tudo verde -> git commit && git push && gh pr create --fill
```

---

## Notas finais pro agent

- **Idioma**: respostas/docs em **pt-BR**, código (vars/funções/classes) em **inglês**, commits em **inglês**.
- **Sem emoji em código**. README/slides ok.
- **Sem resumo no final** de uma resposta. Entrega o trabalho e finaliza.
- **Sem estimativa de tempo** (não tem como prever, não promete).
- **Pergunta apenas em ambiguidade real** do pedido. Não pergunta pra confirmar trabalho de execução.
- **Paralelo é o padrão** — research + read + review independentes rodam simultâneos.
- **Hooks do `.claude/hooks/`** rodam automaticamente: post-edit faz lint/format, pre-commit bloqueia commit vermelho.

<!-- codex-long-running-agent-overlay:start -->
## Universal Long-Running Agent Overlay

This section complements the repository-specific guidance already in this file. If anything here conflicts with the repo-specific rules above, the repo-specific rules win.

- `PRD.md` is the task source of truth for long-running sessions.
- `PROGRESS.md` is the persistent checkpoint log.
- `GOAL_RESULT.md` is the final execution report.
- Before coding, read this file, `PRD.md`, `PROGRESS.md` when it exists, `README.md`, project manifests, tests, and the relevant source folders.
- Work in small checkpoints, run the smallest relevant validation after each meaningful change, update `PROGRESS.md`, and continue until complete or genuinely blocked.
- Stop only when the requested work is complete, validation is documented, and `GOAL_RESULT.md` reflects the outcome.
- Do not rewrite unrelated architecture, fake successful validation, expose secrets, or push without explicit operator instruction for the active session.
<!-- codex-long-running-agent-overlay:end -->
