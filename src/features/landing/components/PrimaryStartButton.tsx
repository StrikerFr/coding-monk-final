import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export function PrimaryStartButton({
  onStart,
  onAttention,
  onAttentionEnd,
  pressed,
}: {
  onStart: () => void;
  onAttention?: () => void;
  onAttentionEnd?: () => void;
  pressed?: boolean;
}) {
  const { hi, en } = useLanguage();

  return (
    <button
      type="button"
      onClick={onStart}
      onMouseEnter={onAttention}
      onMouseLeave={onAttentionEnd}
      onFocus={onAttention}
      onBlur={onAttentionEnd}
      className={cn(
        "group relative inline-flex min-h-[5.5rem] w-full max-w-xl items-center justify-center gap-4 overflow-hidden rounded-full px-12",
        "bg-[linear-gradient(135deg,var(--color-primary),color-mix(in_oklab,var(--color-primary)_82%,var(--color-foreground)))]",
        "text-primary-foreground shadow-[var(--shadow-lift)] transition-all duration-300 ease-[var(--ease-calm)]",
        "hover:-translate-y-0.5 hover:shadow-[0_10px_28px_oklch(0.3_0.04_60/14%),0_44px_90px_-32px_oklch(0.3_0.04_60/34%)]",
        "active:translate-y-0 active:scale-[0.975] lg:min-h-[6.5rem]",
        pressed && "scale-[0.96]",
      )}
    >
      {/* Soft sheen for tactile depth */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(to_bottom,oklch(1_0_0/16%),transparent)]"
      />
      <span className="relative flex flex-wrap items-baseline justify-center gap-x-4 gap-y-1">
        {hi && <span className="deva text-3xl font-semibold lg:text-4xl">शुरू करें</span>}
        {hi && en && (
          <span aria-hidden="true" className="text-2xl opacity-60 lg:text-3xl">
            /
          </span>
        )}
        {en && <span className="text-3xl font-semibold lg:text-4xl">Start</span>}
      </span>
      <span
        aria-hidden="true"
        className="relative grid size-11 shrink-0 place-items-center rounded-full bg-primary-foreground/15 transition-transform duration-300 ease-[var(--ease-calm)] group-hover:translate-x-1.5"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}
