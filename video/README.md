# Skills Tutorial — Vídeo Remotion

Vídeo explicativo (1080p · 30fps · ~59s) sobre **como usar as skills** do `agentic-starter`. Construído com [Remotion](https://www.remotion.dev/) — vídeo programático em React.

[![Skills Tutorial — capa](./assets/cover.png)](./assets/skills-tutorial.mp4)

> 🎬 **Assistir:** [`assets/skills-tutorial.mp4`](./assets/skills-tutorial.mp4) (19 MB · 59 s · 1080p · H.264)

<details>
<summary>Player embarcado (clique para expandir)</summary>

<video src="./assets/skills-tutorial.mp4" controls width="100%"></video>

</details>

---

## Índice das cenas

| #  | Cena                  | Duração | Conteúdo                                                       |
|----|-----------------------|---------|----------------------------------------------------------------|
| 01 | `Intro`               | 5,0 s   | Logo orbital, título e badges das ferramentas suportadas       |
| 02 | `WhatAreSkills`       | 6,0 s   | Definição de skill + anatomia do `SKILL.md`                    |
| 03 | `Catalog`             | 6,0 s   | As 3 skills inclusas no starter                                |
| 04 | `PlaywrightSkill`     | 8,0 s   | Trigger, hard rule de evidência, código de exemplo             |
| 05 | `CommitsSkill`        | 8,0 s   | Anatomia da mensagem, tipos, breaking change                   |
| 06 | `HowToInvoke`         | 7,0 s   | Trigger explícito vs. implícito (com terminais animados)       |
| 07 | `CreateYourOwn`       | 7,0 s   | Passo-a-passo para criar uma skill nova com `_template`        |
| 08 | `BestPractices`       | 6,0 s   | 6 dicas + lista do que **não** virar skill                     |
| 09 | `Outro`               | 6,0 s   | Recap em pílulas + CTA                                         |

Total: **59 s** (1.770 frames). A capa estática (`npm run still`) é renderizada do frame **110** — momento em que o título e o subtítulo já estão totalmente visíveis.

---

## Galeria — todas as cenas em imagens

Cada PNG abaixo é o frame **estabilizado** da cena (capturado por `npm run regression`, mesmas imagens versionadas em [`evidence/`](./evidence)). Útil pra revisar o conteúdo sem rodar o vídeo.

### 01 · Intro
![01 Intro](./evidence/01-intro-frame-130.png)

### 02 · O que é uma skill?
![02 What are Skills](./evidence/02-what-are-skills-frame-310.png)

### 03 · Catálogo
![03 Catalog](./evidence/03-catalog-frame-490.png)

### 04 · Skill `playwright-e2e`
![04 Playwright skill](./evidence/04-playwright-frame-730.png)

### 05 · Skill `conventional-commits`
![05 Conventional commits skill](./evidence/05-commits-frame-970.png)

### 06 · Como invocar uma skill
![06 How to invoke](./evidence/06-how-to-invoke-frame-1180.png)

### 07 · Crie a sua a partir do `_template`
![07 Create your own](./evidence/07-create-your-own-frame-1390.png)

### 08 · Boas práticas
![08 Best practices](./evidence/08-best-practices-frame-1570.png)

### 09 · Outro
![09 Outro](./evidence/09-outro-frame-1750.png)

---

## Comandos

```bash
# Studio interativo (preview com hot reload em http://localhost:3000)
npm start

# Render final em MP4 (1920x1080)
npm run build

# Versão WebM
npm run build:webm

# Capa estática (PNG do frame 110)
npm run still

# Teste de regressão visual: 9 stills (1 por cena, frame estabilizado)
npm run regression
```

Saída em `assets/skills-tutorial.mp4` (versionado) — `out/` fica para drafts locais.

---

## Regressão visual

`npm run regression` faz **bundle único + render de 9 stills** (~7 segundos no total) — um para cada cena, no frame em que todas as animações de entrada já estabilizaram. As evidências ficam em `evidence/<NN>-<scene>-frame-<F>.png` e estão versionadas (~13 MB total) como prova-de-vida do pipeline.

| # | Cena | Frame settled | Verifica |
|---|---|---|---|
| 01 | Intro | 130 | logo orbital, título, badges |
| 02 | WhatAreSkills | 310 | card definição + paper SKILL.md + pills |
| 03 | Catalog | 490 | 3 cards (playwright/commits/_template) |
| 04 | PlaywrightSkill | 730 | code block + evidence row |
| 05 | CommitsSkill | 970 | anatomia, 10 chips, breaking change |
| 06 | HowToInvoke | 1180 | 2 terminais com typing completo |
| 07 | CreateYourOwn | 1390 | 4 steps + terminal + frontmatter |
| 08 | BestPractices | 1570 | 6 cards + warning box |
| 09 | Outro | 1750 | recap pills + CTA |

O script falha (exit 1) se qualquer PNG ficar abaixo de 30 KB (sinal de cena em branco). Revisão visual humana ainda é necessária para alterações que mudem layout/cor.

---

## Estrutura

```
video/
├── src/
│   ├── index.ts              # entry point (registerRoot)
│   ├── Root.tsx              # registra a Composition
│   ├── SkillsTutorial.tsx    # sequência das cenas + progress bar + label
│   ├── theme.ts              # paleta + fontes
│   ├── components/
│   │   ├── AnimatedText.tsx  # texto com reveal por caractere
│   │   ├── BackgroundFX.tsx  # gradiente + grid + orbs + partículas
│   │   ├── Bullet.tsx        # item de lista com ícone
│   │   ├── Card.tsx          # cartão glassmorphism animado
│   │   ├── CodeBlock.tsx     # bloco de código com tokens coloridos
│   │   ├── SceneTransition.tsx  # fade-in/out + scale entre cenas
│   │   └── Terminal.tsx      # mock de terminal com typing effect
│   └── scenes/
│       ├── Intro.tsx
│       ├── WhatAreSkills.tsx
│       ├── Catalog.tsx
│       ├── PlaywrightSkill.tsx
│       ├── CommitsSkill.tsx
│       ├── HowToInvoke.tsx
│       ├── CreateYourOwn.tsx
│       ├── BestPractices.tsx
│       └── Outro.tsx
├── package.json
├── remotion.config.ts
└── tsconfig.json
```

---

## Como editar

- **Texto / cor** → ajuste em `src/theme.ts` ou direto no JSX da cena.
- **Duração** → array `SCENES` em `src/SkillsTutorial.tsx` (em frames; 30fps).
- **Nova cena** → crie `src/scenes/MinhaCena.tsx`, importe em `SkillsTutorial.tsx` e adicione no array.

> Roda `npm start` e edita ao vivo: o studio re-renderiza a cada save.

---

## Notas

- Primeira execução baixa o **Chrome Headless Shell** (~88 MB) — só uma vez.
- Render usa `@remotion/compositor-linux-x64-gnu` (ffmpeg + libavcodec inclusos no pacote).
- Sem dependências de mídia externa: todo o vídeo é gerado por código (CSS/SVG/animações).
