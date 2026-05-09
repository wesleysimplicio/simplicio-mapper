import React from "react";
import { Composition } from "remotion";
import { SkillsTutorial, TOTAL_DURATION } from "./SkillsTutorial";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SkillsTutorialPT"
        component={SkillsTutorial}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ language: "pt" as const }}
      />
      <Composition
        id="SkillsTutorialEN"
        component={SkillsTutorial}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ language: "en" as const }}
      />
    </>
  );
};
