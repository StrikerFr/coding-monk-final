import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";

import { CLERK_PUBLISHABLE_KEY } from "./features/auth/config";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (
      error != null &&
      typeof error === "object" &&
      ("statusCode" in error || error instanceof Response)
    ) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const baseClerkMiddleware = clerkMiddleware({ publishableKey: CLERK_PUBLISHABLE_KEY });

/**
 * Resilient Clerk middleware wrapper. Ensures network issues (DNS failure, offline)
 * or instance key mismatches do not trap public kiosk and landing pages in an
 * infinite redirect loop.
 */
const safeClerkMiddleware = createMiddleware().server(async ({ request, next }) => {
  try {
    const serverHandler = (baseClerkMiddleware as any)?.options?.server;

    if (typeof serverHandler === "function") {
      return await serverHandler({ request, next });
    }
    return await next();
  } catch (error) {
    if (error instanceof Response && (error.status === 307 || error.status === 302)) {
      const location = error.headers.get("Location") || error.headers.get("location") || "";
      const url = new URL(request.url);

      const isPublicRoute =
        url.pathname === "/" ||
        url.pathname.startsWith("/patient-kiosk") ||
        url.pathname.startsWith("/document-check") ||
        url.pathname.startsWith("/api/public");

      const isHandshakeLoop =
        url.searchParams.has("__clerk_handshake") ||
        location.includes("__clerk_handshake") ||
        location.includes("clerk");

      if (isPublicRoute || isHandshakeLoop) {
        return await next({
          context: {
            auth: () => ({
              userId: null,
              sessionId: null,
              getToken: async () => null,
              sessionClaims: null,
            }),
            clerkInitialState: {},
          },
        });
      }
    }
    throw error;
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [
    errorMiddleware,
    csrfMiddleware,
    // Resolves the signed-in user on the server; auth() throws without it.
    safeClerkMiddleware,
  ],
}));
