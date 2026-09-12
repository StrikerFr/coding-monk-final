import { useEffect, useState } from "react";
import { clinicianApi } from "@/features/clinician/api";
import type { PatientCase } from "@/features/clinician/types";
import { PatientCaseView } from "../PatientCaseView";
import { PatientOverviewSkeleton, ErrorState } from "../States";

export function PatientCasePage({ patientId }: { patientId: string }) {
  const [state, setState] = useState<{
    status: "loading" | "ready" | "missing";
    data?: PatientCase;
  }>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    clinicianApi.getPatientCase(patientId).then((data) => {
      if (!active) return;
      setState(data ? { status: "ready", data } : { status: "missing" });
    });
    return () => {
      active = false;
    };
  }, [patientId]);

  if (state.status === "loading") return <PatientOverviewSkeleton />;
  if (state.status === "missing" || !state.data) {
    return (
      <ErrorState
        title="Case not found."
        description="This case ID is not part of the demonstration data."
      />
    );
  }

  return <PatientCaseView patientCase={state.data} />;
}
