import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { mockClinician } from "./mock/patients";
import { mockNotifications } from "./mock/notifications";
import type { Clinician, ClinicianNotification } from "./types";

/**
 * Frontend-only clinician session state. No authentication, no backend.
 */
interface ClinicianContextValue {
  clinician: Clinician;
  availability: Clinician["availability"];
  setAvailability: (value: Clinician["availability"]) => void;
  notifications: ClinicianNotification[];
  unreadCount: number;
  markAllRead: () => void;
  /** Mock connection indicator — not a real health check. */
  connection: "connected" | "unavailable";
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const ClinicianContext = createContext<ClinicianContextValue | null>(null);

export function ClinicianProvider({ children }: { children: ReactNode }) {
  const [availability, setAvailability] = useState<Clinician["availability"]>(
    mockClinician.availability,
  );
  const [notifications, setNotifications] = useState<ClinicianNotification[]>(mockNotifications);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const value = useMemo<ClinicianContextValue>(
    () => ({
      clinician: { ...mockClinician, availability },
      availability,
      setAvailability,
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
      markAllRead: () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false }))),
      connection: "connected",
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((prev) => !prev),
    }),
    [availability, notifications, sidebarCollapsed],
  );

  return <ClinicianContext.Provider value={value}>{children}</ClinicianContext.Provider>;
}

export function useClinician() {
  const ctx = useContext(ClinicianContext);
  if (!ctx) throw new Error("useClinician must be used inside ClinicianProvider");
  return ctx;
}
