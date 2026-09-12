import { createClient, type Client } from "@libsql/client/web";
import { mockAssistedPatients } from "@/features/assisted-kiosk/mock/data";

/** Server-only database access. Never import this from components or route files. */
let client: Client | null = null;
let ready: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    const url = process.env["TURSO_DATABASE_URL"];
    const authToken = process.env["TURSO_AUTH_TOKEN"];
    if (!url || !authToken) throw new Error("Database is not configured");
    client = createClient({ url, authToken });
  }
  return client;
}

async function migrate(db: Client) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS queue_patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      language TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      wait_minutes INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      assistance TEXT NOT NULL,
      intake_step INTEGER NOT NULL DEFAULT 0,
      intake_total INTEGER NOT NULL DEFAULT 8,
      intake_label TEXT NOT NULL,
      intake_started_at TEXT,
      vitals_status TEXT NOT NULL,
      document_count INTEGER NOT NULL DEFAULT 0,
      handoff_status TEXT NOT NULL,
      completed_at TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await db.execute(`
    CREATE TABLE IF NOT EXISTS queue_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      action TEXT NOT NULL,
      actor TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

async function seed(db: Client) {
  const count = await db.execute("SELECT COUNT(*) AS total FROM queue_patients");
  if (Number(count.rows[0]?.["total"] ?? 0) > 0) return;
  await db.batch(
    mockAssistedPatients.map((patient, index) => ({
      sql: `INSERT INTO queue_patients (
        id, name, age, language, arrival_time, wait_minutes, status, assistance,
        intake_step, intake_total, intake_label, intake_started_at,
        vitals_status, document_count, handoff_status, completed_at, sort_order
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        patient.id,
        patient.name,
        patient.age,
        patient.language,
        patient.arrivalTime,
        patient.waitMinutes,
        patient.status,
        patient.assistance,
        patient.intakeProgress.step,
        patient.intakeProgress.total,
        patient.intakeProgress.label,
        patient.intakeProgress.startedAt ?? null,
        patient.vitalsStatus,
        patient.documentCount,
        patient.handoffStatus,
        patient.completedAt ?? null,
        index,
      ],
    })),
    "write",
  );
}

/** Returns a ready client, creating the schema and demonstration rows once. */
export async function getDb(): Promise<Client> {
  const db = getClient();
  if (!ready) {
    ready = (async () => {
      await migrate(db);
      await seed(db);
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  await ready;
  return db;
}
