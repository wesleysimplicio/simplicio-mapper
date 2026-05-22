# Third-party skills — NOTICE

The following skill directories under `.skills/` are vendored verbatim from
the upstream HyperFrames project and are distributed under the Apache
License, Version 2.0:

- `hyperframes/`
- `hyperframes-cli/`
- `hyperframes-media/`
- `hyperframes-registry/`
- `gsap/`
- `animejs/`
- `css-animations/`
- `lottie/`
- `three/`
- `waapi/`
- `tailwind/`
- `typegpu/`
- `contribute-catalog/`
- `remotion-to-hyperframes/`
- `website-to-hyperframes/`

Upstream source: https://github.com/wesleysimplicio/hyperframes

License text: see `.skills/UPSTREAM-LICENSE` (Apache 2.0).

Modifications: none. Files are copied as-is from `skills/<name>/SKILL.md`
in the upstream repository at the time of import. To refresh, run:

```bash
for s in hyperframes hyperframes-cli hyperframes-media hyperframes-registry \
         gsap animejs css-animations lottie three waapi tailwind typegpu \
         contribute-catalog remotion-to-hyperframes website-to-hyperframes; do
  curl -sSf \
    "https://raw.githubusercontent.com/wesleysimplicio/hyperframes/main/skills/${s}/SKILL.md" \
    -o ".skills/${s}/SKILL.md"
done
```

Local skills (`_template/`, `caveman/`, `ralph-loop/`, `everything-claude-code/`,
`playwright-e2e/`, `conventional-commits/`, `rtk-cli/`) are project-original
and not covered by this notice.
