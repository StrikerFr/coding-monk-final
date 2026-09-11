import { Link } from "@tanstack/react-router";
import { useAppLanguage } from "@/lib/a11y";
import { speakable } from "@/components/a11y";
import { ArrowRight, ArrowUpDown, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorklistPatient, WorklistSort } from "@/features/clinician/types";
import { filterWorklist, useWorklistControls } from "@/features/clinician/use-worklist";
import { CaseStatusBadge, PriorityBadge } from "./StatusBadges";
import { EmptyState, WorklistSkeleton } from "./States";

const sortLabels: Record<WorklistSort, string> = {
  priority: "Priority",
  "waiting-desc": "Waiting time",
  "waiting-asc": "Shortest wait",
  name: "Patient name",
};

export function Worklist({
  patients,
  loading = false,
  title = "Worklist",
  selectedId,
}: {
  patients: WorklistPatient[];
  loading?: boolean;
  title?: string;
  selectedId?: string;
}) {
  const { filters, sort, setSort, setFilter, resetFilters, isFiltered } = useWorklistControls();
  const { language } = useAppLanguage();
  const rows = filterWorklist(patients, filters, sort);

  return (
    <section
      aria-labelledby="worklist-heading"
      className="overflow-hidden rounded-lg border border-border bg-surface"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Prepared patient cases
          </p>
          <div className="mt-1 flex items-center gap-2">
            <h2 id="worklist-heading" className="text-xl font-semibold">
              {title}
            </h2>
            <span className="text-sm text-muted-foreground tabular-nums">
              {rows.length} of {patients.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-sunken/35 px-5 py-3">
        <div className="relative">
          <label htmlFor="worklist-search" className="sr-only">
            Filter worklist
          </label>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="worklist-search"
            type="search"
            value={filters.query}
            onChange={(event) => setFilter("query", event.target.value)}
            placeholder="Filter by patient or concern"
            className="h-9 w-60 rounded-md border border-border bg-surface pl-8 pr-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <Select
          value={filters.priority}
          onValueChange={(value) => setFilter("priority", value as typeof filters.priority)}
        >
          <SelectTrigger
            className="h-9 w-[138px] rounded-md bg-surface"
            aria-label="Filter by priority"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => setFilter("status", value as typeof filters.status)}
        >
          <SelectTrigger
            className="h-9 w-[154px] rounded-md bg-surface"
            aria-label="Filter by status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="ready">Ready for review</SelectItem>
            <SelectItem value="in-progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.language}
          onValueChange={(value) => setFilter("language", value as typeof filters.language)}
        >
          <SelectTrigger
            className="h-9 w-[136px] rounded-md bg-surface"
            aria-label="Filter by language"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All languages</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
            <SelectItem value="English">English</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(value) => setSort(value as WorklistSort)}>
          <SelectTrigger className="h-9 w-[158px] rounded-md bg-surface" aria-label="Sort worklist">
            <ArrowUpDown aria-hidden="true" className="size-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {isFiltered() && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <WorklistSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState
          title={isFiltered() ? "No matching cases" : "No patients waiting"}
          description={
            isFiltered()
              ? "Adjust or clear the filters to see more cases."
              : "Your worklist is clear."
          }
          icon={isFiltered() ? "inbox" : "clear"}
          action={
            isFiltered() ? (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Patients prepared at the kiosk and waiting for clinical review
              </caption>
              <thead>
                <tr className="border-b border-border bg-surface-sunken/45 text-xs uppercase text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-semibold">
                    Patient
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Chief concern
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Waiting
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Priority
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((patient) => (
                  <tr
                    key={patient.id}
                    aria-selected={selectedId === patient.id}
                    {...speakable(
                      language === "hi"
                        ? `${patient.name}, उम्र ${patient.age} वर्ष, ${patient.waitingMinutes} मिनट से प्रतीक्षा`
                        : `${patient.name}, age ${patient.age}, waiting for ${patient.waitingMinutes} minutes`,
                    )}
                    className={
                      "text-[15px] transition-colors hover:bg-surface-sunken/65 " +
                      (selectedId === patient.id ? "bg-surface-sunken" : "")
                    }
                  >
                    <th scope="row" className="px-5 py-3.5 text-left font-semibold text-[16px]">
                      <span className="flex items-center gap-2">
                        {patient.name}
                        {patient.alertCount > 0 && (
                          <span
                            className="inline-flex items-center gap-1 rounded border border-primary/35 bg-primary/10 px-1.5 py-0.5 text-[12px] font-medium text-primary"
                            title={`${patient.alertCount} item(s) need attention`}
                          >
                            <Bell aria-hidden="true" className="size-3" />
                            {patient.alertCount}
                          </span>
                        )}
                      </span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {patient.age} · {patient.language} · {patient.caseId}
                      </span>
                    </th>
                    <td className="px-4 py-3.5 font-medium">{patient.chiefConcern}</td>
                    <td className="px-4 py-3.5 tabular-nums">{patient.waitingMinutes} min</td>
                    <td className="px-4 py-3.5">
                      <CaseStatusBadge status={patient.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={patient.priority} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        to="/clinician/patients/$id"
                        params={{ id: patient.id }}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-primary transition-all hover:bg-primary/10 active:translate-y-px"
                      >
                        Review
                        <ArrowRight aria-hidden="true" className="size-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile / tablet cards */}
          <ul className="divide-y divide-border md:hidden">
            {rows.map((patient) => (
              <li key={patient.id} className="px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[16px] font-semibold">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.age} years · {patient.language} · {patient.caseId}
                    </p>
                  </div>
                  <PriorityBadge priority={patient.priority} />
                </div>
                <p className="mt-2 text-[15px]">{patient.chiefConcern}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CaseStatusBadge status={patient.status} />
                  <span className="text-sm text-muted-foreground tabular-nums">
                    Waiting {patient.waitingMinutes} min
                  </span>
                  <Link
                    to="/clinician/patients/$id"
                    params={{ id: patient.id }}
                    className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-sm font-medium"
                  >
                    Review
                    <ArrowRight aria-hidden="true" className="size-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
