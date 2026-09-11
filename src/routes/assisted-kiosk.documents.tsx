import { createFileRoute } from "@tanstack/react-router";
import { AssistedDocumentsPage } from "@/features/assisted-kiosk/components/pages/AssistedDocumentsPage";
export const Route = createFileRoute("/assisted-kiosk/documents")({
  head: () => ({
    meta: [
      { title: "Assisted Documents - MediKiosk" },
      { name: "description", content: "Attach documents a patient brings to the kiosk." },
      { property: "og:title", content: "Assisted Documents - MediKiosk" },
      { property: "og:description", content: "Attach documents a patient brings to the kiosk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedDocumentsPage,
});
