import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Intro } from "./scenes/Intro";
import { WhatAreSkills } from "./scenes/WhatAreSkills";
import { Catalog } from "./scenes/Catalog";
import { PlaywrightSkill } from "./scenes/PlaywrightSkill";
import { CommitsSkill } from "./scenes/CommitsSkill";
import { HowToInvoke } from "./scenes/HowToInvoke";
import { CreateYourOwn } from "./scenes/CreateYourOwn";
import { BestPractices } from "./scenes/BestPractices";
import { Outro } from "./scenes/Outro";
import { SceneTransition } from "./components/SceneTransition";
import { theme } from "./theme";

const SCENES = [
  { Component: Intro, duration: 150 },
  { Component: WhatAreSkills, duration: 180 },
  { Component: Catalog, duration: 180 },
  { Component: PlaywrightSkill, duration: 240 },
  { Component: CommitsSkill, duration: 240 },
  { Component: HowToInvoke, duration: 210 },
  { Component: CreateYourOwn, duration: 210 },
  { Component: BestPractices, duration: 180 },
  { Component: Outro, duration: 180 },
];

export const TOTAL_DURATION = SCENES.reduce((sum, s) => sum + s.duration, 0);

export const SkillsTutorial: React.FC = () => {
  let cursor = 0;

  return (
    <AbsoluteFill style={{ background: theme.colors.bgFrom }}>
      {SCENES.map((s, i) => {
        const from = cursor;
        cursor += s.duration;
        const Comp = s.Component;
        return (
          <Sequence key={i} from={from} durationInFrames={s.duration}>
            <SceneTransition durationInFrames={s.duration}>
              <Comp />
            </SceneTransition>
          </Sequence>
        );
      })}
      <ProgressBar />
      <SceneLabel />
    </AbsoluteFill>
  );
};

const SCENE_LABELS = [
  "Intro",
  "Conceito",
  "Catálogo",
  "playwright-e2e",
  "conventional-commits",
  "Como invocar",
  "Crie a sua",
  "Boas práticas",
  "Encerramento",
];

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(1, frame / durationInFrames);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 4,
        width: `${progress * 100}%`,
        background: `linear-gradient(90deg, ${theme.colors.accent2}, ${theme.colors.accent3}, ${theme.colors.accent})`,
        boxShadow: `0 0 18px ${theme.colors.accent2}`,
      }}
    />
  );
};

const SceneLabel: React.FC = () => {
  const frame = useCurrentFrame();
  let cursor = 0;
  let active = 0;
  for (let i = 0; i < SCENES.length; i++) {
    if (frame >= cursor && frame < cursor + SCENES[i].duration) {
      active = i;
      break;
    }
    cursor += SCENES[i].duration;
  }
  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        right: 40,
        padding: "8px 16px",
        borderRadius: 999,
        background: "rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(10px)",
        fontFamily: theme.fonts.mono,
        fontSize: 14,
        color: theme.colors.textMuted,
        letterSpacing: 2,
      }}
    >
      <span style={{ color: theme.colors.accent2 }}>
        {String(active + 1).padStart(2, "0")}
      </span>
      <span style={{ margin: "0 8px", opacity: 0.4 }}>/</span>
      <span>{String(SCENES.length).padStart(2, "0")}</span>
      <span style={{ margin: "0 12px", opacity: 0.4 }}>·</span>
      <span style={{ color: theme.colors.text }}>{SCENE_LABELS[active]}</span>
    </div>
  );
};
