# Agentic Starter Pack

Template de repositório AI-friendly, neutro e agnóstico de stack. Foi pensado para ser copiado em qualquer projeto novo e dar ao agente (Claude Code, Codex, Copilot ou outro) o contexto que ele precisa para entregar releases por dia.

> Este é um starter pack, não um framework. Ele entrega estrutura, instrução e processo. A stack de execução é sua escolha.

---

## O que é

Um esqueleto pronto contendo:

- Instruction files (`AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`) que orientam o agente.
- Specs (`/.specs/`) com VISION, DOMAIN, PERSONAS, DESIGN, ADRs, WORKFLOW e backlog de sprints.
- Skills reutilizáveis (`/.skills/`) que o agente invoca quando o contexto bate.
- Hooks (`.claude/hooks/`) e config (`.claude/settings.json`, `.codex/config.toml`) prontos.
- Pipeline de CI (`.github/workflows/`) com gate de Definition of Done.
- Templates de PR e Issue.
- Apresentação `presentation/` sobre o método AI Agent Specialist.

Tudo neutro: a stack real vai ser plugada via `<PLACEHOLDERS>` quando você adaptar para o seu projeto.

---

## Como usar (3 passos)

### 1. Copiar starter pro projeto

```bash
# clonar do GitHub direto pra dentro do projeto
git clone --depth=1 https://github.com/wesleysimplicio/agentic-starter.git tmp-starter
cp -R tmp-starter/. ./
rm -rf tmp-starter
```

Ou se já tem o starter local:

```bash
cp -R /caminho/para/agentic-starter/. ./
```

### 2. Rodar `bootstrap.sh` (substitui placeholders + detecta stack)

```bash
./bootstrap.sh
```

Modo interativo pergunta `PRODUCT_NAME`, `TEAM`, `DOMAIN`, `STACK` (auto-detecta).

Modo CI/script:

```bash
./bootstrap.sh --product "MeuApp" --team "Squad-X" --domain "fintech" --stack "next-ts"
```

Resultado: todos `<PLACEHOLDERS>` substituídos, `.starter-meta.json` criado, hooks executáveis.

### 3. Rodar Claude Code (ou Codex) com `INIT.md` (mapeamento profundo)

```bash
claude
```

Cole o prompt:

> "Le INIT.md e executa. Mapeia o codigo deste repo e preenche .specs/product/ + .specs/architecture/ com dados reais. Use multi-agents em paralelo."

O agente vai:
- Inspecionar pastas, models, dependências, integrações.
- Reescrever `VISION.md`, `DOMAIN.md`, `DESIGN.md`, `PATTERNS.md`, `BACKLOG.md` com **dados reais do código**.
- Atualizar `AGENTS.md`/`CLAUDE.md`/`copilot-instructions.md` com comandos reais (npm scripts, makefile, etc).
- Reportar o que ficou OK e o que precisa de input humano.

### 4. (opcional) Limpar arquivos do starter

```bash
rm _BOOTSTRAP.md INIT.md bootstrap.sh
git add -A && git commit -m "chore: remove starter bootstrap files"
```

---

## Ordem de leitura sugerida (humano)

1. `README.md` (este arquivo) — visão geral.
2. `AGENTS.md` — instrução mestre do agente.
3. `.specs/README.md` — mapa de navegação das specs.
4. `.specs/product/VISION.md` — produto.
5. `.specs/architecture/DESIGN.md` — arquitetura.
6. `.specs/workflow/WORKFLOW.md` — processo.
7. `.skills/README.md` — capacidades do agente.

---

## Quickstart para o agente AI

Ao abrir o repo recém-clonado, o agente deve:

1. Ler `AGENTS.md` (raiz). Esse é o contrato.
2. Ler `.specs/product/VISION.md` para entender o porquê.
3. Ler `.specs/architecture/DESIGN.md` e `PATTERNS.md` para entender como.
4. Pegar a próxima task em `.specs/sprints/sprint-XX/`.
5. Seguir o loop obrigatório: ler task -> planejar -> editar -> lint -> unit -> e2e -> corrigir -> commit.
6. Validar a Definition of Done antes de abrir PR.

---

## Estrutura de pastas

```
agentic-starter/
├── README.md                  # este arquivo
├── AGENTS.md                  # instrução mestre do agente
├── CLAUDE.md                  # cópia/symlink de AGENTS.md
├── .gitignore
├── .github/                   # CI, templates, custom agents Copilot
├── .specs/                    # toda documentação de produto/arquitetura/workflow
│   ├── product/               # VISION, DOMAIN, PERSONAS
│   ├── architecture/          # DESIGN, PATTERNS, ADRs
│   ├── workflow/              # WORKFLOW, CONTRIBUTING, RELEASE
│   └── sprints/               # BACKLOG + sprints
├── .skills/                   # skills reutilizáveis do agente
├── .claude/                   # config + hooks Claude Code
├── .codex/                    # config Codex
├── playwright.config.ts       # E2E padrão
└── presentation/              # slides do método (Marp)
```

---

## Filosofia

- **Specs como código.** O que não está escrito, o agente não vê.
- **Tasks atômicas.** Uma task = um PR pequeno e revisável.
- **Definition of Done automatizada.** O que não passa no gate, não merge.
- **Skills reutilizáveis.** Capacidade que vai virar padrão, vira `SKILL.md`.
- **Loop curto.** Editar, testar, corrigir, repetir. Nunca acumular dívida invisível.

---

## Licença

`<LICENSE_PLACEHOLDER>` (substitua por MIT, Apache-2.0, proprietária ou o que fizer sentido para o projeto).

---

## Próximos passos

- Adapte os placeholders.
- Preencha as specs com o contexto real do produto.
- Rode a primeira sprint usando o template em `.specs/sprints/sprint-01/`.
- Veja a apresentação em `presentation/ai-agent-specialist.pdf` para entender o método completo.
