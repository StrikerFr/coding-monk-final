import { createFileRoute } from "@tanstack/react-router";
import { AssistedQueuePage } from "@/features/assisted-kiosk/components/pages/AssistedQueuePage";
export const Route = createFileRoute("/assisted-kiosk/")({
  head: () => ({
    meta: [
      { title: "Assisted Queue - MediKiosk" },
      { name: "description", content: "Staff view of the synthetic assisted check-in queue." },
      { property: "og:title", content: "Assisted Queue - MediKiosk" },
      {
        property: "og:description",
        content: "Staff view of the synthetic assisted check-in queue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedQueuePage,
});
