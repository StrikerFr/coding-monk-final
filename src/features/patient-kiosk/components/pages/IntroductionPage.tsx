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
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.intro.support"
          as="p"
          className="mt-1 text-sm sm:text-base text-muted-foreground"
        />

        <ol className="mt-3 grid gap-3 sm:mt-5 sm:gap-4 lg:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-3xl border border-border bg-surface px-4 py-4 sm:px-5 sm:py-5 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"
                >
                  <step.icon className="size-5" />
                </span>
                <span
                  aria-hidden="true"
                  className="text-base font-semibold text-muted-foreground tabular-nums"
                >
                  {index + 1}
                </span>
              </div>
              <KioskText
                tkey={step.title}
                as="h2"
                className="mt-3 text-lg font-semibold sm:text-xl"
                secondaryClassName="text-sm font-normal"
              />
              <KioskText
                tkey={step.body}
                as="p"
                className="mt-1 text-xs sm:text-sm leading-relaxed text-muted-foreground"
              />
            </li>
          ))}
        </ol>

        <KioskStepNav stepId="introduction" />
      </div>
    </KioskStepContainer>
  );
}
