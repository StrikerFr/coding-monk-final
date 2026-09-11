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
}: {
  stepId: KioskStepId;
  continueKey?: KioskTranslationKey;
  canContinue?: boolean;
  /** Runs before navigation — use it to store what the patient entered. */
  onContinue?: () => void | boolean | Promise<boolean | void>;
  showSkip?: boolean;
  onSkip?: () => void;
  note?: KioskTranslationKey;
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

  return (
    <div className="mt-10 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-4">
        {back && (
          <button
            type="button"
            onClick={() => void navigate({ to: back.path })}
            className="inline-flex min-h-14 items-center gap-2 rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
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
        onClick={() => void go()}
        disabled={!canContinue}
        className={cn(
          "group inline-flex min-h-16 items-center justify-center gap-4 rounded-full bg-primary px-10",
          "text-xl font-semibold text-primary-foreground shadow-[var(--shadow-lift)]",
          "transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50",
        )}
      >
        <span className={cn(deva && "deva")}>{t(continueKey)}</span>
        <ArrowRight
          aria-hidden="true"
          className="size-6 transition-transform group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
