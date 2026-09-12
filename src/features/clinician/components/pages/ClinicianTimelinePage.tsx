import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { History, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listRecentActivity } from "@/lib/clinical/clinical.functions";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  formatDateTime,
} from "@/features/assisted-kiosk/components/StaffUi";

type Event = Awaited<ReturnType<typeof listRecentActivity>>[number];

const ACTION_LABELS: Record<string, string> = {
  ENCOUNTER_STARTED: "Check-in started",
  ANSWER_RECORDED: "Answer recorded",
  ANSWER_CONFIRMED: "Answer confirmed",
  INTAKE_COMPLETED: "Check-in finished",
  SUMMARY_GENERATED: "Draft prepared",
  SUMMARY_SAVED: "Draft edited by clinician",
  SUMMARY_SIGNED: "Report signed",
  DOCUMENT_UPLOADED: "Document uploaded",
  DOCUMENT_PROCESSED: "Document read",
  DOCUMENT_VIEWED: "Document opened",
};

const label = (action: string) =>
  ACTION_LABELS[action] ?? action.toLowerCase().replace(/_/g, " ");

const dayOf = (value: string) => {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);
};

export function ClinicianTimelinePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listRecentActivity()
      .then((rows) => {
        if (!active) return;
        setEvents(rows);
        setFailed(null);
      })
      .catch((error: unknown) => active && setFailed(String((error as Error)?.message ?? error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const groups = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const event of events) {
      const key = dayOf(event.createdAt);
      map.set(key, [...(map.get(key) ?? []), event]);
    }
    return [...map.entries()];
  }, [events]);

  const signed = events.filter((event) => event.action === "SUMMARY_SIGNED").length;
  const started = events.filter((event) => event.action === "ENCOUNTER_STARTED").length;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Clinical workspace"
        title="Timeline"
        description="Everything that happened during recent kiosk sessions, newest first."
        icon={History}
        stats={[
          { label: "Events", value: events.length },
          { label: "Check-ins started", value: started },
          { label: "Reports signed", value: signed },
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
      {!loading && !failed && events.length === 0 ? (
        <StaffEmpty title="No activity yet" body="Kiosk sessions will be recorded here as they happen." />
      ) : null}

      <div className="space-y-8">
        {groups.map(([day, items]) => (
          <section key={day}>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {day}
            </h2>
            <div className="mt-3 space-y-3 border-l border-border pl-5">
              {items.map((event) => (
                <Card key={event.id} className="relative border-border">
                  <span className="absolute -left-[27px] top-6 size-2.5 rounded-full bg-primary" />
                  <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{label(event.action)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.patientName || event.patientId || "Unknown patient"} · by {event.actor}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(event.createdAt)}
                      </p>
                    </div>
                    {event.encounterId ? (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/clinician/patients/$id" params={{ id: event.encounterId }}>
                          Open case
                        </Link>
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
