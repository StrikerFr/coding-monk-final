import { createFileRoute } from "@tanstack/react-router";
import { AssistedPlaceholderPage } from "@/features/assisted-kiosk/components/pages/AssistedPlaceholderPage";
export const Route = createFileRoute("/assisted-kiosk/vitals")({
  head: () => ({
    meta: [
      { title: "Assisted Vitals - MediKiosk" },
      { name: "description", content: "Record vitals during a staff-assisted check-in." },
      { property: "og:title", content: "Assisted Vitals - MediKiosk" },
      { property: "og:description", content: "Record vitals during a staff-assisted check-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AssistedPlaceholderPage kind="vitals" />,
});
