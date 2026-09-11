import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock3, MessageSquareText, PlayCircle, RefreshCw, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { staffApi } from "@/features/assisted-kiosk/staff-api";
import type { AnswerRow, EncounterDetail, EncounterRow } from "@/lib/clinical/types";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  StatusBadge,
  formatDateTime,
  minutesSince,
} from "../StaffUi";

export function AssistedActiveIntakePage() {
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    staffApi
      .listEncounters()
      .then((rows) => {
        if (!active) return;
        const live = rows.filter((row) => row.status === "in-progress");
        setEncounters(live);
        setSelectedId((current) => current ?? live[0]?.id ?? null);
        setFailed(null);
      })
      .catch((error: unknown) => active && setFailed(String((error as Error)?.message ?? error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    staffApi
      .getEncounter(selectedId)
      .then((value) => active && setDetail(value))
      .catch(() => active && setDetail(null));
    return () => {
      active = false;
    };
  }, [selectedId, reloadKey]);

  const answers: AnswerRow[] = useMemo(() => detail?.answers ?? [], [detail]);

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="A3 · Active intake"
        title="Check-ins happening right now"
        description="Live progress of every patient currently completing their check-in."
        icon={PlayCircle}
        stats={[
          { label: "Active", value: encounters.length },
          { label: "Answers captured", value: answers.length },
          { label: "Updated", value: formatDateTime(new Date().toISOString()) },
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

      {!loading && !failed && encounters.length === 0 ? (
        <StaffEmpty
          title="No check-in is in progress"
          body="When a patient starts a check-in at the kiosk, their progress appears here."
        />
      ) : null}

      {!loading && encounters.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <div className="space-y-3">
            {encounters.map((encounter) => {
              const waited = minutesSince(encounter.startedAt);
              const active = encounter.id === selectedId;
              return (
                <button
                  key={encounter.id}
                  type="button"
                  onClick={() => setSelectedId(encounter.id)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    active
                      ? "border-primary bg-primary-soft/40"
                      : "border-border bg-surface hover:bg-surface-sunken"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{encounter.patientName || "New patient"}</span>
                    <Badge variant="outline">{encounter.language === "hi" ? "हिंदी" : "English"}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {encounter.chiefComplaint || "Concern not described yet"}
                  </p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock3 className="size-3.5" />
                    Started {formatDateTime(encounter.startedAt)}
                    {waited !== null ? ` · ${waited} min ago` : ""}
                  </p>
                </button>
              );
            })}
          </div>

          <Card className="border-border">
            <CardContent className="space-y-5 p-6">
              {detail ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-surface-sunken">
                        <User className="size-5 text-muted-foreground" />
                      </span>
                      <div>
                        <p className="font-semibold">{detail.encounter.patientName || "New patient"}</p>
                        <p className="text-sm text-muted-foreground">
                          Age {detail.encounter.age || "—"} · {detail.encounter.id}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={detail.encounter.status} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Answers" value={detail.answers.length} />
                    <Stat label="Confirmed details" value={detail.facts.filter((f) => f.status === "confirmed").length} />
                    <Stat label="Documents reviewed" value={detail.audit.filter((a) => a.action.includes("document")).length} />
                  </div>

                  <div>
                    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <MessageSquareText className="size-4" />
                      What the patient has said
                    </h2>
                    {answers.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">
                        Nothing recorded yet for this check-in.
                      </p>
                    ) : (
                      <ol className="mt-3 space-y-3">
                        {answers.map((answer) => (
                          <li key={answer.id} className="rounded-lg border border-border bg-surface p-4">
                            <p className="text-sm font-medium">{answer.questionText}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{answer.transcript}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              {answer.source === "voice" ? "Spoken" : "Typed"} ·{" "}
                              {formatDateTime(answer.createdAt)}
                            </p>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <Button asChild variant="outline" className="min-h-11">
                    <Link to="/clinician/patients/$id" params={{ id: detail.encounter.id }}>
                      Open full record
                    </Link>
                  </Button>
                </>
              ) : (
                <StaffLoading rows={2} />
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
    </div>
  );
}
