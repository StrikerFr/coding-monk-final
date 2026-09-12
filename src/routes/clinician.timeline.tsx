import { createFileRoute } from "@tanstack/react-router";
import { ClinicianTimelinePage } from "@/features/clinician/components/pages/ClinicianTimelinePage";

export const Route = createFileRoute("/clinician/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline - MediKiosk" },
      {
        name: "description",
        content: "Chronological view of what happened during each kiosk session.",
      },
      { property: "og:title", content: "Timeline - MediKiosk" },
      {
        property: "og:description",
        content: "Chronological view of what happened during each kiosk session.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClinicianTimelinePage,
});
