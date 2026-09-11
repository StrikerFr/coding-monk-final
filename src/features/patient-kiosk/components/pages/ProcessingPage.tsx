import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Loader2 } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { nextStep, stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskText } from "../KioskText";
import { cn } from "@/lib/utils";

/** Stores the check-in, then moves on. Failures are stated plainly. */
export function ProcessingPage() {
  const { language, t, saveSession } = useKiosk();
  const navigate = useNavigate();
  const [state, setState] = useState<"saving" | "saved" | "failed">("saving");

  const run = useCallback(async () => {
    setState("saving");
    const ok = await saveSession();
    setState(ok ? "saved" : "failed");
    if (ok) {
      const forward = nextStep("processing");
      if (forward) void navigate({ to: forward.path });
    }
  }, [saveSession, navigate]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <KioskStepContainer step={stepNumber("processing")} progress="quiet">
      <div className="mx-auto max-w-2xl rounded-4xl border border-border bg-surface px-8 py-16 text-center">
        <span
          aria-hidden="true"
          className="inline-flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary"
        >
          {state === "saved" ? (
            <Check className="size-9" />
          ) : (
            <Loader2 className={cn("size-9", state === "saving" && "animate-spin")} />
          )}
        </span>

        <KioskText
          tkey="kiosk.processing.heading"
          as="h1"
          className="mt-8 text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <p aria-live="polite" className="mt-4 text-lg text-muted-foreground">
          <span className={cn(language === "hi" && "deva")}>
            {state === "failed"
              ? t("kiosk.processing.failed")
              : state === "saved"
                ? t("kiosk.processing.saved")
                : t("kiosk.processing.body")}
          </span>
        </p>

        {state === "failed" && (
          <button
            type="button"
            onClick={() => void run()}
            className="mt-10 inline-flex min-h-16 items-center rounded-full bg-primary px-10 text-xl font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
          >
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.processing.retry")}</span>
          </button>
        )}
      </div>
    </KioskStepContainer>
  );
}
