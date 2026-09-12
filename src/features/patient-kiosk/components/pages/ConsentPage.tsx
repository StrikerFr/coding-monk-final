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
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1 text-xs font-semibold sm:text-sm">
          <ShieldCheck aria-hidden="true" className="size-4 text-primary" />
          <KioskText tkey="kiosk.step.consent" as="span" showSecondary={false} speak={false} />
        </span>

        <KioskText
          tkey="kiosk.consent.heading"
          as="h1"
          className="mt-2 text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-base sm:text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.consent.support"
          as="p"
          className="mt-1 text-sm text-muted-foreground sm:text-base"
        />

        {declined ? (
          <div className="mt-6 rounded-3xl border border-border bg-surface px-6 py-8 text-center">
            <KioskText
              tkey="kiosk.consent.declinedTitle"
              as="p"
              className="text-xl font-semibold sm:text-2xl"
            />
            <KioskText
              tkey="kiosk.consent.declinedBody"
              as="p"
              className="mt-2 text-base text-muted-foreground"
            />
            <Link
              to="/patient-kiosk"
              className="mt-6 inline-flex min-h-12 items-center rounded-full border border-border bg-background px-8 text-base font-semibold transition-colors hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.stub.back")}</span>
            </Link>
          </div>
        ) : (
          <>
            <ul className="mt-3.5 space-y-2.5">
              {POINTS.map((key, index) => (
                <li
                  key={key}
                  className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-3.5"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary tabular-nums sm:size-8"
                  >
                    {index + 1}
                  </span>
                  <KioskText
                    tkey={key}
                    as="span"
                    className="text-base leading-snug sm:text-lg"
                    secondaryClassName="text-sm font-normal"
                  />
                </li>
              ))}
            </ul>

            <KioskStepNav
              stepId="consent"
              continueKey="kiosk.consent.agree"
              onContinue={() => updateSession({ consentStatus: "granted" })}
              extraLeft={
                <button
                  type="button"
                  onClick={() => {
                    updateSession({ consentStatus: "declined" });
                    setDeclined(true);
                  }}
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-4 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:text-sm"
                >
                  <span className={cn(language === "hi" && "deva")}>{t("kiosk.consent.decline")}</span>
                </button>
              }
            />
          </>
        )}
      </div>
    </KioskStepContainer>
  );
}
