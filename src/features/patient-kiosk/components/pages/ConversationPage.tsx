import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { stepNumber } from "@/features/patient-kiosk/session";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";
import { cn } from "@/lib/utils";

type Turn = { id: string; question: string; answer: string };

/**
 * The talk-only check-in. The assistant asks one question at a time, the
 * patient answers by speaking, and every turn is stored on the same record the
 * clinician reads.
 */
export function ConversationPage() {
  const { language, session, t, updateSession } = useKiosk();
  const navigate = useNavigate();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState<{ id: string; text: string } | null>(null);
  const [state, setState] = useState<"thinking" | "asking" | "failed" | "done">("thinking");
  const asked = useRef(0);

  const ask = useCallback(
    async (history: Turn[]) => {
      setState("thinking");
      try {
        const next = await patientKioskApi.getInterviewQuestion(
          history.map((turn) => ({ question: turn.question, answer: turn.answer })),
        );
        if (next.done || asked.current >= 12) {
          setQuestion(null);
          setState("done");
          return;
        }
        asked.current += 1;
        const id =
          next.field === "name" || next.field === "age"
            ? next.field
            : `talk-${String(asked.current).padStart(2, "0")}`;
        setQuestion({ id, text: next.question });
        setState("asking");
      } catch {
        setState("failed");
      }
    },
    [],
  );

  useEffect(() => {
    if (!session?.encounterId || asked.current > 0) return;
    void ask([]);
  }, [session?.encounterId, ask]);

  const answer = (text: string) => {
    if (!question || !text.trim()) return;
    const turn: Turn = { id: question.id, question: question.text, answer: text.trim() };
    const history = [...turns.filter((entry) => entry.id !== turn.id), turn];
    setTurns(history);
    void patientKioskApi.saveAnswer(turn.id, turn.answer, "voice", turn.question);
    void ask(history);
  };

  const finish = async () => {
    updateSession({});
    await patientKioskApi.saveSession().catch(() => null);
    void navigate({ to: "/patient-kiosk/documents" });
  };

  return (
    <KioskStepContainer step={stepNumber("case-taking")} progress="quiet">
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.talk.heading"
          as="h1"
          className="text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.talk.support"
          as="p"
          className="mt-4 text-lg text-muted-foreground"
        />

        {turns.length > 0 && (
          <section className="mt-8 rounded-3xl border border-border bg-muted px-6 py-5">
            <h2 className={cn("text-sm font-semibold uppercase tracking-wide text-muted-foreground", language === "hi" && "deva")}>
              {t("kiosk.talk.answered")}
            </h2>
            <ul className="mt-4 space-y-4">
              {turns.map((turn) => (
                <li key={turn.id}>
                  <p className={cn("text-base text-muted-foreground", language === "hi" && "deva")}>
                    {turn.question}
                  </p>
                  <p className={cn("text-lg font-semibold", language === "hi" && "deva")}>
                    {turn.answer}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {state === "thinking" && (
          <div
            role="status"
            aria-live="polite"
            className="mt-8 flex items-center justify-center gap-3 rounded-3xl border border-border bg-surface px-6 py-12"
          >
            <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary" />
            <span className={cn("text-xl font-semibold", language === "hi" && "deva")}>
              {t("kiosk.talk.thinking")}
            </span>
          </div>
        )}

        {state === "failed" && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface px-6 py-6">
            <p className={cn("text-lg", language === "hi" && "deva")}>{t("kiosk.talk.problem")}</p>
            <button
              type="button"
              onClick={() => void ask(turns)}
              className="min-h-14 rounded-full border border-border bg-background px-6 text-base font-semibold hover:bg-muted"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.talk.retry")}</span>
            </button>
          </div>
        )}

        {state === "asking" && question && (
          <div className="mt-8">
            <KioskVoiceAnswer
              key={question.id}
              questionText={question.text}
              answer={turns.find((turn) => turn.id === question.id)?.answer}
              onAnswer={answer}
            />
          </div>
        )}

        {state === "done" && (
          <div className="mt-8 rounded-3xl border border-border bg-surface px-6 py-10 text-center">
            <p className={cn("text-2xl font-semibold", language === "hi" && "deva")}>
              {t("kiosk.talk.done")}
            </p>
            <button
              type="button"
              onClick={() => void finish()}
              className="mt-8 inline-flex min-h-16 items-center rounded-full bg-primary px-10 text-xl font-semibold text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
            >
              <span className={cn(language === "hi" && "deva")}>{t("kiosk.talk.continue")}</span>
            </button>
          </div>
        )}

        <Link
          to="/patient-kiosk/consent"
          className="mt-8 inline-flex min-h-14 items-center rounded-full border border-border bg-background px-6 text-base font-semibold transition-colors hover:bg-muted"
        >
          <span className={cn(language === "hi" && "deva")}>{t("kiosk.talk.stepForm")}</span>
        </Link>
      </div>
    </KioskStepContainer>
  );
}
