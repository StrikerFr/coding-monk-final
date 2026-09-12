import { createFileRoute } from "@tanstack/react-router";
import { AssistedPlaceholderPage } from "@/features/assisted-kiosk/components/pages/AssistedPlaceholderPage";
export const Route = createFileRoute("/assisted-kiosk/start")({
  head: () => ({
    meta: [
      { title: "Start Assisted Intake - MediKiosk" },
      { name: "description", content: "Begin a staff-assisted check-in for a waiting patient." },
      { property: "og:title", content: "Start Assisted Intake - MediKiosk" },
      {
        property: "og:description",
        content: "Begin a staff-assisted check-in for a waiting patient.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AssistedPlaceholderPage kind="start" />,
});
