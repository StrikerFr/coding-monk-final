import { createFileRoute } from "@tanstack/react-router";

/**
 * Serves the original uploaded document so a clinician can see the source of
 * every extracted item. Not public: the request must carry a signed-in session,
 * and the file is streamed straight from the record — never cached publicly.
 */
export const Route = createFileRoute("/api/documents/$documentId/file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const documentId = String(params.documentId ?? "");
        if (!documentId) return new Response("Not found", { status: 404 });

        try {
          const { requireClinician } = await import("@/lib/clinical/auth.server");
          await requireClinician();
        } catch {
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const { readDocumentFile, recordDocumentViewed } =
            await import("@/lib/clinical/documents.server");
          const file = await readDocumentFile(documentId);
          await recordDocumentViewed(documentId, "clinician-viewer");
          return new Response(file.bytes as unknown as BodyInit, {
            headers: {
              "Content-Type": file.mimeType,
              "Content-Disposition": `inline; filename="${file.document.fileName.replace(/"/g, "")}"`,
              "Cache-Control": "private, no-store",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
