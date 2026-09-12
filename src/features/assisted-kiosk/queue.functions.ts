import { createServerFn } from "@tanstack/react-start";
import type { AssistedPatient } from "./types";

type Row = Record<string, unknown>;

const text = (value: unknown) => String(value ?? "");
const num = (value: unknown) => Number(value ?? 0);

function toPatient(row: Row): AssistedPatient {
  const startedAt = row["intake_started_at"];
  const completedAt = row["completed_at"];
  return {
    id: text(row["id"]),
    name: text(row["name"]),
    age: num(row["age"]),
    language: text(row["language"]) as AssistedPatient["language"],
    arrivalTime: text(row["arrival_time"]),
    waitMinutes: num(row["wait_minutes"]),
    status: text(row["status"]) as AssistedPatient["status"],
    assistance: text(row["assistance"]) as AssistedPatient["assistance"],
    intakeProgress: {
      step: num(row["intake_step"]),
      total: num(row["intake_total"]),
      label: text(row["intake_label"]),
      ...(startedAt ? { startedAt: text(startedAt) } : {}),
    },
    vitalsStatus: text(row["vitals_status"]) as AssistedPatient["vitalsStatus"],
    documentCount: num(row["document_count"]),
    handoffStatus: text(row["handoff_status"]) as AssistedPatient["handoffStatus"],
    ...(completedAt ? { completedAt: text(completedAt) } : {}),
  };
}

const clockLabel = () =>
  new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date());

/** Reads the persisted assisted-care queue. */
export const getQueue = createServerFn({ method: "GET" }).handler(async () => {
  const { getDb } = await import("@/lib/db.server");
  const db = await getDb();
  const result = await db.execute("SELECT * FROM queue_patients ORDER BY sort_order ASC");
  return result.rows.map((row) => toPatient(row as Row));
});

/** Marks a queued patient as in progress and records the action. */
export const startIntake = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => {
    if (!input?.id || typeof input.id !== "string") throw new Error("A patient id is required");
    return { id: input.id };
  })
  .handler(async ({ data }) => {
    const { getDb } = await import("@/lib/db.server");
    const db = await getDb();
    const startedAt = clockLabel();
    await db.execute({
      sql: `UPDATE queue_patients
            SET status = 'in-progress', assistance = 'In progress', wait_minutes = 0,
                intake_step = 1, intake_label = 'Introduction', intake_started_at = ?,
                updated_at = datetime('now')
            WHERE id = ?`,
      args: [startedAt, data.id],
    });
    await db.execute({
      sql: "INSERT INTO queue_events (patient_id, action, actor) VALUES (?, 'start-intake', 'Reception Staff')",
      args: [data.id],
    });
    return { patientId: data.id, status: "in-progress" as const, startedAt };
  });
