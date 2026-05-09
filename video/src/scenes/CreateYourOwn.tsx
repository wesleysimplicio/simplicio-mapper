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
import { Terminal } from "../components/Terminal";
import { CodeBlock, c } from "../components/CodeBlock";
import { theme } from "../theme";

export const CreateYourOwn: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <BackgroundFX variant="dark" />
      <AbsoluteFill style={{ padding: "80px 100px", flexDirection: "column", gap: 28 }}>
        <div>
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: 22,
              color: theme.colors.yellow,
              letterSpacing: 4,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            06 — Skill #3
          </div>
          <AnimatedText text="Crie a sua própria skill com _template" size={62} align="left" gradient />
        </div>

        <div style={{ display: "flex", gap: 28, flex: 1, alignItems: "stretch" }}>
          <div style={{ flex: 1.1, display: "flex", flexDirection: "column", gap: 18 }}>
            <Step num={1} delay={20} title="Copie o template">
              <code style={{ color: theme.colors.accent2, fontFamily: theme.fonts.mono }}>
                cp -R .skills/_template .skills/&lt;sua-skill&gt;
              </code>
            </Step>
            <Step num={2} delay={36} title="Preencha o frontmatter">
              <span style={{ color: theme.colors.text }}>name</span> +{" "}
              <span style={{ color: theme.colors.accent3 }}>description</span> (a parte mais
              importante: é o que dispara o trigger implícito).
            </Step>
            <Step num={3} delay={52} title="Escreva 4 sections">
              <b>Trigger</b> · <b>Steps</b> · <b>Padrões</b> · <b>Definition of Done</b>
            </Step>
            <Step num={4} delay={68} title="Referencie no README">
              Adicione a linha em <code style={{ color: theme.colors.accent2 }}>.skills/README.md</code>.
            </Step>
          </div>

          <div style={{ flex: 1.1 }}>
            <Terminal
              delay={26}
              width="100%"
              title="bash — criando skill nova"
              charsPerFrame={2.6}
              lines={[
                { type: "prompt", text: "cp -R .skills/_template .skills/db-migration" },
                { type: "ok", text: "skill esqueleto criada" },
                { type: "prompt", text: "$EDITOR .skills/db-migration/SKILL.md" },
                { type: "out", text: "# editando frontmatter + sections..." },
                { type: "prompt", text: "git add .skills/db-migration/" },
                { type: "prompt", text: 'git commit -m "feat(skills): add db-migration"' },
                { type: "ok", text: "skill pronta — agente já pode invocar" },
              ]}
            />
          </div>
        </div>

        <div
          style={{
            opacity: spring({ frame: frame - 90, fps, config: { damping: 14, stiffness: 100 } }),
            transform: `translateY(${interpolate(
              spring({ frame: frame - 90, fps, config: { damping: 14, stiffness: 100 } }),
              [0, 1],
              [30, 0],
            )}px)`,
          }}
        >
          <CodeBlock
            delay={90}
            title="SKILL.md (frontmatter mínimo)"
            fontSize={22}
            width="100%"
            lines={[
              [{ text: "---", color: c.comment }],
              [
                { text: "name", color: c.keyword },
                { text: ": " },
                { text: "db-migration", color: c.string },
              ],
              [
                { text: "description", color: c.keyword },
                { text: ": " },
                {
                  text: "criar migrations reversíveis com naming consistente",
                  color: c.string,
                },
              ],
              [{ text: "---", color: c.comment }],
            ]}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Step: React.FC<{
  num: number;
  delay: number;
  title: string;
  children: React.ReactNode;
}> = ({ num, delay, title, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 } });
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          flexShrink: 0,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${theme.colors.yellow}, #f59e0b)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: theme.fonts.heading,
          fontSize: 28,
          fontWeight: 900,
          color: "#1f1300",
          boxShadow: `0 10px 24px ${theme.colors.yellow}55`,
        }}
      >
        {num}
      </div>
      <div>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: 24,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: 20,
            color: theme.colors.textMuted,
            marginTop: 4,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
