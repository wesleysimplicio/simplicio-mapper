import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BackgroundFX } from "../components/BackgroundFX";
import { AnimatedText } from "../components/AnimatedText";
import { theme } from "../theme";

const SKILLS = [
  {
    icon: "🎭",
    name: "playwright-e2e",
    desc: "Testes end-to-end com trace, screenshot e vídeo",
    color: theme.colors.accent2,
  },
  {
    icon: "📝",
    name: "conventional-commits",
    desc: "Mensagens de commit padronizadas (SemVer-friendly)",
    color: theme.colors.accent3,
  },
  {
    icon: "📋",
    name: "_template",
    desc: "Base para criar suas próprias skills",
    color: theme.colors.yellow,
  },
];

export const Catalog: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <BackgroundFX variant="dark" />
      <AbsoluteFill style={{ padding: "100px 120px", flexDirection: "column", gap: 40 }}>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 22,
              color: theme.colors.accent3,
              letterSpacing: 4,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            02 — Catálogo
          </div>
          <AnimatedText text="Skills inclusas no starter" size={84} align="left" gradient />
        </div>

        <div style={{ display: "flex", gap: 28, flex: 1, alignItems: "stretch" }}>
          {SKILLS.map((s, i) => {
            const p = spring({
              frame: frame - 22 - i * 10,
              fps,
              config: { damping: 14, stiffness: 100 },
            });
            return (
              <div
                key={s.name}
                style={{
                  flex: 1,
                  padding: 32,
                  borderRadius: 24,
                  background: `linear-gradient(160deg, ${s.color}25 0%, rgba(255,255,255,0.02) 100%)`,
                  border: `1px solid ${s.color}55`,
                  backdropFilter: "blur(12px)",
                  boxShadow: `0 24px 60px ${s.color}33`,
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [60, 0])}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 20,
                    background: `linear-gradient(135deg, ${s.color}, ${s.color}88)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 46,
                    boxShadow: `0 12px 30px ${s.color}66`,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: 30,
                    fontWeight: 700,
                    color: theme.colors.text,
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontSize: 22,
                    color: theme.colors.textMuted,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {s.desc}
                </div>
                <div
                  style={{
                    paddingTop: 16,
                    borderTop: `1px solid ${s.color}33`,
                    fontFamily: theme.fonts.mono,
                    fontSize: 16,
                    color: s.color,
                  }}
                >
                  .skills/{s.name}/SKILL.md
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: spring({ frame: frame - 70, fps, config: { damping: 15, stiffness: 100 } }),
            transform: `translateY(${interpolate(
              spring({ frame: frame - 70, fps, config: { damping: 15, stiffness: 100 } }),
              [0, 1],
              [30, 0],
            )}px)`,
            fontFamily: theme.fonts.heading,
            fontSize: 24,
            color: theme.colors.textMuted,
            textAlign: "center",
          }}
        >
          📂 Skills <b style={{ color: theme.colors.text }}>locais</b> ficam em{" "}
          <code style={{ color: theme.colors.accent2 }}>.skills/</code>{" "}
          · skills <b style={{ color: theme.colors.text }}>globais</b> em{" "}
          <code style={{ color: theme.colors.accent2 }}>~/.claude/skills/</code>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
