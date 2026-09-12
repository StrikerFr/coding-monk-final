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
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1280px] flex-1 flex-col justify-between px-4 py-3 sm:px-8 sm:py-5",
        className,
      )}
    >
      {progress !== "none" && (
        <div className="animate-rise mb-3 flex flex-wrap items-center justify-between gap-3 sm:mb-4">
          <KioskProgress
            currentStep={step}
            variant={progress}
            className={progress === "full" ? "flex-1" : ""}
          />
        </div>
      )}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
