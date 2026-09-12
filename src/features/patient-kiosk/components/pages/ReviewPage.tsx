import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { StructuredDocumentView } from "@/components/documents/StructuredDocumentView";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { listEncounterFacts } from "@/lib/clinical/clinical.functions";
import { listEncounterDocumentReadings } from "@/lib/clinical/documents.functions";
import type { DocumentReading } from "@/lib/clinical/documents.types";
import type { AnswerRow, FactRow } from "@/lib/clinical/types";
import { patientKioskApi } from "@/features/patient-kiosk/api";
import { cn } from "@/lib/utils";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskStepNav } from "../KioskStepNav";
import { KioskSummarySection } from "../KioskSummarySection";
import { KioskText } from "../KioskText";

const PAPER_LABELS: Record<string, KioskTranslationKey> = {
  prescription: "kiosk.docs.prescription",
  reports: "kiosk.docs.reports",
  card: "kiosk.docs.card",
};

/** Plain groupings for the noted items, in the order a clinician reads them. */
const CATEGORY_LABELS: Record<string, string> = {
  SYMPTOM: "Symptoms",
  DURATION: "How long",
  PATTERN: "When it happens",
  MEDICATION: "Medicines",
  ALLERGY: "Allergies",
  PAST_HISTORY: "Earlier health",
  FAMILY_HISTORY: "Family health",
  DIET: "Food",
  LIFESTYLE: "Daily routine",
  AYUSH: "AYUSH details",
  VITAL: "Measurements",
  OTHER: "Other",
};

function cleanFactLabel(fact: FactRow): string {
  const value = fact.displayValue.trim() || fact.value.trim() || fact.field.trim();
  if (!value) return "Not provided";
  return value.charAt(0).toLocaleUpperCase() + value.slice(1);
}

