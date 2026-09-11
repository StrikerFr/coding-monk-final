import { cn } from "@/lib/utils";

type State = "rest" | "attentive" | "listening";

/**
 * Central listening visual: an organic, breathing sound field.
 * Purely decorative — every message it carries is also written in text nearby.
 */
export function VoiceVisual({ state = "rest", className }: { state?: State; className?: string }) {
  const active = state !== "rest";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative grid place-items-center transition-transform duration-[900ms] ease-[var(--ease-calm)]",
        state === "attentive" && "scale-[1.04]",
        state === "listening" && "scale-[1.18]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl transition-opacity duration-700",
          "bg-[radial-gradient(circle_at_50%_45%,var(--color-primary-soft),transparent_68%)]",
          active ? "opacity-90" : "opacity-60",
        )}
      />
      <div className="animate-drift absolute inset-[8%] rounded-full bg-[conic-gradient(from_140deg,var(--color-primary-soft),var(--color-accent),var(--color-primary-soft))] opacity-55 blur-xl" />
      <div
        className={cn(
          "animate-breathe absolute inset-[18%] rounded-full border border-primary/25 bg-surface/70 backdrop-blur-[2px]",
        )}
      />
      <div
        className="animate-breathe absolute inset-[30%] rounded-full bg-[radial-gradient(circle_at_45%_40%,var(--color-surface),var(--color-primary-soft))] opacity-95"
        style={{ animationDelay: "-2s" }}
      />
      <div
        className="animate-breathe absolute inset-[44%] rounded-full bg-primary/70"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}
