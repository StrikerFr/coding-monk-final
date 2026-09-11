import { createFileRoute } from "@tanstack/react-router";
import { ClinicianDocumentsPage } from "@/features/clinician/components/pages/ClinicianDocumentsPage";

export const Route = createFileRoute("/clinician/documents")({
  head: () => ({
    meta: [
      { title: "Documents - MediKiosk" },
      { name: "description", content: "Documents patients bring to the kiosk, across all cases." },
      { property: "og:title", content: "Documents - MediKiosk" },
      {
        property: "og:description",
        content: "Documents patients bring to the kiosk, across all cases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClinicianDocumentsPage,
});
