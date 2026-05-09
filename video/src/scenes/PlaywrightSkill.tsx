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
import { CodeBlock, c } from "../components/CodeBlock";
import { theme } from "../theme";

export const PlaywrightSkill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const evidenceP = spring({
    frame: frame - 70,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <AbsoluteFill>
      <BackgroundFX variant="cyan" />
      <AbsoluteFill style={{ padding: "80px 100px", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 22,
              background: `linear-gradient(135deg, ${theme.colors.accent2}, #0ea5e9)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              boxShadow: `0 16px 40px ${theme.colors.accent2}66`,
            }}
          >
            🎭
          </div>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: 22,
                color: theme.colors.accent2,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              03 · Skill #1
            </div>
            <AnimatedText text="playwright-e2e" size={70} align="left" font="mono" gradient />
          </div>
        </div>

        <div style={{ display: "flex", gap: 28, flex: 1 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <Box delay={20} title="Trigger" color={theme.colors.accent2}>
              Ativa em <b>TODA task técnica</b> — feature, fix, refactor — antes do commit. Smoke test mínimo se a task não tem UI.
            </Box>
            <Box delay={36} title="Hard rule" color={theme.colors.red}>
              Sem evidência completa <b>não tem merge</b>: trace + screenshot + video em
              <code style={{ color: theme.colors.accent2 }}> playwright-report/</code>.
            </Box>
            <Box delay={52} title="Padrões-chave" color={theme.colors.accent3}>
              <span style={{ color: theme.colors.green }}>✓</span> getByRole / getByLabel / getByTestId
              <br />
              <span style={{ color: theme.colors.red }}>✗</span> waitForTimeout / mock pra fazer passar
            </Box>
          </div>

          <div style={{ flex: 1.1 }}>
            <CodeBlock
              delay={28}
              title="tests/e2e/login.spec.ts"
              fontSize={19}
              highlight={[6, 10]}
              lines={[
                [
                  { text: "import", color: c.keyword },
                  { text: " { test, expect } " },
                  { text: "from", color: c.keyword },
                  { text: " " },
                  { text: "'@playwright/test'", color: c.string },
                  { text: ";" },
                ],
                "",
                [
                  { text: "test", color: c.fn },
                  { text: ".describe(" },
                  { text: "'Login flow'", color: c.string },
                  { text: ", () => {" },
                ],
                [
                  { text: "  test(" },
                  { text: "'logs in with valid creds'", color: c.string },
                  { text: ", " },
                  { text: "async", color: c.keyword },
                  { text: " ({ page }) => {" },
                ],
                [
                  { text: "    " },
                  { text: "await", color: c.keyword },
                  { text: " page.goto(" },
                  { text: "'/login'", color: c.string },
                  { text: ");" },
                ],
                [
                  { text: "    " },
                  { text: "await", color: c.keyword },
                  { text: " page.getByLabel(" },
                  { text: "'Email'", color: c.string },
                  { text: ").fill(" },
                  { text: "'me@x.io'", color: c.string },
                  { text: ");" },
                ],
                [
                  { text: "    " },
                  { text: "await", color: c.keyword },
                  { text: " page.getByRole(" },
                  { text: "'button'", color: c.string },
                  { text: ", { name: " },
                  { text: "'Sign in'", color: c.string },
                  { text: " }).click();" },
                ],
                "",
                [
                  { text: "    " },
                  { text: "// estado final (auto-retry)", color: c.comment },
                ],
                [
                  { text: "    " },
                  { text: "await", color: c.keyword },
                  { text: " " },
                  { text: "expect", color: c.fn },
                  { text: "(page).toHaveURL(/" },
                  { text: "\\/dashboard$", color: c.string },
                  { text: "/);" },
                ],
                [
                  { text: "    " },
                  { text: "await", color: c.keyword },
                  { text: " " },
                  { text: "expect", color: c.fn },
                  { text: "(page.getByRole(" },
                  { text: "'heading'", color: c.string },
                  { text: ")).toBeVisible();" },
                ],
                "  });",
                "});",
              ]}
            />
          </div>
        </div>

        {/* Evidence row */}
        <div
          style={{
            display: "flex",
            gap: 18,
            opacity: evidenceP,
            transform: `translateY(${interpolate(evidenceP, [0, 1], [30, 0])}px)`,
          }}
        >
          {[
            { icon: "🎬", label: "trace.zip" },
            { icon: "📸", label: "screenshot.png" },
            { icon: "🎥", label: "video.webm" },
            { icon: "📊", label: "report HTML" },
          ].map((e, i) => (
            <div
              key={e.label}
              style={{
                flex: 1,
                padding: "14px 20px",
                background: "rgba(34, 211, 238, 0.10)",
                border: "1px solid rgba(34, 211, 238, 0.35)",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: spring({
                  frame: frame - 70 - i * 5,
                  fps,
                  config: { damping: 16, stiffness: 130 },
                }),
              }}
            >
              <div style={{ fontSize: 32 }}>{e.icon}</div>
              <div
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: 18,
                  color: theme.colors.text,
                }}
              >
                {e.label}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Box: React.FC<{
  delay: number;
  title: string;
  color: string;
  children: React.ReactNode;
}> = ({ delay, title, color, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  return (
    <div
      style={{
        padding: "18px 22px",
        borderRadius: 16,
        background: `${color}15`,
        border: `1px solid ${color}55`,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
      }}
    >
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: 22,
          fontWeight: 700,
          color,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: theme.fonts.heading,
          fontSize: 22,
          color: theme.colors.text,
          lineHeight: 1.5,
        }}
      >
        {children}
      </div>
    </div>
  );
};
