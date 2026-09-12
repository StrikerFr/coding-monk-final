/**
 * Clerk publishable key. Publishable keys are safe in client code by design;
 * the secret key stays in server-side environment variables only.
 */
const envKey =
  (typeof process !== "undefined" && process.env?.["CLERK_PUBLISHABLE_KEY"]) ||
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env?: Record<string, string> })?.env?.[
      "VITE_CLERK_PUBLISHABLE_KEY"
    ]);

export const CLERK_PUBLISHABLE_KEY =
  envKey || "pk_test_YW11c2luZy1jb3ctNDY3Mi5jbGVyay5hY2NvdW50cy5kZXYk";

export const SIGN_IN_PATH = "/sign-in";
export const SIGN_UP_PATH = "/sign-up";
