import { getDb } from "./db.server";
import { mockClinician, mockWorklist } from "@/features/clinician/mock/patients";
import { getMockCase } from "@/features/clinician/mock/cases";
import { mockDocuments } from "@/features/clinician/mock/documents";
import { mockAlerts } from "@/features/clinician/mock/alerts";
import { mockNotifications } from "@/features/clinician/mock/notifications";
import {
  mockPatientDashboard,
  mockPatientProfile,
  mockPatientSearch,
} from "@/features/patient/mock/data";
import {
  auditEntries,
  dlqEvents,
  outboxEvents,
  overview,
  replayRecords,
  reviewItems,
  searchHealth,
  services,
} from "@/features/operations/mock/data";
import {
  adminAuditEvents,
  adminConfiguration,
  adminFacilities,
  adminOverview,
  adminRoles,
  adminSession,
  adminUsers,
} from "@/features/admin/mock/data";

/**
 * Server-only document store.
 *
 * Every surface (clinician, patient, operations, admin) reads and writes real
 * rows in Turso. Each collection is seeded once from the original demonstration
 * data so the product looks the same, but changes now persist.
 */

interface SeedDoc {
  id: string;
  data: unknown;
}

const list = <T extends { id: string }>(items: T[]): SeedDoc[] =>
  items.map((item) => ({ id: item.id, data: item }));

const single = (data: unknown): SeedDoc[] => [{ id: "default", data }];

const seeds: Record<string, () => SeedDoc[]> = {
  clinician_session: () => single(mockClinician),
  clinician_worklist: () => list(mockWorklist),
  clinician_cases: () =>
    mockWorklist
      .map((patient) => ({ id: patient.id, data: getMockCase(patient.id) }))
      .filter((doc) => doc.data !== null),
  clinician_documents: () =>
    Object.entries(mockDocuments).map(([patientId, items]) => ({
      id: patientId,
      data: { patientId, items },
    })),
  clinician_alerts: () =>
    Object.entries(mockAlerts).map(([patientId, items]) => ({
      id: patientId,
      data: { patientId, items },
    })),
  clinician_notifications: () => list(mockNotifications),

  patient_profile: () => single(mockPatientProfile),
  patient_dashboard: () => single(mockPatientDashboard),
  patient_search: () => list(mockPatientSearch),

  ops_overview: () => single(overview),
  ops_services: () => services.map((item) => ({ id: item.name, data: item })),
  ops_dlq: () => list(dlqEvents),
  ops_review: () => list(reviewItems),
  ops_outbox: () => list(outboxEvents),
  ops_search_health: () => single(searchHealth),
  ops_replay: () => list(replayRecords),
  ops_audit: () => list(auditEntries),

  admin_session: () => single(adminSession),
  admin_overview: () => single(adminOverview),
  admin_users: () => list(adminUsers),
  admin_roles: () => list(adminRoles),
  admin_facilities: () => list(adminFacilities),
  admin_audit: () => list(adminAuditEvents),
  admin_configuration: () => single(adminConfiguration),

  /** Patient answers captured at the kiosk. Starts empty and grows in use. */
  kiosk_answers: () => [],
  /** Full kiosk check-in sessions. Starts empty and grows in use. */
  kiosk_sessions: () => [],
};

export type CollectionName = keyof typeof seeds;

export function isCollection(value: string): value is string & CollectionName {
  return Object.hasOwn(seeds, value);
}

let schemaReady: Promise<void> | null = null;
const seededCollections = new Map<string, Promise<void>>();

async function ensureSchema() {
  const db = await getDb();
  if (!schemaReady) {
    schemaReady = db
      .execute(
        `CREATE TABLE IF NOT EXISTS documents (
          collection TEXT NOT NULL,
          id TEXT NOT NULL,
          data TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          PRIMARY KEY (collection, id)
        )`,
      )
      .then(() => undefined)
      .catch((error) => {
        schemaReady = null;
        throw error;
      });
  }
  await schemaReady;
  return db;
}

async function ensureCollection(collection: string) {
  const db = await ensureSchema();
  let pending = seededCollections.get(collection);
  if (!pending) {
    pending = (async () => {
      const count = await db.execute({
        sql: "SELECT COUNT(*) AS total FROM documents WHERE collection = ?",
        args: [collection],
      });
      if (Number(count.rows[0]?.["total"] ?? 0) > 0) return;
      const docs = seeds[collection]?.() ?? [];
      if (docs.length === 0) return;
      await db.batch(
        docs.map((doc, index) => ({
          sql: "INSERT OR REPLACE INTO documents (collection, id, data, sort_order) VALUES (?,?,?,?)",
          args: [collection, doc.id, JSON.stringify(doc.data), index],
        })),
        "write",
      );
    })().catch((error) => {
      seededCollections.delete(collection);
      throw error;
    });
    seededCollections.set(collection, pending);
  }
  await pending;
  return db;
}

const parse = <T>(value: unknown): T => JSON.parse(String(value)) as T;

/** All documents in a collection, in their stored order. */
export async function listDocs<T>(collection: string): Promise<T[]> {
  const db = await ensureCollection(collection);
  const result = await db.execute({
    sql: "SELECT data FROM documents WHERE collection = ? ORDER BY sort_order ASC, id ASC",
    args: [collection],
  });
  return result.rows.map((row) => parse<T>(row["data"]));
}

/** A single document, or null when it does not exist. */
export async function getDoc<T>(collection: string, id: string): Promise<T | null> {
  const db = await ensureCollection(collection);
  const result = await db.execute({
    sql: "SELECT data FROM documents WHERE collection = ? AND id = ?",
    args: [collection, id],
  });
  const row = result.rows[0];
  return row ? parse<T>(row["data"]) : null;
}

/** Creates or replaces a document. */
export async function putDoc(collection: string, id: string, data: unknown): Promise<void> {
  const db = await ensureCollection(collection);
  await db.execute({
    sql: `INSERT INTO documents (collection, id, data, sort_order)
          VALUES (?, ?, ?, COALESCE((SELECT sort_order FROM documents WHERE collection = ? AND id = ?), -1))
          ON CONFLICT (collection, id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`,
    args: [collection, id, JSON.stringify(data), collection, id],
  });
}

/** Shallow-merges updates into an existing document. */
export async function patchDoc(
  collection: string,
  id: string,
  updates: Record<string, unknown>,
): Promise<unknown> {
  const current = await getDoc<Record<string, unknown>>(collection, id);
  if (!current) throw new Error(`Record ${id} does not exist`);
  const next = { ...current, ...updates };
  await putDoc(collection, id, next);
  return next;
}
