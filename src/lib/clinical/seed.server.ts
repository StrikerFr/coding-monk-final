import { db as clinicalDb } from "./clinical.server";
import { mockWorklist } from "@/features/clinician/mock/patients";
import { getMockCase } from "@/features/clinician/mock/cases";

/**
 * One-time synthetic seed so the clinician and patient surfaces are usable
 * immediately. The rows live in Turso like any other encounter — nothing is
 * held in frontend memory.
 */

let seeded: Promise<void> | null = null;

const statusOf = (status: string) =>
  status === "completed"
    ? "completed"
    : status === "in-progress"
      ? "in-progress"
      : "ready-for-review";

export async function ensureSeed() {
  if (!seeded) {
    seeded = (async () => {
      const db = await clinicalDb();
      const count = await db.execute("SELECT COUNT(*) AS total FROM encounters");
      if (Number(count.rows[0]?.["total"] ?? 0) > 0) return;

      for (const patient of mockWorklist) {
        const detail = getMockCase(patient.id);
        const language = patient.language === "English" ? "en" : "hi";
        const encounterId = `MK-E-${patient.id.replace("MK-DEMO-", "SEED")}`;
        const status = statusOf(patient.status);

        await db.batch(
          [
            {
              sql: `INSERT OR REPLACE INTO patients (id, name, age, language) VALUES (?,?,?,?)`,
              args: [patient.id, patient.name, patient.age, language],
            },
            {
              sql: `INSERT OR REPLACE INTO encounters (id, patient_id, status, chief_complaint, started_at, completed_at, token)
                    VALUES (?,?,?,?, datetime('now', ?), CASE WHEN ? = 'in-progress' THEN NULL ELSE datetime('now') END, ?)`,
              args: [
                encounterId,
                patient.id,
                status,
                patient.chiefConcern,
                `-${patient.waitingMinutes} minutes`,
                status,
                encounterId.slice(-6),
              ],
            },
          ],
          "write",
        );

        if (!detail) continue;

        const answerId = `${encounterId}-A1`;
        await db.execute({
          sql: `INSERT OR REPLACE INTO intake_answers
                (id, encounter_id, question_id, question_text, transcript, language, source, status)
                VALUES (?,?,?,?,?,?,'voice','confirmed')`,
          args: [
            answerId,
            encounterId,
            "story",
            "What is troubling you right now?",
            detail.confirmedFacts[0]?.patientWords ?? `${patient.chiefConcern} for a few days.`,
            language,
          ],
        });

        await db.batch(
          detail.confirmedFacts.map((fact, index) => ({
            sql: `INSERT OR REPLACE INTO clinical_facts
                  (id, encounter_id, answer_id, category, field, value, display_value, certainty, source_text, status)
                  VALUES (?,?,?,?,?,?,?, 'CLEAR', ?, 'confirmed')`,
            args: [
              `${encounterId}-F${index + 1}`,
              encounterId,
              answerId,
              index === 1 ? "DURATION" : "SYMPTOM",
              fact.label,
              fact.value,
              fact.value,
              fact.patientWords ?? "",
            ],
          })),
          "write",
        );

        if (status !== "in-progress") {
          await db.execute({
            sql: `INSERT OR REPLACE INTO summaries (id, encounter_id, version, status, author, body, source_fact_ids)
                  VALUES (?,?,1,'AI_DRAFT','MediKiosk assisted draft',?,?)`,
            args: [
              `${encounterId}-S1`,
              encounterId,
              JSON.stringify({
                sections: [
                  { heading: "Chief Complaint", content: patient.chiefConcern },
                  { heading: "History of Present Concern", content: detail.draftSummary.body },
                  { heading: "Duration", content: detail.duration },
                  { heading: "Symptoms", content: detail.reportedSymptoms.join(", ") },
                  { heading: "Medications", content: detail.knownMedications.join(", ") },
                  { heading: "Allergies", content: detail.allergies.join(", ") },
                ],
                itemsRequiringReview: ["Confirm the reported duration with the patient."],
              }),
              JSON.stringify(detail.confirmedFacts.map((_, i) => `${encounterId}-F${i + 1}`)),
            ],
          });
        }

        await db.execute({
          sql: "INSERT INTO audit_events (encounter_id, patient_id, action, actor) VALUES (?,?,'INTAKE_STARTED','patient-kiosk')",
          args: [encounterId, patient.id],
        });
      }
    })().catch((error) => {
      seeded = null;
      throw error;
    });
  }
  await seeded;
}
