import { createFileRoute } from "@tanstack/react-router";
import { WorklistPage } from "@/features/clinician/components/pages/WorklistPage";

export const Route = createFileRoute("/clinician/patients/")({
  head: () => ({
    meta: [
      { title: "Patient Cases - MediKiosk" },
      { name: "description", content: "Browse prepared patient cases awaiting clinician review." },
      { property: "og:title", content: "Patient Cases - MediKiosk" },
      {
        property: "og:description",
        content: "Browse prepared patient cases awaiting clinician review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorklistPage,
});
