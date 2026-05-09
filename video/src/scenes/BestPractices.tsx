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

const TIPS = [
  { icon: "📏", title: "Concisão", text: "30-100 linhas. Acima vira doc — move pra .specs/." },
  { icon: "♻️", title: "Idempotente", text: "Rodar duas vezes = mesmo efeito. Não acumula estado." },
  { icon: "🎯", title: "Single-responsibility", text: "Uma skill, uma responsabilidade. Vontade de juntar? Divida." },
  { icon: "✍️", title: "Linguagem direta", text: "Verbo no imperativo. Sem floreio, sem rodeio." },
  { icon: "✅", title: "DoD verificável", text: "Checklist booleano no fim — true/false, nunca subjetivo." },
  { icon: "💡", title: "Exemplos concretos", text: "Code blocks com a stack real. Sem pseudocódigo." },
];

export const BestPractices: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <BackgroundFX variant="purple" />
      <AbsoluteFill style={{ padding: "80px 100px", flexDirection: "column", gap: 32 }}>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 22,
              color: theme.colors.green,
              letterSpacing: 4,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            07 — Boas práticas
          </div>
          <AnimatedText text="Skills que envelhecem bem" size={78} align="left" gradient />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 22,
            flex: 1,
          }}
        >
          {TIPS.map((t, i) => {
            const p = spring({
              frame: frame - 25 - i * 7,
              fps,
              config: { damping: 14, stiffness: 110 },
            });
            return (
              <div
                key={t.title}
                style={{
                  padding: 28,
                  borderRadius: 22,
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(10px)",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.94, 1])})`,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 50 }}>{t.icon}</div>
                <div
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontSize: 28,
                    fontWeight: 800,
                    color: theme.colors.text,
                  }}
                >
                  {t.title}
                </div>
                <div
                  style={{
                    fontFamily: theme.fonts.heading,
                    fontSize: 19,
                    color: theme.colors.textMuted,
                    lineHeight: 1.4,
                  }}
                >
                  {t.text}
                </div>
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: spring({ frame: frame - 90, fps, config: { damping: 14, stiffness: 100 } }),
            transform: `translateY(${interpolate(
              spring({ frame: frame - 90, fps, config: { damping: 14, stiffness: 100 } }),
              [0, 1],
              [30, 0],
            )}px)`,
            padding: "24px 32px",
            borderRadius: 18,
            background: `${theme.colors.red}15`,
            border: `1px solid ${theme.colors.red}55`,
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ fontSize: 44 }}>🚫</div>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: 22,
                fontWeight: 700,
                color: theme.colors.red,
                marginBottom: 4,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Não crie skill para
            </div>
            <div
              style={{
                fontFamily: theme.fonts.heading,
                fontSize: 22,
                color: theme.colors.text,
                lineHeight: 1.4,
              }}
            >
              algo que aparece <b>uma única vez</b> · convenção <b>universal</b> (vai pra global) ·
              conhecimento <b>genérico de stack</b>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
