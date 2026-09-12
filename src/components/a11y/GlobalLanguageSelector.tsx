import { useAppLanguage, type Language } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { speakable } from "./speakable";

/**
 * The one language control used by every MediKiosk surface. Hindi | English,
 * always visible, never hidden behind a menu.
 */
export function GlobalLanguageSelector({
  size = "default",
  className,
}: {
  size?: "default" | "compact" | "large";
  className?: string;
}) {
  const { language, setLanguage, t } = useAppLanguage();

  const option = (value: Language) => {
    const selected = language === value;
    const label = value === "hi" ? "हिन्दी" : "English";
    const spoken = value === "hi" ? "हिन्दी में देखें" : "Show interface in English";
    return (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={selected}
        lang={value}
        onClick={() => setLanguage(value)}
        {...speakable(spoken)}
        className={cn(
          "flex items-center justify-center rounded-md font-semibold leading-none transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          value === "hi" && "deva !leading-none",
          size === "compact" && "h-9 min-w-[3.25rem] px-2 text-xs",
          size === "default" && "h-10 min-w-[4rem] px-3 text-sm",
          size === "large" && "min-h-14 px-6 text-lg",
          selected
            ? "bg-primary-soft text-foreground shadow-[var(--shadow-soft)]"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        {selected && <span className="sr-only"> (selected)</span>}
      </button>
    );
  };

  return (
    <div
      role="radiogroup"
      aria-label={`${t("language.label")} / Language`}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface p-1",
        className,
      )}
    >
      {option("hi")}
      {option("en")}
    </div>
  );
}
