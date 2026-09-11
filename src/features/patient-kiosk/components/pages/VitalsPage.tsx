import { useState } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
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

  const cards: KioskSubStep[] = [
    {
      id: "height",
      content: (
        <KioskNumberPad
          labelKey="kiosk.vitals.height"
          value={height}
          maxLength={3}
          onChange={setHeight}
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
          onChange={setWeight}
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
          onChange={setPulse}
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
          onChange={setTemperature}
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
            onFinish={() => updateSession({ vitals: { height, weight, pulse, temperature } })}
          />
        </div>
      </div>
    </KioskStepContainer>
  );
}
