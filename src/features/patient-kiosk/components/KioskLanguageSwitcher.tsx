import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { cn } from "@/lib/utils";
import type { KioskLanguage } from "@/features/patient-kiosk/session";
import { speakable } from "@/components/a11y";

/** Always-visible Hindi / English switch, sized for touch. */
export function KioskLanguageSwitcher() {
  const { language, setLanguage, t } = useKiosk();

  const option = (value: KioskLanguage, label: string) => {
    const selected = language === value;
    return (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={() => setLanguage(value)}
        {...speakable(value === "hi" ? "हिन्दी में देखें" : "Show interface in English")}
        className={cn(
          "min-h-14 rounded-full px-6 text-lg font-semibold transition-all duration-300 ease-[var(--ease-calm)]",
          value === "hi" && "deva",
          selected
            ? "bg-foreground text-background shadow-[var(--shadow-soft)]"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
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
      aria-label={`${t("kiosk.language.label")} / भाषा`}
      className="flex items-center gap-1 rounded-full border border-border bg-surface p-1"
    >
      {option("hi", "हिन्दी")}
      {option("en", "English")}
    </div>
  );
}
