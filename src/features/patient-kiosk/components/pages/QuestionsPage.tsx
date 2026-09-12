import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";
import { cn } from "@/lib/utils";
import type { ClinicalFollowUpQuestion } from "@/lib/clinical/types";

const FALLBACK: Record<"hi" | "en", string[]> = {
  en: [
    "When did this problem start, and how has it changed since then?",
    "What other symptoms have you noticed along with this problem?",
    "Are you taking any medicines, and do you have any medicine allergies?",
  ],
  hi: [
    "यह तकलीफ़ कब शुरू हुई, और तब से इसमें क्या बदलाव आया है?",
    "इस तकलीफ़ के साथ आपको और कौन से लक्षण महसूस हुए हैं?",
    "क्या आप कोई दवा ले रहे हैं, और क्या किसी दवा से एलर्जी है?",
  ],
};

function fallbackQuestions(language: "hi" | "en"): ClinicalFollowUpQuestion[] {
  return FALLBACK[language].map((text, index) => ({ id: `clinical-fallback-${index + 1}`, text }));
}

/** The spoken part of check-in: three questions, answered by speaking. */
export function QuestionsPage() {
  const { language, session, t, updateSession } = useKiosk();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(session?.answers ?? {});
  const [questions, setQuestions] = useState<ClinicalFollowUpQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);
  const hasLoadedRef = useRef<string | null>(null);

  const prepareQuestions = useCallback(async () => {
    setLoading(true);
    setUsedFallback(false);
    try {
      const prepared = await patientKioskApi.getClinicalFollowUps(undefined, language);
      setQuestions(prepared);
    } catch {
      setQuestions(fallbackQuestions(language));
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    const key = `${session?.encounterId}:${language}`;
    if (!session?.encounterId || hasLoadedRef.current === key) return;
    hasLoadedRef.current = key;
    void prepareQuestions();
  }, [session?.encounterId, language, prepareQuestions]);

  const question = questions[index];
  const isLast = index === questions.length - 1;

  const handleAnswer = useCallback(
    (text: string) => {
      if (!question || !text.trim()) return;
      setAnswers((current) => {
        if (current[question.id] === text) return current;
        const next = { ...current, [question.id]: text };
        void patientKioskApi.saveAnswer(question.id, text, "voice", question.text);
        return next;
      });
    },
    [question],
  );

  return (
    <KioskStepContainer step={stepNumber("questions")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.questions.heading"
          as="h1"
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText
          tkey="kiosk.questions.support"
          as="p"
          className="mt-1 text-sm sm:text-base leading-relaxed text-muted-foreground"
        />

        {loading && (
          <div role="status" aria-live="polite" className="mt-6 flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface px-6 py-10 text-center">
            <Loader2 aria-hidden="true" className="size-8 animate-spin text-primary" />
            <p className={cn("text-lg font-semibold", language === "hi" && "deva")}>
              {t("kiosk.questions.preparing")}
            </p>
          </div>
        )}

        {!loading && usedFallback && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted px-4 py-3">
            <p className={cn("text-sm text-muted-foreground", language === "hi" && "deva")}>
              {t("kiosk.questions.problem")}
            </p>
            <button
              type="button"
              onClick={() => void prepareQuestions()}
              className="min-h-10 rounded-full border border-border bg-background px-5 text-sm font-semibold hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.questions.retry")}</span>
            </button>
          </div>
        )}

        {question && (
          <>
            {questions.length > 1 && (
              <div className="mt-2.5 flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-medium">
                <span>{t("kiosk.nav.card", { current: index + 1, total: questions.length })}</span>
                <div className="flex gap-1.5" aria-hidden="true">
                  {questions.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 w-6 rounded-full transition-colors duration-300",
                        i <= index ? "bg-primary" : "bg-border",
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            <div key={question.id} className="animate-rise mt-2.5 sm:mt-3">
              <KioskVoiceAnswer
                key={question.id}
                questionText={question.text}
                answer={answers[question.id]}
                onAnswer={handleAnswer}
              />
            </div>

            {isLast ? (
              <KioskStepNav
                stepId="questions"
                canContinue={Boolean(answers[question.id])}
                note="kiosk.voice.note"
                onBack={index > 0 ? () => setIndex((c) => c - 1) : undefined}
                onContinue={async () => {
                  const currentAnswer = answers[question.id];
                  if (currentAnswer) {
                    await patientKioskApi.saveAnswer(question.id, currentAnswer, "voice", question.text);
                  }
                  await updateSession({ answers });
                }}
              />
            ) : (
              <KioskStepNav
                stepId="questions"
                continueKey="kiosk.questions.next"
                canContinue={Boolean(answers[question.id])}
                note="kiosk.voice.note"
                onBack={index > 0 ? () => setIndex((c) => c - 1) : undefined}
                onContinue={async () => {
                  const currentAnswer = answers[question.id];
                  if (currentAnswer) {
                    await patientKioskApi.saveAnswer(question.id, currentAnswer, "voice", question.text);
                  }
                  setIndex((current) => current + 1);
                  return false;
                }}
              />
            )}
          </>
        )}
      </div>
    </KioskStepContainer>
  );
}
