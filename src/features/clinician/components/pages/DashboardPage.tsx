import { useEffect, useState } from "react";
import { clinicianApi } from "@/features/clinician/api";
import type { DashboardMetrics, PatientCase, WorklistPatient } from "@/features/clinician/types";
import { useClinician } from "@/features/clinician/clinician-context";
import { MetricStrip } from "../MetricStrip";
import { NeedsAttention } from "../NeedsAttention";
import { Worklist } from "../Worklist";
import { DemoDataNote } from "../StatusBadges";
import { ErrorState } from "../States";
import { NextCasePreview } from "../NextCasePreview";

export function DashboardPage() {
  const { clinician } = useClinician();
  const [patients, setPatients] = useState<WorklistPatient[] | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [nextCase, setNextCase] = useState<PatientCase | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([clinicianApi.getWorklist(), clinicianApi.getMetrics()])
      .then(async ([list, m]) => {
        if (!active) return;
        setPatients(list);
        setMetrics(m);
        const nextPatient = list.find(
          (patient) => patient.priority !== "normal" && patient.status !== "completed",
        );
        if (nextPatient) {
          const preparedCase = await clinicianApi.getPatientCase(nextPatient.id);
          if (active) setNextCase(preparedCase);
        }
      })
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [attempt]);

  if (failed) {
    return (
      <ErrorState
        onRetry={() => {
          setFailed(false);
          setAttempt((a) => a + 1);
        }}
      />
    );
  }

  const attention = (patients ?? []).filter(
    (p) => p.priority !== "normal" && p.status !== "completed",
  );

  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="text-xs font-semibold uppercase text-primary">Clinical workspace</p>
          <h1 className="mt-1 text-[32px] font-semibold leading-tight sm:text-[38px]">
            {attention.length} cases need your attention
          </h1>
          <p className="mt-1 text-[16px] text-muted-foreground">
            Your active clinical queue for today. Review prepared cases before consultation.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{clinician.name}</p>
          <p className="text-xs text-muted-foreground">
            {clinician.department} · {clinician.role}
          </p>
          <DemoDataNote className="mt-1" />
        </div>
      </header>

      {metrics ? <MetricStrip metrics={metrics} /> : null}

      <NeedsAttention patients={attention} />

      <Worklist patients={patients ?? []} loading={patients === null} title="Your clinical queue" />

      {nextCase ? <NextCasePreview patientCase={nextCase} /> : null}
    </div>
  );
}
