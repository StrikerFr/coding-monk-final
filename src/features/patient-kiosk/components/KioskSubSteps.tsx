import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { nextStep, previousStep, type KioskStepId } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";

export type KioskSubStep = {
  id: string;
  /** The single thing asked on this card. */
  content: ReactNode;
  /** False keeps the patient on this card. */
  canContinue?: boolean;
};

/**
 * Shows one card at a time instead of a long form. The patient answers, the card
 * moves on, and the last card continues to the next step of the journey.
 */
export function KioskSubSteps({
  stepId,
  items,
  onFinish,
  showSkip = false,
  onSkip,
  note,
}: {
  stepId: KioskStepId;
  items: KioskSubStep[];
  /** Runs before leaving this step — use it to store what was entered. */
  onFinish?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
  note?: KioskTranslationKey;
}) {
  const { language, t } = useKiosk();
  const navigate = useNavigate();
  const deva = language === "hi";
  const [index, setIndex] = useState(0);

  const item = items[index];
  const isFirst = index === 0;
  const isLast = index === items.length - 1;
  const back = previousStep(stepId);
  const forward = nextStep(stepId);

  if (!item) return null;

  const goBack = () => {
    if (!isFirst) {
      setIndex((current) => current - 1);
      return;
    }
    if (back) void navigate({ to: back.path });
  };

  const goForward = () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      return;
    }
    onFinish?.();
    if (forward) void navigate({ to: forward.path });
  };

  const skip = () => {
    onSkip?.();
    if (forward) void navigate({ to: forward.path });
  };

  return (
    <div>
      <p aria-live="polite" className={cn("text-base text-muted-foreground", deva && "deva")}>
        {t("kiosk.nav.card", { current: index + 1, total: items.length })}
      </p>

      <div className="mt-3 flex gap-2" aria-hidden="true">
        {items.map((entry, position) => (
          <span
            key={entry.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              position <= index ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      <div key={item.id} className="animate-rise mt-8">
        {item.content}
      </div>

      <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {(back || !isFirst) && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-14 items-center gap-2 rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
              <span className={cn(deva && "deva")}>{t("kiosk.nav.back")}</span>
            </button>
          )}
          {showSkip && (
            <button
              type="button"
              onClick={skip}
              className="inline-flex min-h-14 items-center rounded-full px-4 text-base font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              <span className={cn(deva && "deva")}>{t("kiosk.nav.skip")}</span>
            </button>
          )}
          {note && (
            <p className={cn("max-w-md text-base text-muted-foreground", deva && "deva")}>
              {t(note)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={goForward}
          disabled={item.canContinue === false}
          className={cn(
            "group inline-flex min-h-16 items-center justify-center gap-4 rounded-full bg-primary px-10",
            "text-xl font-semibold text-primary-foreground shadow-[var(--shadow-lift)]",
            "transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
          )}
        >
          <span className={cn(deva && "deva")}>
            {t(isLast ? "kiosk.nav.continue" : "kiosk.nav.next")}
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-6 transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}
