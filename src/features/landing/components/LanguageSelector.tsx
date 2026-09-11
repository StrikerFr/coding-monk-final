import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage();

  const option = (value: "hi" | "en", label: string, sr: string) => {
    const selected = lang === value || (lang === "both" && value === "hi");
    return (
      <button
        key={value}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={sr}
        onClick={() => setLang(value)}
        className={cn(
          "relative flex h-11 items-center justify-center px-2.5 text-sm font-semibold leading-none transition-colors duration-300 ease-[var(--ease-calm)] sm:px-3",
          value === "hi" && "deva !leading-none",
          selected
            ? "text-foreground after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:bg-primary"
            : "text-muted-foreground hover:text-foreground",
          compact && "h-9 px-1.5 text-xs sm:px-2.5 sm:text-sm",
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div role="radiogroup" aria-label="Language / भाषा" className="flex shrink-0 items-center">
      {option("hi", "हिन्दी", "हिन्दी में देखें")}
      <span aria-hidden="true" className="h-5 w-px bg-border" />
      {option("en", "English", "View in English")}
    </div>
  );
}
