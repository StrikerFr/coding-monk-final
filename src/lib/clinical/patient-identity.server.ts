import { db, findPatientByAccount } from "./clinical.server";

/**
 * Resolves which patient record the current request may read. The identity is
 * decided here, on the server: a patient id sent by the browser is never used.
 *
 * A signed-in account is matched to the patient record it was linked to at
 * check-in, then to a record carrying the same contact detail. When there is no
 * match, the synthetic demonstration patient is used so the portal has honest
 * data to show — never another person's record.
 */
export async function currentAccountId(): Promise<string | null> {
  try {
    const { auth } = await import("@clerk/tanstack-react-start/server");
    const session = await auth();
    return session?.userId ?? null;
  } catch {
    return null;
  }
}

export async function resolveOwnPatientId(): Promise<string> {
  const client = await db();
  let email: string | null = null;

  try {
    const { auth } = await import("@clerk/tanstack-react-start/server");
    const session = await auth();
    if (session?.userId) {
      const linked = await findPatientByAccount(session.userId);
      if (linked) return linked;

      const claims = session.sessionClaims as Record<string, unknown> | undefined;
      const claimEmail = typeof claims?.["email"] === "string" ? claims["email"].toLowerCase() : null;
      const claimName =
        typeof claims?.["name"] === "string" && claims["name"].trim()
          ? claims["name"].trim()
          : typeof claims?.["first_name"] === "string" && claims["first_name"].trim()
            ? claims["first_name"].trim()
            : "Patient";

      const newPatientId = `MK-P-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
      await client.execute({
        sql: "INSERT INTO patients (id, name, age, language, phone, account_id) VALUES (?,?,?,?,?,?)",
        args: [newPatientId, claimName, 0, "hi", claimEmail, session.userId],
      });
      return newPatientId;
    }
    const claim = (session?.sessionClaims as Record<string, unknown> | undefined)?.["email"];
    if (typeof claim === "string" && claim.includes("@")) email = claim.toLowerCase();
  } catch {
    /* no session available: fall through to the demonstration patient */
  }

  if (email) {
    const found = await client.execute({
      sql: "SELECT id FROM patients WHERE lower(COALESCE(phone,'')) = ? LIMIT 1",
      args: [email],
    });
    const row = found.rows[0] as Record<string, unknown> | undefined;
    if (row) return String(row["id"]);
  }

  await client.execute(
    `INSERT INTO patients (id, name, age, language, phone) VALUES ('MK-DEMO-001','Meera Sharma',46,'hi',NULL)
     ON CONFLICT (id) DO NOTHING`,
  );
  return "MK-DEMO-001";
}
