import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Hook } from "./scenes/Hook";
import { PainTyping } from "./scenes/PainTyping";
import { PainList } from "./scenes/PainList";
import { Reveal } from "./scenes/Reveal";
import { Anatomy } from "./scenes/Anatomy";
import { SideBySide } from "./scenes/SideBySide";
import { Productivity } from "./scenes/Productivity";
import { MultiAgent } from "./scenes/MultiAgent";
import { CTA } from "./scenes/CTA";
import { SceneTransition } from "../components/SceneTransition";
import { WhyLangProvider, useWhyT } from "./LangContext";
import { Lang } from "./i18n";
import { theme } from "../theme";

const SCENES = [
  { Component: Hook, duration: 80 },
  { Component: PainTyping, duration: 200 },
  { Component: PainList, duration: 130 },
  { Component: Reveal, duration: 110 },
  { Component: Anatomy, duration: 240 },
  { Component: SideBySide, duration: 380 },
  { Component: Productivity, duration: 160 },
  { Component: MultiAgent, duration: 160 },
  { Component: CTA, duration: 130 },
] as const;

type Timed = {
  Component: React.FC;
  duration: number;
  from: number;
};

const TIMELINE: Timed[] = SCENES.reduce<Timed[]>((acc, s) => {
  const from = acc.length === 0 ? 0 : acc[acc.length - 1].from + acc[acc.length - 1].duration;
  acc.push({ Component: s.Component, duration: s.duration, from });
  return acc;
}, []);

export const WHY_TOTAL_DURATION = TIMELINE.reduce((sum, t) => sum + t.duration, 0);

export type WhyLlmProjectMapperProps = {
  language: Lang;
};

export const WhyLlmProjectMapper: React.FC<WhyLlmProjectMapperProps> = ({
  language,
}) => {
  return (
    <WhyLangProvider lang={language}>
      <AbsoluteFill style={{ background: theme.colors.bgFrom }}>
        {TIMELINE.map((t, i) => {
          const Comp = t.Component;
          return (
            <Sequence key={i} from={t.from} durationInFrames={t.duration}>
              <SceneTransition durationInFrames={t.duration}>
                <Comp />
              </SceneTransition>
            </Sequence>
          );
        })}
        <Audio src={staticFile("sfx/rock-bg.mp3")} volume={0.45} />
        <ProgressBar />
        <SceneLabel />
      </AbsoluteFill>
    </WhyLangProvider>
  );
};

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
  const t = useWhyT();
  const activeIndex = TIMELINE.findIndex(
    (s) => frame >= s.from && frame < s.from + s.duration,
  );
  const active = activeIndex === -1 ? 0 : activeIndex;
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
      <span>{String(TIMELINE.length).padStart(2, "0")}</span>
      <span style={{ margin: "0 12px", opacity: 0.4 }}>·</span>
      <span style={{ color: theme.colors.text }}>{t.sceneLabels[active]}</span>
    </div>
  );
};
