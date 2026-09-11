import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, RefreshCw, Search, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { staffApi } from "@/features/assisted-kiosk/staff-api";
import type { EncounterRow } from "@/lib/clinical/types";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  StatusBadge,
  formatDateTime,
} from "../StaffUi";

type Filter = "all" | "ready-for-review" | "completed";

export function AssistedCompletedPage() {
  const [rows, setRows] = useState<EncounterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    staffApi
      .listEncounters()
      .then((all) => {
        if (!active) return;
        setRows(all.filter((row) => row.status !== "in-progress"));
        setFailed(null);
      })
      .catch((error: unknown) => active && setFailed(String((error as Error)?.message ?? error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter !== "all" && row.status !== filter) return false;
      if (!text) return true;
      return (
        row.patientName.toLowerCase().includes(text) ||
        row.id.toLowerCase().includes(text) ||
        (row.chiefComplaint ?? "").toLowerCase().includes(text)
      );
    });
  }, [rows, filter, query]);

  const ready = rows.filter((row) => row.status === "ready-for-review").length;
  const signed = rows.filter((row) => row.signedAt).length;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="A6 · Completed"
        title="Finished check-ins"
        description="Every check-in that is waiting for the doctor or already reviewed."
        icon={CheckCircle2}
        stats={[
          { label: "Total", value: rows.length },
          { label: "Awaiting doctor", value: ready },
          { label: "Signed reports", value: signed },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "all", label: "All" },
              { key: "ready-for-review", label: "Awaiting doctor" },
              { key: "completed", label: "Reviewed" },
            ] as const
          ).map((item) => (
            <Button
              key={item.key}
              size="sm"
              variant={filter === item.key ? "default" : "outline"}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, ID or concern"
              className="w-64 pl-9"
              aria-label="Search finished check-ins"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {failed ? <StaffError message={failed} /> : null}
      {loading ? <StaffLoading /> : null}

      {!loading && !failed && visible.length === 0 ? (
        <StaffEmpty
          title="Nothing here yet"
          body="Completed check-ins appear once a patient finishes at the kiosk."
        />
      ) : null}

      <div className="space-y-3">
        {visible.map((row) => (
          <Card key={row.id} className="border-border">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{row.patientName || "Patient"}</h2>
                  <StatusBadge status={row.status} />
                  <Badge variant="outline">{row.language === "hi" ? "हिंदी" : "English"}</Badge>
                  {row.signedAt ? <Badge variant="secondary">Report signed</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.chiefComplaint || "Concern not recorded"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Age {row.age || "—"} · {row.id} · Finished {formatDateTime(row.completedAt ?? row.startedAt)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <div className="hidden text-right sm:block">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Captured</p>
                  <p className="text-sm font-medium">
                    {row.answerCount} answers · {row.confirmedFactCount} details
                  </p>
                </div>
                <Button asChild variant="outline" className="min-h-11">
                  <Link to="/clinician/patients/$id" params={{ id: row.id }}>
                    <Send className="size-4" />
                    Open for doctor
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
