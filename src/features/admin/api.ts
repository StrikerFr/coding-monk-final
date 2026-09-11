import type {
  AdminConfiguration,
  AdminFacility,
  AdminOverview,
  AdminRole,
  AdminSession,
  AdminUser,
  AuditEvent,
} from "./types";
import { getDocument, listCollection, patchDocument } from "@/lib/store.functions";

/** Data boundary for the admin console. Reads and writes stored records. */

const listOf = async <T>(collection: string): Promise<T[]> =>
  (await listCollection({ data: { collection } })) as unknown as T[];

const docOf = async <T>(collection: string, id = "default"): Promise<T | null> =>
  (await getDocument({ data: { collection, id } })) as unknown as T | null;

const required = async <T>(collection: string, label: string): Promise<T> => {
  const data = await docOf<T>(collection);
  if (!data) throw new Error(`${label} is unavailable`);
  return data;
};

export const adminApi = {
  getOverview: () => required<AdminOverview>("admin_overview", "Overview"),
  getSession: () => required<AdminSession>("admin_session", "Administrator profile"),
  getUsers: () => listOf<AdminUser>("admin_users"),
  getUser: (id: string) => docOf<AdminUser>("admin_users", id),
  async updateUser(id: string, updates: Partial<AdminUser>) {
    await patchDocument({
      data: { collection: "admin_users", id, updates: updates as Record<string, unknown> },
    });
    return { ok: true as const };
  },
  getRoles: () => listOf<AdminRole>("admin_roles"),
  getRole: (id: string) => docOf<AdminRole>("admin_roles", id),
  getFacilities: () => listOf<AdminFacility>("admin_facilities"),
  getFacility: (id: string) => docOf<AdminFacility>("admin_facilities", id),
  getAuditLog: () => listOf<AuditEvent>("admin_audit"),
  getAuditEvent: (id: string) => docOf<AuditEvent>("admin_audit", id),
  getConfiguration: () => required<AdminConfiguration>("admin_configuration", "Configuration"),
  async updateConfiguration(updates: Partial<AdminConfiguration>) {
    await patchDocument({
      data: {
        collection: "admin_configuration",
        id: "default",
        updates: updates as Record<string, unknown>,
      },
    });
    return { ok: true as const };
  },
};
