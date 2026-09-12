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
    <section className="rounded-4xl border border-border bg-surface px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-6">
        {questionKey ? (
          <KioskText
            tkey={questionKey}
            as="h2"
            className="max-w-2xl text-2xl font-semibold sm:text-3xl"
            secondaryClassName="text-lg font-normal"
          />
        ) : (
          <h2 lang={language} className={cn("max-w-2xl text-2xl font-semibold sm:text-3xl", language === "hi" && "deva")}>
            {questionText}
          </h2>
        )}
        <button
          type="button"
          onClick={() =>
            playback.isSpeaking ? playback.stop() : void playback.speak(questionText, questionId)
          }
          className="inline-flex min-h-14 items-center gap-3 rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
        >
          <Volume2 aria-hidden="true" className="size-5 text-primary" />
          <span className={cn(language === "hi" && "deva")}>
            {playback.isSpeaking ? t("kiosk.voice.stopListening") : t("kiosk.voice.listen")}
          </span>
        </button>
      </div>

      {typing ? (
        <div className="mt-8 text-left">
          <label
            htmlFor={`typed-${questionId}`}
            className={cn("text-lg font-semibold", language === "hi" && "deva")}
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
            rows={4}
            placeholder={t("kiosk.voice.typePlaceholder")}
            className={cn(
              "mt-4 w-full rounded-3xl border border-border bg-background px-5 py-4 text-xl leading-relaxed",
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
            className="mt-5 inline-flex min-h-12 items-center gap-3 rounded-full border border-border px-6 text-base font-semibold transition-colors hover:bg-muted"
          >
            <Mic aria-hidden="true" className="size-5 text-primary" />
            <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.useVoice")}</span>
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 flex flex-col items-center gap-5 text-center">
            <button
              type="button"
              onClick={() => (listening ? void voice.stop() : void voice.start())}
              disabled={working}
              aria-label={listening ? t("kiosk.voice.stopSpeaking") : t("kiosk.voice.speak")}
              className={cn(
                "relative inline-flex size-28 items-center justify-center rounded-full text-primary-foreground transition-transform duration-300",
                "bg-primary shadow-[var(--shadow-lift)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70",
              )}
            >
              {working ? (
                <Loader2 aria-hidden="true" className="size-10 animate-spin" />
              ) : listening ? (
                <Square aria-hidden="true" className="size-9" />
              ) : (
                <Mic aria-hidden="true" className="size-10" />
              )}
              {listening && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full border-4 border-primary/40"
                  style={{ transform: `scale(${1 + Math.min(voice.level, 1) * 0.35})` }}
                />
              )}
            </button>

            <p aria-live="polite" className="min-h-8 text-lg font-semibold">
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
              className="inline-flex min-h-12 items-center gap-3 rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
            >
              <Keyboard aria-hidden="true" className="size-5 text-primary" />
              <span className={cn(language === "hi" && "deva")}>
                {t("kiosk.voice.typeInstead")}
              </span>
            </button>

            {errorKey && (
              <KioskText
                tkey={errorKey}
                as="p"
                className="text-base font-medium text-destructive"
              />
            )}
            {playback.failed && (
              <KioskText
                tkey="kiosk.voice.playbackFailed"
                as="p"
                className="text-base text-muted-foreground"
              />
            )}
          </div>

          {shownAnswer && (
            <div className="mt-8 rounded-3xl border border-border bg-background px-6 py-6 text-left">
              <KioskText
                tkey="kiosk.voice.yourAnswer"
                as="p"
                className="text-sm font-semibold tracking-wide uppercase"
              />
              <p
                lang={language}
                className={cn("mt-3 text-xl leading-relaxed", language === "hi" && "deva")}
              >
                {shownAnswer}
              </p>
              <button
                type="button"
                onClick={() => voice.reset()}
                className="mt-5 inline-flex min-h-12 items-center rounded-full border border-border px-6 text-base font-semibold transition-colors hover:bg-muted"
              >
                <span className={cn(language === "hi" && "deva")}>{t("kiosk.voice.again")}</span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
