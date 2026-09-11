import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";
import { cn } from "@/lib/utils";

const POINTS: KioskTranslationKey[] = [
  "kiosk.consent.point1",
  "kiosk.consent.point2",
  "kiosk.consent.point3",
];

/** Plain-language consent before any information is collected. */
export function ConsentPage() {
  const { language, t, updateSession } = useKiosk();
  const [declined, setDeclined] = useState(false);

  return (
    <KioskStepContainer step={stepNumber("consent")}>
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex items-center gap-3 rounded-full border border-border bg-surface px-5 py-2 text-base font-semibold">
          <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
          <KioskText tkey="kiosk.step.consent" as="span" showSecondary={false} speak={false} />
        </span>

        <KioskText
          tkey="kiosk.consent.heading"
          as="h1"
          className="mt-6 text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.consent.support"
          as="p"
          className="mt-4 text-lg text-muted-foreground"
        />

        {declined ? (
          <div className="mt-10 rounded-4xl border border-border bg-surface px-8 py-12 text-center">
            <KioskText
              tkey="kiosk.consent.declinedTitle"
              as="p"
              className="text-2xl font-semibold sm:text-3xl"
            />
            <KioskText
              tkey="kiosk.consent.declinedBody"
              as="p"
              className="mt-4 text-lg text-muted-foreground"
            />
            <Link
              to="/patient-kiosk"
              className="mt-10 inline-flex min-h-16 items-center rounded-full border border-border bg-background px-10 text-xl font-semibold transition-colors hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.stub.back")}</span>
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-8 space-y-4">
              {POINTS.map((key, index) => (
                <li
                  key={key}
                  className="flex items-start gap-5 rounded-3xl border border-border bg-surface px-6 py-5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary tabular-nums"
                  >
                    {index + 1}
                  </span>
                  <KioskText
                    tkey={key}
                    as="span"
                    className="text-lg leading-relaxed sm:text-xl"
                    secondaryClassName="text-base"
                  />
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => {
                updateSession({ consentStatus: "declined" });
                setDeclined(true);
              }}
              className="mt-8 inline-flex min-h-14 items-center rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.consent.decline")}</span>
            </button>

            <KioskStepNav
              stepId="consent"
              continueKey="kiosk.consent.agree"
              onContinue={() => updateSession({ consentStatus: "granted" })}
            />
          </>
        )}
      </div>
    </KioskStepContainer>
  );
}
