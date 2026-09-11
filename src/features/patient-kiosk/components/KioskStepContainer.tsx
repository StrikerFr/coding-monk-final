import type { ReactNode } from "react";
import { KioskProgress } from "./KioskProgress";
import { cn } from "@/lib/utils";

/**
 * Frame shared by every journey step: consistent width, rhythm and progress.
 * Screens only supply their own content.
 */
export function KioskStepContainer({
  children,
  step,
  progress = "full",
  className,
}: {
  children: ReactNode;
  /** 1-based position in the journey. */
  step: number;
  progress?: "full" | "quiet" | "none";
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1200px] px-6 py-10 sm:px-10 lg:py-14", className)}>
      {progress !== "none" && (
        <div className="animate-rise flex flex-wrap items-center justify-between gap-4">
          <KioskProgress
            currentStep={step}
            variant={progress}
            className={progress === "full" ? "flex-1" : ""}
          />
        </div>
      )}
      <div className="mt-8">{children}</div>
    </div>
  );
}
