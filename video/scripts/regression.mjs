#!/usr/bin/env node
// Regression test: bundle once, render 9 stills (one per scene at settled frame)
// + capa, com tempo total e validação básica.

import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { performance } from "node:perf_hooks";

const ROOT = path.resolve(import.meta.dirname, "..");
const ENTRY = path.join(ROOT, "src", "index.ts");
const OUT = path.join(ROOT, "evidence");

// Frames de "estado settled": final da cena - 20 (antes do fade-out começar).
// Cada cena tem entradas escalonadas; capturar perto do fim garante que TODOS os
// elementos animados estão visíveis e estabilizados.
const FRAMES = [
  { id: "01-intro", frame: 130, scene: "Intro (0-149)" },
  { id: "02-what-are-skills", frame: 310, scene: "WhatAreSkills (150-329)" },
  { id: "03-catalog", frame: 490, scene: "Catalog (330-509)" },
  { id: "04-playwright", frame: 730, scene: "PlaywrightSkill (510-749)" },
  { id: "05-commits", frame: 970, scene: "CommitsSkill (750-989)" },
  { id: "06-how-to-invoke", frame: 1180, scene: "HowToInvoke (990-1199)" },
  { id: "07-create-your-own", frame: 1390, scene: "CreateYourOwn (1200-1409)" },
  { id: "08-best-practices", frame: 1570, scene: "BestPractices (1410-1589)" },
  { id: "09-outro", frame: 1750, scene: "Outro (1590-1769)" },
];

const main = async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const tBundle = performance.now();
  console.log("Bundling…");
  const serveUrl = await bundle({
    entryPoint: ENTRY,
    onProgress: () => {},
    webpackOverride: (c) => c,
  });
  console.log(`  bundle ok in ${((performance.now() - tBundle) / 1000).toFixed(1)}s`);

  const composition = await selectComposition({
    serveUrl,
    id: "SkillsTutorial",
  });

  const results = [];
  for (const f of FRAMES) {
    const outFile = path.join(OUT, `${f.id}-frame-${f.frame}.png`);
    const t0 = performance.now();
    await renderStill({
      composition,
      serveUrl,
      output: outFile,
      frame: f.frame,
      imageFormat: "png",
    });
    const dt = ((performance.now() - t0) / 1000).toFixed(1);
    const stat = fs.statSync(outFile);
    const sizeKB = (stat.size / 1024).toFixed(0);
    const ok = stat.size > 30_000;
    const mark = ok ? "OK" : "TINY";
    console.log(
      `[${mark}] ${f.id.padEnd(22)} frame=${String(f.frame).padStart(4)} ` +
        `${sizeKB.padStart(5)} KB  (${dt}s)  -> ${path.relative(ROOT, outFile)}`,
    );
    results.push({ ...f, sizeKB: Number(sizeKB), file: outFile, ok });
  }

  const failed = results.filter((r) => !r.ok);
  console.log("");
  console.log(`Total: ${results.length} stills · failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log("FAILED:", failed.map((r) => r.id).join(", "));
    process.exit(1);
  }
  console.log("All stills rendered with reasonable size. Visual review still required.");
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
