import { useState } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";

/**
 * The open part of check-in: one question, in the patient's own words. Every
 * further question is chosen from this answer, so nothing generic is asked.
 */
export function CaseTakingPage() {
  const { session, updateSession } = useKiosk();
  const [story, setStory] = useState(session?.answers["story"] ?? "");

  const record = (text: string) => {
    setStory(text);
    if (text.trim() && text.trim() !== session?.answers["story"]) {
      void patientKioskApi.saveAnswer("story", text.trim(), "voice");
    }
  };

  return (
    <KioskStepContainer step={stepNumber("case-taking")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.case.heading"
          as="h1"
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.case.support"
          as="p"
          className="mt-1 text-sm sm:text-base text-muted-foreground"
        />

        <div className="mt-3 sm:mt-4">
          <KioskVoiceAnswer questionKey="kiosk.case.q1" answer={story} onAnswer={record} />
        </div>

        <KioskStepNav
          stepId="case-taking"
          canContinue={Boolean(story.trim())}
          note="kiosk.voice.note"
          onContinue={() => {
            const trimmed = story.trim();
            if (trimmed && trimmed !== session?.answers["story"]) {
              void patientKioskApi.saveAnswer("story", trimmed, "voice");
            }
            updateSession({ answers: { ...(session?.answers ?? {}), story: trimmed } });
          }}
        />
      </div>
    </KioskStepContainer>
  );
}
