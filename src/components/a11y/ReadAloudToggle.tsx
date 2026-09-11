import { Volume2, VolumeX } from "lucide-react";
import { useAppLanguage, useVoiceAccessibility } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { speakable } from "./speakable";

/**
 * Read Aloud on/off. State is communicated with words as well as icon and
 * colour, so it is never colour-only information.
 */
export function ReadAloudToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { t, language } = useAppLanguage();
  const { readAloudEnabled, toggleReadAloud, speechSupported } = useVoiceAccessibility();

  if (!speechSupported) {
    return (
      <p className={cn("text-xs text-muted-foreground", language === "hi" && "deva", className)}>
        {t("voice.unsupported")}
      </p>
    );
  }

  const label = readAloudEnabled ? t("voice.on") : t("voice.off");

  return (
    <button
      type="button"
      role="switch"
      aria-checked={readAloudEnabled}
      onClick={toggleReadAloud}
      {...speakable(`${t("voice.title")}. ${label}`)}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "min-h-9 px-2.5 text-xs" : "min-h-11 px-3 text-sm",
        readAloudEnabled
          ? "border-primary/40 bg-primary-soft text-foreground"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {readAloudEnabled ? (
        <Volume2 aria-hidden="true" className="size-4 shrink-0" />
      ) : (
        <VolumeX aria-hidden="true" className="size-4 shrink-0" />
      )}
      <span className={cn(language === "hi" && "deva")}>{label}</span>
    </button>
  );
}
