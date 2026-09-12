import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  FileText,
  Send,
  Stethoscope,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAssistedKiosk } from "@/features/assisted-kiosk/assisted-kiosk-context";
import type { AssistedPatient } from "@/features/assisted-kiosk/types";
import { PatientPreview } from "../PatientPreview";
import { PatientQueue, QueueControls } from "../PatientQueue";
import { PatientPreviewSkeleton, QueueError, QueueSkeleton } from "../AssistedStates";
import { StartIntakeDialog } from "../StartIntakeDialog";

export function AssistedQueuePage() {
  const {
    patients,
    visiblePatients,
    selectedPatient,
    filter,
    search,
    loading,
    error,
    actionPatientId,
    setFilter,
    setSearch,
    selectPatient,
    startIntake,
    retry,
  } = useAssistedKiosk();
  const [confirmPatient, setConfirmPatient] = useState<AssistedPatient | null>(null);
  const activePatients = useMemo(
    () => patients.filter((patient) => patient.status === "in-progress"),
    [patients],
  );
  const readyPatients = useMemo(
    () => patients.filter((patient) => patient.status === "ready"),
    [patients],
  );
  const completedPatients = useMemo(
    () => patients.filter((patient) => patient.status === "completed"),
    [patients],
  );
  const operationalSummary = [
    {
      label: "Waiting",
      value: patients.filter((patient) => patient.status === "waiting").length,
      icon: Clock3,
      detail: "Needs assistance",
      tone: "text-primary",
    },
    {
      label: "In progress",
      value: activePatients.length,
      icon: CircleDot,
      detail: "Being assisted",
      tone: "text-foreground",
    },
    {
      label: "Ready for handoff",
      value: readyPatients.length,
      icon: Send,
      detail: "Staff steps complete",
      tone: "text-accent-foreground",
    },
    {
      label: "Completed",
      value: completedPatients.length,
      icon: CheckCircle2,
      detail: "Today",
      tone: "text-muted-foreground",
    },
  ] as const;
  const confirmStart = async () => {
    if (!confirmPatient) return;
    await startIntake(confirmPatient.id);
    setConfirmPatient(null);
  };

  return (
    <div>
      <header className="flex flex-col gap-3 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Good morning.</p>
          <p className="mt-2 text-xs font-semibold uppercase text-primary">Assisted care</p>
          <h1 className="mt-1 text-[32px] font-semibold leading-tight sm:text-[38px]">
            Today’s patient queue
          </h1>
          <p className="mt-2 text-[15px] text-muted-foreground">
            Help patients complete their intake before consultation.
          </p>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          <span className="text-foreground">{operationalSummary[0].value} waiting</span> ·{" "}
          {activePatients.length} in progress · {readyPatients.length} ready
        </p>
      </header>

      <section
        aria-label="Today’s queue summary"
        className="grid border-b border-border sm:grid-cols-2 xl:grid-cols-4"
      >
        {operationalSummary.map((item, index) => (
          <div
            key={item.label}
            className={`flex min-h-24 items-center gap-4 py-4 sm:px-5 ${index > 0 ? "border-t border-border sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0" : ""}`}
          >
            <item.icon aria-hidden="true" className={`size-5 ${item.tone}`} />
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-2xl font-semibold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-7 grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section aria-labelledby="queue-title" className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 id="queue-title" className="text-[22px] font-semibold">
                Patient queue
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Synthetic records available for this assisted-care demonstration.
              </p>
            </div>
          </div>
          <QueueControls
            filter={filter}
            search={search}
            onFilter={setFilter}
            onSearch={setSearch}
          />
          <div className="bg-surface">
            {loading ? (
              <QueueSkeleton />
            ) : error ? (
              <QueueError onRetry={retry} />
            ) : (
              <PatientQueue
                patients={visiblePatients}
                selectedId={selectedPatient?.id ?? null}
                onSelect={selectPatient}
                onStart={setConfirmPatient}
              />
            )}
          </div>
        </section>
        <aside
          aria-label="Patient preview"
          className="self-start border border-border bg-surface p-5 xl:sticky xl:top-24"
        >
          {loading ? (
            <PatientPreviewSkeleton />
          ) : (
            <PatientPreview patient={selectedPatient} onStart={setConfirmPatient} />
          )}
        </aside>
      </div>

      <section className="mt-10 border-t border-border pt-7" aria-labelledby="active-intake-title">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Active intake</p>
            <h2 id="active-intake-title" className="mt-1 text-[22px] font-semibold">
              Continue where the patient left off
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">{activePatients.length} in progress</span>
        </div>
        <div className="mt-4 grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-2">
          {activePatients.length ? (
            activePatients.slice(0, 2).map((patient) => (
              <div key={patient.id} className="bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{patient.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {patient.age} · {patient.language}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                    <CircleDot className="size-4" />
                    In progress
                  </span>
                </div>
                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-medium">{patient.intakeProgress.label}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Step {patient.intakeProgress.step} of {patient.intakeProgress.total} · Started{" "}
                      {patient.intakeProgress.startedAt}
                    </p>
                  </div>
                  <Button asChild variant="outline" className="min-h-12 shrink-0">
                    <Link to="/assisted-kiosk/case-taking">
                      Continue <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <EmptyInline
              title="No active intake"
              body="No assisted intake is currently in progress."
            />
          )}
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <section aria-labelledby="handoff-title">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-accent-foreground">
                Ready for handoff
              </p>
              <h2 id="handoff-title" className="mt-1 text-[22px] font-semibold">
                Staff steps complete
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">{readyPatients.length} shown</span>
          </div>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {readyPatients.map((patient) => (
              <div
                key={patient.id}
                className="grid gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold">{patient.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {patient.age} · {patient.language} · {patient.intakeProgress.label}
                  </p>
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span className="flex items-center gap-1.5">
                      <Stethoscope className="size-4 text-secondary" />
                      Vitals {patient.vitalsStatus.toLowerCase()}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-4 text-secondary" />
                      {patient.documentCount} documents added
                    </span>
                  </p>
                </div>
                <Button asChild variant="outline" className="min-h-12">
                  <Link to="/assisted-kiosk/handoff">
                    Review handoff <ArrowRight />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Ready means staff preparation is complete. It does not mean a clinician has received the
            case.
          </p>
        </section>
        <section aria-labelledby="completed-title">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Completed today</p>
          <h2 id="completed-title" className="mt-1 text-[22px] font-semibold">
            Recently completed
          </h2>
          <div className="mt-4 divide-y divide-border border-y border-border">
            {completedPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between gap-3 py-4">
                <div>
                  <h3 className="font-semibold">{patient.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{patient.id}</p>
                </div>
                <p className="text-right text-sm">
                  <span className="block font-medium">Completed</span>
                  <span className="text-xs text-muted-foreground">{patient.completedAt}</span>
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StartIntakeDialog
        patient={confirmPatient}
        open={Boolean(confirmPatient)}
        loading={actionPatientId === confirmPatient?.id}
        onOpenChange={(open) => !open && setConfirmPatient(null)}
        onConfirm={confirmStart}
      />
    </div>
  );
}
function EmptyInline({ title, body }: { title: string; body: string }) {
  return (
    <div className="col-span-full bg-surface px-5 py-8 text-center">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
