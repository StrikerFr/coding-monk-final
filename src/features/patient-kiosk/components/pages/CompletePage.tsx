import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import type { SummaryRow } from "@/lib/clinical/types";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskText } from "../KioskText";
import { cn } from "@/lib/utils";

/** Final reassurance plus the code staff use to find this check-in. */
export function CompletePage() {
  const { session, language, t } = useKiosk();
  const [summary, setSummary] = useState<SummaryRow | null | "loading">("loading");

  useEffect(() => {
    let active = true;
    void patientKioskApi
      .getSummary()
      .then((row) => {
        if (active) setSummary(row);
      })
      .catch(() => {
        if (active) setSummary(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const sections = summary && summary !== "loading" ? summary.body.sections ?? [] : [];
  const review = summary && summary !== "loading" ? summary.body.itemsRequiringReview ?? [] : [];

  return (
    <KioskStepContainer step={stepNumber("complete")} progress="quiet">
      <div className="mx-auto max-w-2xl rounded-4xl border border-border bg-surface px-8 py-16 text-center">
        <span
          aria-hidden="true"
          className="inline-flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          <CheckCircle2 className="size-10" />
        </span>

        <KioskText
          tkey="kiosk.complete.heading"
          as="h1"
          className="mt-8 text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText tkey="kiosk.complete.body" as="p" className="mt-4 text-lg" />

        {session?.token && (
          <div className="mt-10 rounded-3xl border border-border bg-background px-6 py-6">
            <KioskText
              tkey="kiosk.complete.token"
              as="p"
              className="text-sm font-semibold tracking-wide uppercase"
              secondaryClassName="text-xs font-normal tracking-normal normal-case"
            />
            <p className="mt-3 text-4xl font-semibold tracking-[0.2em] tabular-nums">
              {session.token}
            </p>
          </div>
        )}

        <KioskText
          tkey="kiosk.complete.thanks"
          as="p"
          className="mt-8 text-lg text-muted-foreground"
        />

        <section className="mt-10 rounded-4xl border border-border bg-background px-6 py-7 text-left">
          <h2 className={cn("text-sm font-semibold uppercase tracking-wide", language === "hi" && "deva")}>
            {t("kiosk.complete.summaryTitle")}
          </h2>
          <p className={cn("mt-2 text-base text-muted-foreground", language === "hi" && "deva")}>
            {t("kiosk.complete.summarySupport")}
          </p>

          {summary === "loading" ? (
            <p className="mt-5 flex items-center gap-2 text-base text-muted-foreground">
              <Loader2 aria-hidden="true" className="size-4 animate-spin" />
              <span className={cn(language === "hi" && "deva")}>
                {t("kiosk.complete.summaryLoading")}
              </span>
            </p>
          ) : sections.length === 0 ? (
            <p className={cn("mt-5 text-base text-muted-foreground", language === "hi" && "deva")}>
              {t("kiosk.complete.summaryEmpty")}
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {sections
                .filter((section) => section.content?.trim())
                .map((section) => (
                  <div key={section.heading} className="rounded-2xl border border-border bg-surface p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                ))}

              {review.length > 0 && (
                <div className="rounded-2xl border border-border bg-muted p-4">
                  <h3 className={cn("text-xs font-semibold uppercase tracking-wide text-muted-foreground", language === "hi" && "deva")}>
                    {t("kiosk.complete.summaryReview")}
                  </h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px]">
                    {review.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/patient"
            className="inline-flex min-h-14 sm:min-h-16 items-center gap-2 rounded-full bg-primary px-10 text-lg sm:text-xl font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
          >
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.complete.restart")}</span>
          </Link>

          <Link
            to="/patient-kiosk"
            className="inline-flex min-h-14 sm:min-h-16 items-center rounded-full border border-border bg-background px-8 text-base sm:text-lg font-semibold transition-colors hover:bg-muted"
          >
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.complete.newCheckIn")}</span>
          </Link>
        </div>
      </div>
    </KioskStepContainer>
  );
}
