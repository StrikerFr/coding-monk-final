import { useEffect, useState } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskNumberPad } from "../KioskNumberPad";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskSubSteps, type KioskSubStep } from "../KioskSubSteps";
import { KioskText } from "../KioskText";

/**
 * Measurements are entered by staff, one at a time. The step can be skipped so
 * nobody is blocked by equipment that is not at hand.
 */
export function VitalsPage() {
  const { session, updateSession } = useKiosk();
  const [height, setHeight] = useState(session?.vitals["height"] ?? "");
  const [weight, setWeight] = useState(session?.vitals["weight"] ?? "");
  const [pulse, setPulse] = useState(session?.vitals["pulse"] ?? "");
  const [temperature, setTemperature] = useState(session?.vitals["temperature"] ?? "");

  // Rehydrate vitals from stored answers if empty in session (e.g. reload or back navigation)
  useEffect(() => {
    void patientKioskApi.listStoredAnswers().then((rows) => {
      for (const row of rows) {
        if (row.transcript.trim()) {
          if (row.questionId === "height") setHeight((h) => h || row.transcript);
          if (row.questionId === "weight") setWeight((w) => w || row.transcript);
          if (row.questionId === "pulse") setPulse((p) => p || row.transcript);
          if (row.questionId === "temperature") setTemperature((t) => t || row.transcript);
        }
      }
    });
  }, []);

  const updateVital = (key: "height" | "weight" | "pulse" | "temperature", val: string) => {
    if (key === "height") setHeight(val);
    if (key === "weight") setWeight(val);
    if (key === "pulse") setPulse(val);
    if (key === "temperature") setTemperature(val);

    const trimmed = val.trim();
    updateSession({
      vitals: {
        ...(session?.vitals ?? {}),
        [key]: trimmed,
      },
    });

    if (trimmed) {
      void patientKioskApi.saveAnswer(key, trimmed, "typed");
    }
  };

  const syncAll = async () => {
    const patch: Record<string, string> = {};
    if (height.trim()) patch["height"] = height.trim();
    if (weight.trim()) patch["weight"] = weight.trim();
    if (pulse.trim()) patch["pulse"] = pulse.trim();
    if (temperature.trim()) patch["temperature"] = temperature.trim();

    updateSession({ vitals: { ...(session?.vitals ?? {}), ...patch } });
    await Promise.all(
      Object.entries(patch).map(([k, v]) => patientKioskApi.saveAnswer(k, v, "typed")),
    );
  };

  const cards: KioskSubStep[] = [
    {
      id: "height",
      content: (
        <KioskNumberPad
          labelKey="kiosk.vitals.height"
          value={height}
          maxLength={3}
          onChange={(val) => updateVital("height", val)}
        />
      ),
    },
    {
      id: "weight",
      content: (
        <KioskNumberPad
          labelKey="kiosk.vitals.weight"
          value={weight}
          maxLength={3}
          onChange={(val) => updateVital("weight", val)}
          allowDecimal
        />
      ),
    },
    {
      id: "pulse",
      content: (
        <KioskNumberPad
          labelKey="kiosk.vitals.pulse"
          value={pulse}
          maxLength={3}
          onChange={(val) => updateVital("pulse", val)}
        />
      ),
    },
    {
      id: "temperature",
      content: (
        <KioskNumberPad
          labelKey="kiosk.vitals.temperature"
          value={temperature}
          maxLength={4}
          onChange={(val) => updateVital("temperature", val)}
          allowDecimal
        />
      ),
    },
  ];

  return (
    <KioskStepContainer step={stepNumber("vitals")}>
      <div className="mx-auto max-w-2xl">
        <KioskText
          tkey="kiosk.vitals.heading"
          as="h1"
          className="text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.vitals.support"
          as="p"
          className="mt-4 text-lg text-muted-foreground"
        />
        <KioskText
          tkey="kiosk.vitals.note"
          as="p"
          className="mt-4 text-base text-muted-foreground"
        />

        <div className="mt-8">
          <KioskSubSteps
            stepId="vitals"
            items={cards}
            showSkip
            onFinish={syncAll}
            onSkip={syncAll}
          />
        </div>
      </div>
    </KioskStepContainer>
  );
}
