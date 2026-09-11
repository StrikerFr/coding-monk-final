import { ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppLanguage } from "@/lib/a11y";
import { speakable } from "@/components/a11y";
import type { AssistedPatient, AssistedQueueFilter } from "@/features/assisted-kiosk/types";
import { cn } from "@/lib/utils";
import { QueueStatus } from "./QueueStatus";
import { QueueEmpty } from "./AssistedStates";
const filters: Array<{ value: AssistedQueueFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "waiting", label: "Waiting" },
  { value: "in-progress", label: "In Progress" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
];
export function QueueControls({
  filter,
  search,
  onFilter,
  onSearch,
}: {
  filter: AssistedQueueFilter;
  search: string;
  onFilter: (value: AssistedQueueFilter) => void;
  onSearch: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-y border-border py-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Filter queue">
        {filters.map((item) => (
          <Button
            key={item.value}
            variant="ghost"
            aria-pressed={filter === item.value}
            className={cn(
              "min-h-12 shrink-0 px-4",
              filter === item.value && "bg-primary-soft/55 text-foreground",
            )}
            onClick={() => onFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <label className="relative block w-full xl:max-w-xs">
        <span className="sr-only">Search patient by name, demo ID, or status</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search patient"
          className="h-12 w-full rounded-md border border-border bg-surface pl-11 pr-4 text-sm focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      </label>
    </div>
  );
}
export function PatientQueue({
  patients,
  selectedId,
  onSelect,
  onStart,
}: {
  patients: AssistedPatient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStart: (patient: AssistedPatient) => void;
}) {
  const { language } = useAppLanguage();
  const summary = (patient: AssistedPatient) =>
    language === "hi"
      ? `${patient.name}, उम्र ${patient.age} वर्ष, ${patient.language}, ${patient.waitMinutes} मिनट से प्रतीक्षा`
      : `${patient.name}, age ${patient.age}, ${patient.language}, waiting for ${patient.waitMinutes} minutes`;

  if (!patients.length)
    return (
      <QueueEmpty title="No matching patients" description="Try another queue filter or search." />
    );
  return (
    <div className="overflow-hidden border-x border-b border-border">
      <div className="hidden grid-cols-[minmax(190px,1fr)_110px_76px_minmax(148px,0.75fr)_116px] items-center gap-3 border-b border-border bg-surface-sunken/45 px-5 py-3 text-xs font-semibold uppercase text-muted-foreground md:grid">
        <span>Patient</span>
        <span className="text-center">Language</span>
        <span className="text-center">Wait</span>
        <span className="text-center">Status</span>
        <span className="text-right">Action</span>
      </div>
      <ul className="divide-y divide-border">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className={cn(
              "transition-colors hover:bg-surface-sunken",
              selectedId === patient.id && "bg-primary-soft/25",
            )}
          >
            <div className="hidden min-h-20 grid-cols-[minmax(190px,1fr)_110px_76px_minmax(148px,0.75fr)_116px] items-center gap-3 px-5 md:grid">
              <button
                type="button"
                onClick={() => onSelect(patient.id)}
                {...speakable(summary(patient))}
                className="min-h-12 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="block text-[17px] font-semibold">{patient.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {patient.age} years · {patient.id}
                </span>
              </button>
              <span className="text-center text-sm">{patient.language}</span>
              <span className="text-center text-sm font-medium tabular-nums">
                {patient.status === "waiting" ? `${patient.waitMinutes} min` : "—"}
              </span>
              <span className="flex min-w-0 justify-center">
                <QueueStatus status={patient.status} compact className="w-full justify-center" />
              </span>
              <RowAction patient={patient} onSelect={onSelect} onStart={onStart} />
            </div>
            <button
              type="button"
              onClick={() => onSelect(patient.id)}
              {...speakable(summary(patient))}
              className="w-full px-1 py-4 text-left md:hidden"
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-lg font-semibold">{patient.name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {patient.age} · {patient.language} · {patient.id}
                  </span>
                </span>
                <QueueStatus status={patient.status} compact />
              </span>
              <span className="mt-3 flex items-center justify-between text-sm">
                <span>
                  {patient.status === "waiting"
                    ? `Waiting ${patient.waitMinutes} min`
                    : patient.intakeProgress.label}
                </span>
                <span className="font-semibold text-primary">
                  View <ArrowRight className="inline size-4" />
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
function RowAction({
  patient,
  onSelect,
  onStart,
}: {
  patient: AssistedPatient;
  onSelect: (id: string) => void;
  onStart: (patient: AssistedPatient) => void;
}) {
  if (patient.status === "waiting")
    return (
      <Button
        size="sm"
        className="min-h-11 w-[116px] justify-between px-3"
        onClick={() => {
          onSelect(patient.id);
          onStart(patient);
        }}
      >
        Start intake <ArrowRight />
      </Button>
    );
  return (
    <Button
      size="sm"
      variant="outline"
      className="min-h-11 w-[116px] justify-between px-3"
      onClick={() => onSelect(patient.id)}
    >
      View <ArrowRight />
    </Button>
  );
}
