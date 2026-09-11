import { Mic, PenLine, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { stepNumber } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";

const STEPS: Array<{ icon: LucideIcon; title: KioskTranslationKey; body: KioskTranslationKey }> = [
  { icon: Mic, title: "kiosk.intro.step1.title", body: "kiosk.intro.step1.body" },
  { icon: PenLine, title: "kiosk.intro.step2.title", body: "kiosk.intro.step2.body" },
  { icon: Stethoscope, title: "kiosk.intro.step3.title", body: "kiosk.intro.step3.body" },
];

/** Sets expectations before the spoken part begins. */
export function IntroductionPage() {
  return (
    <KioskStepContainer step={stepNumber("introduction")}>
      <div className="mx-auto max-w-4xl">
        <KioskText
          tkey="kiosk.intro.heading"
          as="h1"
          className="text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.intro.support"
          as="p"
          className="mt-4 text-lg text-muted-foreground"
        />

        <ol className="mt-8 grid gap-6 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-4xl border border-border bg-surface px-6 py-8 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <step.icon className="size-6" />
                </span>
                <span
                  aria-hidden="true"
                  className="text-lg font-semibold text-muted-foreground tabular-nums"
                >
                  {index + 1}
                </span>
              </div>
              <KioskText
                tkey={step.title}
                as="h2"
                className="mt-6 text-xl font-semibold sm:text-2xl"
                secondaryClassName="text-base font-normal"
              />
              <KioskText
                tkey={step.body}
                as="p"
                className="mt-3 text-base leading-relaxed text-muted-foreground"
              />
            </li>
          ))}
        </ol>

        <KioskStepNav stepId="introduction" />
      </div>
    </KioskStepContainer>
  );
}
