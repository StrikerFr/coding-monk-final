import {
  ArrowRight,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Languages,
  Stethoscope,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import type { AssistedPatient } from "@/features/assisted-kiosk/types";
import { QueueStatus } from "./QueueStatus";
import { QueueEmpty } from "./AssistedStates";
export function PatientPreview({
  patient,
  onStart,
}: {
  patient: AssistedPatient | null;
  onStart: (patient: AssistedPatient) => void;
}) {
  if (!patient)
    return (
      <QueueEmpty
        title="Select a patient"
        description="Choose a queue row to see the assisted-intake status."
      />
    );
  const action =
    patient.status === "waiting" ? (
      <Button className="mt-6 min-h-12 w-full" onClick={() => onStart(patient)}>
        Start assisted intake <ArrowRight />
      </Button>
    ) : patient.status === "in-progress" ? (
      <Button asChild className="mt-6 min-h-12 w-full">
        <Link to="/assisted-kiosk/case-taking">
          Continue intake <ArrowRight />
        </Link>
      </Button>
    ) : patient.status === "ready" ? (
      <Button asChild className="mt-6 min-h-12 w-full">
        <Link to="/assisted-kiosk/handoff">
          Review handoff <ArrowRight />
        </Link>
      </Button>
    ) : null;
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-primary">Selected patient</p>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-semibold">{patient.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {patient.age} years · {patient.language}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{patient.id} · Synthetic record</p>
        </div>
        <QueueStatus status={patient.status} compact />
      </div>
      <dl className="mt-6 divide-y divide-border border-y border-border">
        <PreviewLine
          icon={ClipboardCheck}
          label="Intake"
          value={
            patient.intakeProgress.step
              ? `${patient.intakeProgress.label} · Step ${patient.intakeProgress.step} of ${patient.intakeProgress.total}`
              : "Not started"
          }
        />
        <PreviewLine icon={Stethoscope} label="Vitals" value={patient.vitalsStatus} />
        <PreviewLine icon={FileText} label="Documents" value={`${patient.documentCount} added`} />
        <PreviewLine icon={HeartHandshake} label="Assistance" value={patient.assistance} />
        <PreviewLine icon={Languages} label="Language" value={patient.language} />
      </dl>
      {action}
      <p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        <strong className="text-foreground">Patient information is private.</strong>
        <br />
        Only access information needed for the current intake.
      </p>
    </div>
  );
}
function PreviewLine({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="grid min-h-12 grid-cols-[20px_minmax(72px,auto)_minmax(0,1fr)] items-center gap-2 py-2.5 text-sm">
      <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-medium leading-snug">{value}</dd>
    </div>
  );
}
