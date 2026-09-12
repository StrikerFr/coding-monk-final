import { useEffect, useRef, useState } from "react";
import { Keyboard, Loader2, Mic, Square, Volume2 } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { useVoiceInput } from "@/lib/voice/use-voice-input";
import { useVoicePlayback } from "@/lib/voice/use-voice-playback";
import { cn } from "@/lib/utils";
import { KioskText } from "./KioskText";

/**
 * One spoken question: the kiosk can read it aloud, and the patient answers by
 * speaking. The recognised words are always shown back for the patient to see.
 */
export function KioskVoiceAnswer({
  questionKey,
  questionText: suppliedQuestionText,
  answer,
  onAnswer,
}: {
  questionKey?: KioskTranslationKey;
  questionText?: string;
  answer: string | undefined;
  onAnswer: (text: string) => void;
}) {
  const { language, tIn, t } = useKiosk();
  const playback = useVoicePlayback();
  const voice = useVoiceInput({ language, onTranscript: onAnswer });
  const [typing, setTyping] = useState(false);
  const [typedText, setTypedText] = useState(answer ?? "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const typedTextRef = useRef(typedText);
  typedTextRef.current = typedText;
  const onAnswerRef = useRef(onAnswer);
  onAnswerRef.current = onAnswer;

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        onAnswerRef.current(typedTextRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!typing) {
      setTypedText(answer ?? "");
    }
  }, [answer, typing]);

  const handleTypedChange = (val: string) => {
    const text = val.slice(0, 1000);
    setTypedText(text);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onAnswer(text);
    }, 500);
  };

  const handleBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onAnswer(typedText);
  };

  const questionText = suppliedQuestionText ?? (questionKey ? tIn(language, questionKey) : "");
  const questionId = questionKey ?? questionText;
  const listening = voice.state === "listening";
  const working = voice.state === "understanding";
  const errorKey: KioskTranslationKey | null =
    voice.error === "permission"
      ? "kiosk.voice.error.permission"
      : voice.error === "empty"
        ? "kiosk.voice.error.empty"
        : voice.error === "failed"
          ? "kiosk.voice.error.failed"
          : null;

  const shownAnswer = voice.transcript || (typing ? typedText : answer) || "";

  return (
    <section className="rounded-3xl border border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {questionKey ? (
          <KioskText
            tkey={questionKey}
            as="h2"
            className="max-w-xl text-xl font-semibold sm:text-2xl"
            secondaryClassName="text-base font-normal"
          />
        ) : (
          <h2 lang={language} className={cn("max-w-xl text-xl font-semibold sm:text-2xl", language === "hi" && "deva")}>
            {questionText}
          </h2>
        )}
        <button
          type="button"
          onClick={() =>
            playback.isSpeaking ? playback.stop() : void playback.speak(questionText, questionId)
          }
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold transition-colors hover:bg-muted sm:text-sm"
        >
          <Volume2 aria-hidden="true" className="size-4 text-primary" />
          <span className={cn(language === "hi" && "deva")}>
            {playback.isSpeaking ? t("kiosk.voice.stopListening") : t("kiosk.voice.listen")}
          </span>
        </button>
      </div>

      {typing ? (
        <div className="mt-3 text-left">
          <label
            htmlFor={`typed-${questionId}`}
            className={cn("text-sm font-semibold sm:text-base", language === "hi" && "deva")}
          >
            {t("kiosk.voice.typeLabel")}
          </label>
          <textarea
            id={`typed-${questionId}`}
            lang={language}
            value={typedText}
            onChange={(event) => handleTypedChange(event.target.value)}
            onBlur={handleBlur}
            maxLength={1000}
            rows={3}
            placeholder={t("kiosk.voice.typePlaceholder")}
            className={cn(
              "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-base leading-relaxed sm:text-lg",
              "focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none",
              language === "hi" && "deva",
            )}
          />
          <button
            type="button"
            onClick={() => {
              handleBlur();
              setTyping(false);
            }}
            className="mt-2.5 inline-flex min-h-9 items-center gap-2 rounded-full border border-border px-4 text-xs font-semibold transition-colors hover:bg-muted sm:text-sm"
          >
            <Mic aria-hidden="true" className="size-4 text-primary" />
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.useVoice")}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 flex flex-col items-center gap-2 text-center sm:mt-4">
            <button
              type="button"
              onClick={() => (listening ? void voice.stop() : void voice.start())}
              disabled={working}
              aria-label={listening ? t("kiosk.voice.stopSpeaking") : t("kiosk.voice.speak")}
              className={cn(
                "relative inline-flex size-20 items-center justify-center rounded-full text-primary-foreground transition-transform duration-300 sm:size-22",
                "bg-primary shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70",
              )}
            >
              {working ? (
                <Loader2 aria-hidden="true" className="size-8 animate-spin sm:size-9" />
              ) : listening ? (
                <Square aria-hidden="true" className="size-7 sm:size-8" />
              ) : (
                <Mic aria-hidden="true" className="size-8 sm:size-9" />
              )}
              {listening && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border-4 border-primary/40"
                  style={{ transform: `scale(${1 + Math.min(voice.level, 1) * 0.35})` }}
                />
              )}
            </button>

            <p aria-live="polite" className="min-h-6 text-sm font-semibold sm:text-base">
              <span className={cn(language === "hi" && "deva")}>
                {listening
                  ? t("kiosk.voice.listeningNow")
                  : working
                    ? t("kiosk.voice.writing")
                    : shownAnswer
                      ? t("kiosk.voice.saved")
                      : t("kiosk.voice.speak")}
              </span>
            </p>

            <button
              type="button"
              onClick={() => {
                voice.reset();
                setTyping(true);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background px-4 text-xs font-semibold transition-colors hover:bg-muted sm:text-sm"
            >
              <Keyboard aria-hidden="true" className="size-4 text-primary" />
              <span className={cn(language === "hi" && "deva")}>
                {t("kiosk.voice.typeInstead")}
              </span>
            </button>

            {errorKey && (
              <KioskText
                tkey={errorKey}
                as="p"
                className="text-xs font-medium text-destructive sm:text-sm"
              />
            )}
            {playback.failed && (
              <KioskText
                tkey="kiosk.voice.playbackFailed"
                as="p"
                className="text-xs text-muted-foreground sm:text-sm"
              />
            )}
          </div>

          {shownAnswer && (
            <div className="mt-3 rounded-2xl border border-border bg-background px-4 py-3 text-left">
              <div className="flex items-center justify-between gap-3">
                <KioskText
                  tkey="kiosk.voice.yourAnswer"
                  as="p"
                  className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                />
                <button
                  type="button"
                  onClick={() => voice.reset()}
                  className="inline-flex min-h-8 items-center rounded-full border border-border px-3 text-xs font-semibold transition-colors hover:bg-muted"
                >
                  <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.again")}</span>
                </button>
              </div>
              <p
                lang={language}
                className={cn("mt-1.5 text-base font-medium leading-snug line-clamp-3 sm:text-lg", language === "hi" && "deva")}
              >
                {shownAnswer}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