/** Everything the clinician will read, shown back to the patient in full. */
export function ReviewPage() {
  const { session, tIn, language, t, completeSession } = useKiosk();
  const [failed, setFailed] = useState(false);
  const [facts, setFacts] = useState<FactRow[] | null>(null);
  const [readings, setReadings] = useState<DocumentReading[]>([]);
  const [asked, setAsked] = useState<AnswerRow[]>([]);
  const [storedVitals, setStoredVitals] = useState<Record<string, string>>({});
  const [storedPapers, setStoredPapers] = useState<string[]>([]);
  const profile = session?.profile ?? {};
  const getVital = (key: string): string => {
    const fromSession = session?.vitals?.[key]?.trim();
    if (fromSession) return fromSession;
    const fromStored = storedVitals[key]?.trim();
    if (fromStored) return fromStored;
    return "";
  };

  const vitals = {
    height: getVital("height"),
    weight: getVital("weight"),
    pulse: getVital("pulse"),
    temperature: getVital("temperature"),
  };
  const encounterId = session?.encounterId ?? null;
  const allPapers =
    session?.paperTypes && session.paperTypes.length > 0
      ? session.paperTypes
      : storedPapers;
  const papers =
    allPapers
      .map((id) => PAPER_LABELS[id])
      .filter((key): key is KioskTranslationKey => Boolean(key))
      .map((key) => tIn(language, key))
      .join(", ") || (readings.length > 0 ? tIn(language, "kiosk.docs.uploaded") : "");

  useEffect(() => {
    if (!encounterId) return;
    let active = true;
    void Promise.all([
      listEncounterFacts({ data: { encounterId } }).catch(() => [] as FactRow[]),
      listEncounterDocumentReadings({ data: { encounterId } }).catch(() => [] as DocumentReading[]),
    ]).then(([factRows, documentRows]) => {
      if (!active) return;
      setFacts(factRows.filter((fact) => fact.status !== "discarded"));
      setReadings(documentRows);
    });
    void patientKioskApi.listStoredAnswers().then((rows) => {
      if (!active) return;
      const skip = new Set(["name", "age", "gender", "phone", "height", "weight", "pulse", "temperature", "paperTypes"]);
      setAsked(rows.filter((row) => !skip.has(row.questionId) && row.transcript.trim().length > 0));

      const sv: Record<string, string> = {};
      for (const row of rows) {
        if (["height", "weight", "pulse", "temperature"].includes(row.questionId)) {
          if (row.transcript.trim()) {
            sv[row.questionId] = row.transcript.trim();
          }
        } else if (row.questionId === "paperTypes") {
          try {
            setStoredPapers(JSON.parse(row.transcript));
          } catch {
            /* ignore malformed json */
          }
        }
      }
      setStoredVitals(sv);
    });
    return () => {
      active = false;
    };
  }, [encounterId]);

  const groups = Object.entries(
    (facts ?? []).reduce<Record<string, FactRow[]>>((acc, fact) => {
      const key = CATEGORY_LABELS[fact.category] ? fact.category : "OTHER";
      const cleanLabel = cleanFactLabel(fact).toLocaleLowerCase();
      const duplicate = (acc[key] ?? []).some((existing) => {
        const existingLabel = cleanFactLabel(existing).toLocaleLowerCase();
        return existingLabel === cleanLabel || (existingLabel.length > 5 && cleanLabel.length > 5 && (existingLabel.includes(cleanLabel) || cleanLabel.includes(existingLabel)));
      });
      if (duplicate) return acc;
      (acc[key] ??= []).push(fact);
      return acc;
    }, {}),
  );

  return (
    <KioskStepContainer step={stepNumber("review")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.review.heading"
          as="h1"
          className="text-3xl font-semibold sm:text-4xl"
          secondaryClassName="text-xl font-normal"
        />
        <KioskText
          tkey="kiosk.review.support"
          as="p"
          className="mt-4 text-lg text-muted-foreground"
        />

        <div className="mt-8 space-y-6">
          <KioskSummarySection
            titleKey="kiosk.review.details"
            rows={[
              { labelKey: "kiosk.id.nameQuestion", value: profile["name"] ?? "" },
              { labelKey: "kiosk.id.age", value: profile["age"] ?? "" },
              { labelKey: "kiosk.id.phone", value: profile["phone"] ?? "" },
            ]}
          />
          <section className="rounded-4xl border border-border bg-surface px-6 py-6">
            <h2 className={cn("text-sm font-semibold uppercase tracking-wide", language === "hi" && "deva")}>
              {t("kiosk.review.asked")}
            </h2>
            {asked.length === 0 ? (
              <p className="mt-4 text-base text-muted-foreground">{t("kiosk.state.empty")}</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {asked.map((row) => (
                  <li key={row.id} className="rounded-2xl border border-border bg-background p-4">
                    <p className={cn("text-sm text-muted-foreground", language === "hi" && "deva")}>
                      {row.questionText}
                    </p>
                    <p className={cn("mt-1 text-lg font-semibold", language === "hi" && "deva")}>
                      {row.transcript}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {encounterId ? (
            <section className="rounded-4xl border border-border bg-surface px-6 py-6">
              <KioskText
                tkey="kiosk.review.structured"
                as="h2"
                className="text-sm font-semibold tracking-wide uppercase"
                secondaryClassName="text-xs font-normal tracking-normal normal-case"
              />
              <KioskText
                tkey="kiosk.review.structuredSupport"
                as="p"
                className="mt-2 text-base text-muted-foreground"
                secondaryClassName="text-sm"
              />

              {facts === null ? (
                <p className="mt-5 flex items-center gap-2 text-base text-muted-foreground">
                  <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                  {t("kiosk.review.loading")}
                </p>
              ) : groups.length === 0 ? (
                <KioskText
                  tkey="kiosk.review.structuredEmpty"
                  as="p"
                  className="mt-5 text-base text-muted-foreground"
                  secondaryClassName="text-sm"
                />
              ) : (
                <div className="mt-5 space-y-4">
                  {groups.map(([category, rows]) => (
                    <div
                      key={category}
                      className="rounded-2xl border border-border bg-background p-4"
                    >
                      <h3 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                        {CATEGORY_LABELS[category]}
                      </h3>
                      <ul className="mt-3 space-y-3">
                        {rows.map((fact) => (
                          <li
                            key={fact.id}
                            className="border-t border-border pt-3 first:border-t-0 first:pt-0"
                          >
                            <p className="text-[15px] font-semibold">{cleanFactLabel(fact)}</p>
                            {fact.sourceText ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                From what you said: “{fact.sourceText}”
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}

          <KioskSummarySection
            titleKey="kiosk.review.vitals"
            rows={[
              { labelKey: "kiosk.vitals.height", value: vitals["height"] ?? "" },
              { labelKey: "kiosk.vitals.weight", value: vitals["weight"] ?? "" },
              { labelKey: "kiosk.vitals.pulse", value: vitals["pulse"] ?? "" },
              { labelKey: "kiosk.vitals.temperature", value: vitals["temperature"] ?? "" },
            ]}
          />
          <KioskSummarySection
            titleKey="kiosk.review.papers"
            rows={[{ labelKey: "kiosk.docs.heading", value: papers }]}
          />

          {readings.map((reading) => (
            <section
              key={reading.document.id}
              className="rounded-4xl border border-border bg-surface px-6 py-6"
            >
              <h2 className="text-sm font-semibold tracking-wide uppercase">
                {reading.document.fileName}
              </h2>

              <KioskText
                tkey="kiosk.review.docText"
                as="h3"
                className="mt-4 text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                secondaryClassName="text-xs font-normal normal-case"
              />
              {reading.rawText?.trim() ? (
                <pre className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-border bg-background p-4 text-sm whitespace-pre-wrap">
                  {reading.rawText}
                </pre>
              ) : (
                <KioskText
                  tkey="kiosk.review.docNoText"
                  as="p"
                  className="mt-2 text-sm text-muted-foreground"
                  secondaryClassName="text-sm"
                />
              )}

              {reading.structured ? (
                <>
                  <KioskText
                    tkey="kiosk.review.docStructured"
                    as="h3"
                    className="mt-6 text-xs font-semibold tracking-wide uppercase text-muted-foreground"
                    secondaryClassName="text-xs font-normal normal-case"
                  />
                  <div className="mt-2">
                    <StructuredDocumentView body={reading.structured} />
                  </div>
                </>
              ) : null}
            </section>
          ))}
        </div>

        <KioskText
          tkey="kiosk.review.provenance"
          as="p"
          className="mt-8 rounded-3xl border border-border bg-surface px-6 py-5 text-base leading-relaxed text-muted-foreground"
        />

        {failed && (
          <KioskText
            tkey="kiosk.processing.failed"
            as="p"
            className="mt-6 text-base font-medium text-destructive"
          />
        )}

        <KioskStepNav
          stepId="review"
          continueKey="kiosk.review.finish"
          onContinue={async () => {
            const ok = await completeSession();
            setFailed(!ok);
            return ok;
          }}
        />
      </div>
    </KioskStepContainer>
  );
}
