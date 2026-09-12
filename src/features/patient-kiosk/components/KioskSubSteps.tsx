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
  onFinish?: () => void | Promise<void>;
  showSkip?: boolean;
  onSkip?: () => void | Promise<void>;
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

  const goForward = async () => {
    if (!isLast) {
      setIndex((current) => current + 1);
      return;
    }
    await onFinish?.();
    if (forward) void navigate({ to: forward.path });
  };

  const skip = async () => {
    await onSkip?.();
    if (forward) void navigate({ to: forward.path });
  };

  return (
    <div>
      <p aria-live="polite" className={cn("text-xs sm:text-sm text-muted-foreground", deva && "deva")}>
        {t("kiosk.nav.card", { current: index + 1, total: items.length })}
      </p>

      <div className="mt-1.5 flex gap-1.5" aria-hidden="true">
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

      <div key={item.id} className="animate-rise mt-3 sm:mt-4">
        {item.content}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:mt-5 sm:pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {(back || !isFirst) && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted sm:min-h-12 sm:px-5 sm:text-base"
            >
              <ArrowLeft aria-hidden="true" className="size-4 sm:size-5" />
              <span className={cn(deva && "deva")}>{t("kiosk.nav.back")}</span>
            </button>
          )}
          {showSkip && (
            <button
              type="button"
              onClick={skip}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:min-h-12 sm:text-base"
            >
              <span className={cn(deva && "deva")}>{t("kiosk.nav.skip")}</span>
            </button>
          )}
          {note && (
            <p className={cn("max-w-md text-xs sm:text-sm text-muted-foreground", deva && "deva")}>
              {t(note)}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={goForward}
          disabled={item.canContinue === false}
          className={cn(
            "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-7",
            "text-base font-semibold text-primary-foreground shadow-[var(--shadow-lift)]",
            "transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50 sm:min-h-13 sm:px-9 sm:text-lg",
          )}
        >
          <span className={cn(deva && "deva")}>
            {t(isLast ? "kiosk.nav.continue" : "kiosk.nav.next")}
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-5 transition-transform group-hover:translate-x-1"
          />
        </button>
      </div>
    </div>
  );
}
