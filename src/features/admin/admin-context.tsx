import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { adminApi } from "./api";
import type {
  AdminConfiguration,
  AdminFacility,
  AdminOverview,
  AdminRole,
  AdminSession,
  AdminUser,
  AuditEvent,
} from "./types";
type AdminContextValue = {
  session: AdminSession | null;
  overview: AdminOverview | null;
  users: AdminUser[];
  roles: AdminRole[];
  facilities: AdminFacility[];
  audit: AuditEvent[];
  configuration: AdminConfiguration | null;
  loading: boolean;
  error: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  retryLoad: () => void;
  updateUser: (id: string, updates: Partial<AdminUser>) => Promise<void>;
  updateConfiguration: (updates: Partial<AdminConfiguration>) => Promise<void>;
  updateFacility: (id: string, settings: Partial<AdminFacility["settings"]>) => void;
};
const AdminContext = createContext<AdminContextValue | null>(null);
export function AdminProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [facilities, setFacilities] = useState<AdminFacility[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [configuration, setConfiguration] = useState<AdminConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      adminApi.getSession(),
      adminApi.getOverview(),
      adminApi.getUsers(),
      adminApi.getRoles(),
      adminApi.getFacilities(),
      adminApi.getAuditLog(),
      adminApi.getConfiguration(),
    ])
      .then(([s, o, u, r, f, a, c]) => {
        if (!active) return;
        setSession(s);
        setOverview(o);
        setUsers(u);
        setRoles(r);
        setFacilities(f);
        setAudit(a);
        setConfiguration(c);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const addAudit = useCallback(
    (action: string, target: string) =>
      setAudit((items) => [
        {
          id: `AUD-${Date.now()}`,
          actor: "Demo Administrator",
          action,
          target,
          timestamp: "Now",
          status: "Completed",
          correlationId: `DEMO-CORR-${Date.now().toString().slice(-4)}`,
        },
        ...items,
      ]),
    [],
  );
  const updateUser = useCallback(
    async (id: string, updates: Partial<AdminUser>) => {
      await adminApi.updateUser(id, updates);
      setUsers((items) => items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
      addAudit(
        updates.status
          ? `Updated user status to ${updates.status}`
          : updates.role
            ? "Updated role assignment"
            : "Updated user assignment",
        id,
      );
    },
    [addAudit],
  );
  const updateConfiguration = useCallback(
    async (updates: Partial<AdminConfiguration>) => {
      await adminApi.updateConfiguration(updates);
      setConfiguration((current) => (current ? { ...current, ...updates } : current));
      addAudit("Updated platform configuration", "Configuration");
    },
    [addAudit],
  );
  const updateFacility = useCallback(
    (id: string, settings: Partial<AdminFacility["settings"]>) => {
      setFacilities((items) =>
        items.map((item) =>
          item.id === id ? { ...item, settings: { ...item.settings, ...settings } } : item,
        ),
      );
      addAudit("Updated facility configuration", id);
    },
    [addAudit],
  );
  const value = useMemo(
    () => ({
      session,
      overview,
      users,
      roles,
      facilities,
      audit,
      configuration,
      loading,
      error,
      mobileOpen,
      setMobileOpen,
      retryLoad: () => setReload((v) => v + 1),
      updateUser,
      updateConfiguration,
      updateFacility,
    }),
    [
      session,
      overview,
      users,
      roles,
      facilities,
      audit,
      configuration,
      loading,
      error,
      mobileOpen,
      updateUser,
      updateConfiguration,
      updateFacility,
    ],
  );
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}
export function useAdmin() {
  const value = useContext(AdminContext);
  if (!value) throw new Error("useAdmin must be used inside AdminProvider");
  return value;
}
