import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { nextStep, previousStep, type KioskStepId } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { cn } from "@/lib/utils";

/**
 * Shared footer for journey steps: a quiet way back, an optional skip, and one
 * clear forward action that always moves to the next step in the journey.
 */
export function KioskStepNav({
  stepId,
  continueKey = "kiosk.nav.continue",
  canContinue = true,
  onContinue,
  showSkip = false,
  onSkip,
  note,
  extraLeft,
  onBack,
}: {
  stepId: KioskStepId;
  continueKey?: KioskTranslationKey;
  canContinue?: boolean;
  /** Runs before navigation — use it to store what the patient entered. */
  onContinue?: () => void | boolean | Promise<boolean | void>;
  showSkip?: boolean;
  onSkip?: () => void;
  note?: KioskTranslationKey;
  extraLeft?: ReactNode;
  onBack?: (() => void) | undefined;
}) {
  const { language, t } = useKiosk();
  const navigate = useNavigate();
  const deva = language === "hi";
  const back = previousStep(stepId);
  const forward = nextStep(stepId);

  const go = async () => {
    const result = await onContinue?.();
    if (result === false) return;
    if (forward) void navigate({ to: forward.path });
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (back) {
      void navigate({ to: back.path });
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 sm:mt-5 sm:pt-4">
      <div className="flex flex-wrap items-center gap-3">
        {extraLeft}
        {(back || onBack) && (
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold transition-colors hover:bg-muted sm:min-h-12 sm:px-5 sm:text-base"
          >
            <ArrowLeft aria-hidden="true" className="size-4 sm:size-5" />
            <span className={cn(deva && "deva")}>{t("kiosk.nav.back")}</span>
          </button>
        )}
        {showSkip && (
          <button
            type="button"
            onClick={() => {
              onSkip?.();
              if (forward) void navigate({ to: forward.path });
            }}
            className="inline-flex min-h-10 items-center rounded-full px-3 text-xs font-semibold text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline sm:text-sm"
          >
            <span className={cn(deva && "deva")}>{t("kiosk.nav.skip")}</span>
          </button>
        )}
        {note && (
          <p className={cn("max-w-xs text-xs text-muted-foreground sm:max-w-sm sm:text-sm", deva && "deva")}>
            {t(note)}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => void go()}
        disabled={!canContinue}
        className={cn(
          "group inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-primary px-7",
          "text-base font-semibold text-primary-foreground shadow-[var(--shadow-lift)] sm:min-h-13 sm:px-9 sm:text-lg",
          "transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
        )}
      >
        <span className={cn(deva && "deva")}>{t(continueKey)}</span>
        <ArrowRight
          aria-hidden="true"
          className="size-5 transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
