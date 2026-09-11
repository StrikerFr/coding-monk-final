import { useMemo, useState } from "react";
import type { WorklistFilters, WorklistPatient, WorklistSort } from "./types";

const priorityRank: Record<WorklistPatient["priority"], number> = {
  urgent: 0,
  priority: 1,
  normal: 2,
};

export const emptyFilters: WorklistFilters = {
  query: "",
  priority: "all",
  status: "all",
  language: "all",
};

/** Pure frontend filtering/sorting over whatever list the API layer supplied. */
export function filterWorklist(
  patients: WorklistPatient[],
  filters: WorklistFilters,
  sort: WorklistSort,
): WorklistPatient[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = patients.filter((patient) => {
    if (filters.priority !== "all" && patient.priority !== filters.priority) return false;
    if (filters.status !== "all" && patient.status !== filters.status) return false;
    if (filters.language !== "all" && patient.language !== filters.language) return false;
    if (!q) return true;
    return (
      patient.name.toLowerCase().includes(q) ||
      patient.caseId.toLowerCase().includes(q) ||
      patient.chiefConcern.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered];
  switch (sort) {
    case "waiting-desc":
      sorted.sort((a, b) => b.waitingMinutes - a.waitingMinutes);
      break;
    case "waiting-asc":
      sorted.sort((a, b) => a.waitingMinutes - b.waitingMinutes);
      break;
    case "priority":
      sorted.sort(
        (a, b) =>
          priorityRank[a.priority] - priorityRank[b.priority] ||
          b.waitingMinutes - a.waitingMinutes,
      );
      break;
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }
  return sorted;
}

export function useWorklistControls() {
  const [filters, setFilters] = useState<WorklistFilters>(emptyFilters);
  const [sort, setSort] = useState<WorklistSort>("priority");

  return {
    filters,
    sort,
    setSort,
    setFilter: <K extends keyof WorklistFilters>(key: K, value: WorklistFilters[K]) =>
      setFilters((prev) => ({ ...prev, [key]: value })),
    resetFilters: () => setFilters(emptyFilters),
    isFiltered: () =>
      filters.query !== "" ||
      filters.priority !== "all" ||
      filters.status !== "all" ||
      filters.language !== "all",
  };
}
