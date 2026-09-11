import { useEffect, useState } from "react";
import { clinicianApi } from "@/features/clinician/api";
import type { WorklistPatient } from "@/features/clinician/types";
import { Worklist } from "../Worklist";
import { DemoDataNote } from "../StatusBadges";

export function WorklistPage() {
  const [patients, setPatients] = useState<WorklistPatient[] | null>(null);

  useEffect(() => {
    let active = true;
    clinicianApi.getWorklist().then((list) => active && setPatients(list));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[34px] font-semibold leading-tight tracking-tight">Worklist</h1>
        <p className="mt-1 text-[16px] text-muted-foreground">
          Cases prepared at the kiosk, waiting for clinical review.
        </p>
        <DemoDataNote className="mt-1" />
      </header>

      <Worklist patients={patients ?? []} loading={patients === null} title="All cases" />
    </div>
  );
}
