import { createFileRoute } from "@tanstack/react-router";
import { ClinicianAlertsPage } from "@/features/clinician/components/pages/ClinicianAlertsPage";

export const Route = createFileRoute("/clinician/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts - MediKiosk" },
      { name: "description", content: "Items flagged for clinician attention across cases." },
      { property: "og:title", content: "Alerts - MediKiosk" },
      {
        property: "og:description",
        content: "Items flagged for clinician attention across cases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClinicianAlertsPage,
});
