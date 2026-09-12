import { createFileRoute } from "@tanstack/react-router";
import { AssistedVitalsPage } from "@/features/assisted-kiosk/components/pages/AssistedVitalsPage";

export const Route = createFileRoute("/assisted-kiosk/vitals")({
  head: () => ({
    meta: [
      { title: "Staff Vitals & BP - MediKiosk" },
      { name: "description", content: "Record and manage blood pressure and vitals during staff-assisted check-in." },
      { property: "og:title", content: "Staff Vitals & BP - MediKiosk" },
      { property: "og:description", content: "Record and manage blood pressure and vitals during staff-assisted check-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedVitalsPage,
});
