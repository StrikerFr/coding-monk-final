import { Volume2 } from "lucide-react";
import { useAppLanguage, useVoiceAccessibility } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { notSpeakable } from "./speakable";

/**
 * Small, calm indicator that speech is currently playing, with an immediate
 * stop action. Deliberately not a large floating accessibility widget.
 */
export function VoiceStatusIndicator({ className }: { className?: string }) {
  const { t, language } = useAppLanguage();
  const { currentlySpeaking, readAloudEnabled, stop } = useVoiceAccessibility();

  if (!currentlySpeaking && !readAloudEnabled) return null;
  if (!currentlySpeaking) return null;

  return (
    <div
      aria-live="polite"
      {...notSpeakable}
      className={cn(
        "pointer-events-auto flex items-center gap-2 rounded-full border border-primary/35 bg-surface/95 px-3 py-1.5 shadow-[var(--shadow-soft)] backdrop-blur",
        className,
      )}
    >
      <Volume2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
      <span className={cn("text-xs font-semibold", language === "hi" && "deva")}>
        {t("voice.speaking")}
      </span>
      <button
        type="button"
        onClick={stop}
        className={cn(
          "rounded-full border border-border px-2 py-0.5 text-xs font-semibold hover:bg-muted",
          language === "hi" && "deva",
        )}
      >
        {t("voice.stop")}
      </button>
    </div>
  );
}
