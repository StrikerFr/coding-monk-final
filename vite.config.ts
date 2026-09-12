// Vite configuration for TanStack Start with Vercel deployment support.

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Target Vercel so a connected Git push builds the right serverless bundle.
  nitro: { preset: "vercel" },
});
