import { createFileRoute } from "@tanstack/react-router";
import { AssistedQueuePage } from "@/features/assisted-kiosk/components/pages/AssistedQueuePage";
export const Route = createFileRoute("/assisted-kiosk/queue")({
  head: () => ({
    meta: [
      { title: "Patient Queue - MediKiosk" },
      { name: "description", content: "Track waiting and in-progress assisted check-ins." },
      { property: "og:title", content: "Patient Queue - MediKiosk" },
      { property: "og:description", content: "Track waiting and in-progress assisted check-ins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedQueuePage,
});
