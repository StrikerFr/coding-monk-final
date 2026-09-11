import { auth } from "@clerk/tanstack-react-start/server";

/**
 * Server-side identity. Clinician actions never trust a role sent by the
 * browser — the signed-in user is resolved here, on the server.
 */
export async function requireClinician() {
  try {
    const session = await auth();
    if (!session?.userId) {
      const error = new Error("Please sign in to continue") as Error & { status?: number };
      error.status = 401;
      throw error;
    }
    return {
      userId: session.userId,
      label: (session.sessionClaims?.["email"] as string | undefined) ?? session.userId,
    };
  } catch (error) {
    if (error instanceof Error && "status" in error) throw error;
    const failure = new Error("Please sign in to continue") as Error & { status?: number };
    failure.status = 401;
    throw failure;
  }
}
