import { cn } from "@/lib/utils";

const BARS = [0.38, 0.62, 0.92, 0.7, 1, 0.55, 0.8, 0.42];

/**
 * Small decorative "we are listening" equaliser. Always paired with words
 * nearby, never the only carrier of meaning.
 */
export function SoundWave({
  active = true,
  className,
  tone = "primary",
}: {
  active?: boolean;
  className?: string;
  tone?: "primary" | "surface";
}) {
  return (
    <span aria-hidden="true" className={cn("flex items-end gap-[3px]", className)}>
      {BARS.map((h, i) => (
        <span
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-opacity duration-500",
            tone === "primary" ? "bg-primary" : "bg-surface",
            active ? "animate-wave opacity-90" : "opacity-40",
          )}
          style={{
            height: `${Math.round(h * 100)}%`,
            animationDelay: `${i * 110}ms`,
          }}
        />
      ))}
    </span>
  );
}
