import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { KIOSK_STEPS, KIOSK_TOTAL_STEPS } from "@/features/patient-kiosk/session";
import { cn } from "@/lib/utils";

/**
 * Data-driven journey progress. Reusable across every future step screen.
 * `variant="quiet"` shows only a calm label — used on the welcome screen so the
 * patient never feels a long form ahead of them.
 */
export function KioskProgress({
  currentStep,
  totalSteps = KIOSK_TOTAL_STEPS,
  variant = "full",
  quietLabel,
  className,
}: {
  currentStep: number;
  totalSteps?: number;
  variant?: "full" | "quiet";
  quietLabel?: string;
  className?: string;
}) {
  const { t, tIn, language } = useKiosk();
  const step = KIOSK_STEPS[Math.min(Math.max(currentStep, 1), totalSteps) - 1];
  const percent = Math.round((currentStep / totalSteps) * 100);

  if (variant === "quiet") {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/8 px-5 py-2.5 text-base font-semibold text-white/70 backdrop-blur-sm",
          className,
        )}
      >
        <span aria-hidden="true" className="size-2.5 rounded-full bg-primary" />
        <span className={language === "hi" ? "deva" : undefined}>
          {quietLabel ?? t("kiosk.welcome.begin")}
        </span>
      </p>
    );
  }

  return (
    <div className={cn("w-full", className)} aria-label={t("kiosk.progress.label")}>
      <div className="flex items-baseline justify-between gap-4">
        <p className={cn("text-lg font-semibold text-white", language === "hi" && "deva")}>
          {step ? tIn(language, step.labelKey) : ""}
        </p>
        <p className="text-base text-white/50">
          {t("kiosk.progress.step", { current: currentStep, total: totalSteps })}
        </p>
      </div>
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={currentStep}
        aria-valuetext={t("kiosk.progress.step", { current: currentStep, total: totalSteps })}
        className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-[var(--ease-calm)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
