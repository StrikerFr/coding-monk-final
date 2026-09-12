import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BellRing, RefreshCw, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listRecentConfirmedFacts } from "@/lib/clinical/clinical.functions";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  formatDateTime,
} from "@/features/assisted-kiosk/components/StaffUi";

/** Fixed, non-diagnostic rules. Nothing here decides urgency for the clinician. */
const ATTENTION_TERMS = [
  "chest pain",
  "breathless",
  "shortness of breath",
  "bleeding",
  "fainting",
  "unconscious",
  "severe pain",
  "high fever",
];

type Fact = Awaited<ReturnType<typeof listRecentConfirmedFacts>>[number];

export function ClinicianAlertsPage() {
  const [facts, setFacts] = useState<Fact[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listRecentConfirmedFacts()
      .then((rows) => {
        if (!active) return;
        setFacts(rows);
        setFailed(null);
      })
      .catch((error: unknown) => active && setFailed(String((error as Error)?.message ?? error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const flagged = useMemo(
    () =>
      facts
        .map((fact) => {
          const haystack = `${fact.value} ${fact.displayValue} ${fact.sourceText}`.toLowerCase();
          const term = ATTENTION_TERMS.find((item) => haystack.includes(item));
          return term ? { fact, term } : null;
        })
        .filter((item): item is { fact: Fact; term: string } => item !== null),
    [facts],
  );

  const uncertain = useMemo(
    () => facts.filter((fact) => fact.certainty === "UNCERTAIN").slice(0, 20),
    [facts],
  );

  const open = flagged.filter((item) => item.fact.encounterStatus !== "completed").length;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Clinical workspace"
        title="Alerts"
        description="Items flagged by fixed check-in rules from what patients said themselves."
        icon={BellRing}
        stats={[
          { label: "Flagged", value: flagged.length },
          { label: "Still open", value: open },
          { label: "Needs clarity", value: uncertain.length },
        ]}
      />

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      {failed ? <StaffError message={failed} /> : null}
      {loading ? <StaffLoading /> : null}

      {!loading && !failed && flagged.length === 0 && uncertain.length === 0 ? (
        <StaffEmpty
          title="Nothing flagged"
          body="Reported symptoms that match the clinic's attention rules will appear here."
        />
      ) : null}

      {flagged.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Flagged by check-in rules
          </h2>
          {flagged.map(({ fact, term }) => (
            <Card key={fact.id} className="border-destructive/40 bg-destructive/5">
              <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
                  <div>
                    <p className="font-medium">
                      {fact.patientName || "Patient"} reported {fact.displayValue}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">“{fact.sourceText}”</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Matches the “{term}” rule · {formatDateTime(fact.createdAt)} · Clinical
                      judgement required
                    </p>
                  </div>
                </div>
                <Button asChild variant="outline" className="shrink-0">
                  <Link to="/clinician/patients/$id" params={{ id: fact.encounterId }}>
                    Open case
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      {uncertain.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Worth confirming with the patient
          </h2>
          {uncertain.map((fact) => (
            <Card key={fact.id} className="border-border">
              <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{fact.displayValue}</p>
                    <Badge variant="outline">Unclear</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {fact.patientName || "Patient"} · “{fact.sourceText}”
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to="/clinician/patients/$id" params={{ id: fact.encounterId }}>
                    Review
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}
    </div>
  );
}
