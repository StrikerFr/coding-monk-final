import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { assistedKioskApi } from "./api";
import { mockStaffSession } from "./mock/data";
import type { AssistedPatient, AssistedQueueFilter, StaffSession } from "./types";

type AssistedKioskContextValue = {
  session: StaffSession;
  patients: AssistedPatient[];
  visiblePatients: AssistedPatient[];
  selectedPatient: AssistedPatient | null;
  filter: AssistedQueueFilter;
  search: string;
  loading: boolean;
  error: boolean;
  actionPatientId: string | null;
  setFilter: (filter: AssistedQueueFilter) => void;
  setSearch: (search: string) => void;
  selectPatient: (id: string) => void;
  startIntake: (id: string) => Promise<void>;
  retry: () => void;
};

const AssistedKioskContext = createContext<AssistedKioskContextValue | null>(null);

export function AssistedKioskProvider({ children }: { children: ReactNode }) {
  const [session] = useState(mockStaffSession);
  const [patients, setPatients] = useState<AssistedPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>("MK-DEMO-001");
  const [filter, setFilter] = useState<AssistedQueueFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionPatientId, setActionPatientId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void assistedKioskApi
      .getQueue()
      .then((items) => {
        if (!active) return;
        setPatients(items);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setError(true);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visiblePatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    return patients.filter((patient) => {
      const matchesFilter = filter === "all" || patient.status === filter;
      const haystack = `${patient.name} ${patient.id} ${patient.status}`.toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
  }, [patients, filter, search]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? null;
  const startIntake = useCallback(async (id: string) => {
    setActionPatientId(id);
    try {
      const result = await assistedKioskApi.startIntake(id);
      setPatients((items) =>
        items.map((patient) =>
          patient.id === id
            ? {
                ...patient,
                status: result.status,
                assistance: "In progress",
                intakeProgress: {
                  step: 1,
                  total: 8,
                  label: "Introduction",
                  startedAt: result.startedAt,
                },
              }
            : patient,
        ),
      );
      setSelectedPatientId(id);
    } finally {
      setActionPatientId(null);
    }
  }, []);

  const value = useMemo<AssistedKioskContextValue>(
    () => ({
      session,
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
      selectPatient: setSelectedPatientId,
      startIntake,
      retry: () => setReloadKey((value) => value + 1),
    }),
    [
      session,
      patients,
      visiblePatients,
      selectedPatient,
      filter,
      search,
      loading,
      error,
      actionPatientId,
      startIntake,
    ],
  );

  return <AssistedKioskContext.Provider value={value}>{children}</AssistedKioskContext.Provider>;
}

export function useAssistedKiosk() {
  const value = useContext(AssistedKioskContext);
  if (!value) throw new Error("useAssistedKiosk must be used inside AssistedKioskProvider");
  return value;
}
