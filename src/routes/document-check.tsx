import { createFileRoute } from "@tanstack/react-router";
import { DocumentCheckPage } from "@/features/document-check/components/DocumentCheckPage";

const title = "Check a document - MediKiosk";
const description =
  "Upload a prescription or report to see the text read from it and the structured version of that text.";

export const Route = createFileRoute("/document-check")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DocumentCheckPage,
});
