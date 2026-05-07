# INIT — Mapeamento automático do projeto

> Prompt pro Claude Code (ou Codex) executar **uma vez**, logo após `./bootstrap.sh`,
> pra preencher `.specs/` com dados reais do projeto.

---

## Missão

Você é o agente de inicialização. O usuário acabou de copiar o **Agentic Starter** dentro
de um projeto existente (ou novo). Os arquivos em `.specs/` estão com placeholders já
substituídos por `bootstrap.sh` (nome, time, domínio, stack), mas o **conteúdo** ainda é
template genérico.

Sua tarefa: **inspecionar o repositório atual e reescrever** os principais `.md` com
informação concreta extraída do código.

---

## Escopo (arquivos a preencher)

| Arquivo | Como preencher |
|---|---|
| `.specs/product/VISION.md` | Inferir do README existente, package.json description, comentários top-level. Se não houver, deixar perguntas pro humano. |
| `.specs/product/DOMAIN.md` | Listar entidades reais do código (models/entities/dtos), gerar Mermaid `erDiagram` com relações encontradas. |
| `.specs/product/PERSONAS.md` | Inferir de roles/permissions, rotas autenticadas, perfis de usuário no schema. |
| `.specs/architecture/DESIGN.md` | Mapear estrutura real: pastas top-level, frameworks usados, integrações (DB, cache, queue, APIs externas). Gerar Mermaid de boundaries. |
| `.specs/architecture/PATTERNS.md` | Extrair padrões reais: naming usado, estrutura de pastas, como endpoints/componentes/testes são criados hoje. |
| `.specs/sprints/BACKLOG.md` | Listar TODOs/FIXMEs encontrados no código + issues abertas (se `gh` disponível). |
| `AGENTS.md` / `CLAUDE.md` / `.github/copilot-instructions.md` | Atualizar seção `## Comandos importantes` com comandos reais (do package.json scripts, Makefile, etc). |

**Não tocar:**
- `.specs/architecture/ADR-*.md` (humano cria conforme decisões)
- `.specs/sprints/sprint-01/*` (deletar exemplo, criar `sprint-01/SPRINT.md` real depois)
- `.skills/*` (deixar templates)
- `.github/workflows/*` (humano adapta CI)
- `_BOOTSTRAP.md`, `INIT.md`, `bootstrap.sh` (apaga ao final, ver passo 5)

---

## Como executar (multi-agents paralelo)

### 1. Inspeção (1 agent)

Spawna `@inspector` (general-purpose):
- Lê `.starter-meta.json` pra saber stack
- Lista pastas top-level (`ls -la`, `find . -maxdepth 2 -type d`)
- Lê `package.json`/`*.csproj`/`pyproject.toml`/`go.mod`/etc pra dependências
- Lê `README.md` existente (se houver) — extrai descrição, badges, comandos
- Greps `TODO|FIXME|HACK` no código de produção
- Lista entidades/models por convenção da stack:
  - Node/TS: `**/models/**`, `**/entities/**`, `**/types/**`, `**/schemas/**`
  - .NET: `**/Models/**`, `**/Entities/**`, `**/DTOs/**`
  - Python: `**/models.py`, `**/schemas.py`, `**/entities/**`
  - Go: `**/models/**`, structs com tags `db:` ou `json:`
- Identifica integrações externas: imports de `axios`/`fetch`/`HttpClient`/`requests`,
  conn strings, env vars (`*_URL`, `*_KEY`)

Output: relatório markdown com seções **Stack real**, **Estrutura**, **Entidades**,
**Comandos úteis**, **Integrações**, **TODOs encontrados**.

### 2. Preenchimento paralelo (6 agents)

Após inspector terminar, spawna em **paralelo** (1 message, múltiplos Agent calls):

- `@vision-writer` → reescreve `VISION.md` baseado em README + package description
- `@domain-mapper` → reescreve `DOMAIN.md` com entidades reais + Mermaid erDiagram
- `@personas-writer` → reescreve `PERSONAS.md` com roles inferidos
- `@design-mapper` → reescreve `DESIGN.md` com Mermaid de boundaries reais
- `@patterns-extractor` → reescreve `PATTERNS.md` com padrões observados
- `@backlog-collector` → preenche `BACKLOG.md` com TODOs + issues GitHub (se `gh` ok)

### 3. Atualizar instruction files (sequencial — depende de tudo acima)

- `@instruction-updater` → atualiza `AGENTS.md`, `CLAUDE.md`, `copilot-instructions.md`:
  - Substitui seção `## Comandos importantes` por comandos reais
  - Adiciona links pros docs preenchidos
  - Adiciona seção `## Skills/Agents disponíveis` se houver skills custom no `.skills/`

### 4. Validação final

- Roda DoD checks análogos ao `_BOOTSTRAP.md`:
  - Todos arquivos do tree existem
  - Sem placeholders `<PRODUCT_NAME>`/`<STACK>`/etc remanescentes
  - Mermaid blocks válidos (gerar SVG via `mmdc` se disponível, ou só validar sintaxe)
  - Nenhum arquivo abaixo de 30 linhas significativas
- Reporta o que ficou OK e o que ficou pendente pro humano (ex: VISION sem README → "humano define problema")

### 5. Limpeza (opcional, ao final)

Pergunta ao humano:
> "Apagar `_BOOTSTRAP.md`, `INIT.md`, `bootstrap.sh` agora? (s/N)"

Se `s`: `rm _BOOTSTRAP.md INIT.md bootstrap.sh` + commit `chore: remove starter bootstrap files`.

---

## Regras

- **pt-BR** no conteúdo gerado
- **inglês** em código, identificadores, commits
- **Não inventar** — se não conseguir extrair do código, deixa **TODO: humano preencher** explícito
- **Concreto > genérico** — exemplos com nomes reais do projeto, não placeholders
- **Sem emojis** no código fonte
- **Mermaid válido** — IDs sem acento, labels entre aspas se contiverem espaço
- **Paralelo agressivo** — qualquer trabalho independente vai em mesmo message com múltiplos `Agent` calls

---

## Output final esperado

Resumo de 1 parágrafo:
- Quantos arquivos foram reescritos
- Quais entidades foram detectadas (top 5)
- Comandos identificados
- O que ficou como TODO pro humano
- Próxima ação sugerida (criar sprint-02, primeira ADR, etc)

---

**Boa execução, time. Esse INIT.md é descartável após rodar 1x.**
