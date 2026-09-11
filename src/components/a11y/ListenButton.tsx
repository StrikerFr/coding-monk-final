import { Square, Volume2 } from "lucide-react";
import { useAppLanguage, useSpeech } from "@/lib/a11y";
import { cn } from "@/lib/utils";
import { notSpeakable } from "./speakable";

/**
 * Explicit "Listen" control for important content: instructions, questions,
 * consent explanations, confirmations. Works on touch screens where hover does
 * not exist, and works even when hover-to-speak is off.
 */
export function ListenButton({
  text,
  className,
  size = "default",
  label,
}: {
  /** Exact text to speak, already in the active language. */
  text: string;
  className?: string;
  size?: "default" | "large";
  label?: string;
}) {
  const { t, language } = useAppLanguage();
  const { speak, stop, currentlySpeaking, speechSupported } = useSpeech();

  if (!speechSupported) return null;

  const listening = currentlySpeaking;
  const visible = label ?? t("voice.listen");

  return (
    <button
      type="button"
      onClick={() => (listening ? stop() : speak(text))}
      aria-label={listening ? t("voice.stop") : `${t("voice.listenTo")}: ${text.slice(0, 80)}`}
      {...notSpeakable}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary-soft font-semibold text-foreground",
        "transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "large" ? "min-h-14 px-6 text-lg" : "min-h-11 px-4 text-sm",
        className,
      )}
    >
      {listening ? (
        <Square aria-hidden="true" className="size-4 shrink-0 fill-current" />
      ) : (
        <Volume2 aria-hidden="true" className="size-4 shrink-0" />
      )}
      <span className={cn(language === "hi" && "deva")}>
        {listening ? t("voice.stop") : visible}
      </span>
    </button>
  );
}
