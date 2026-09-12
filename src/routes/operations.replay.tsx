import { createFileRoute } from "@tanstack/react-router";
import { ReplayPage } from "@/features/operations/components/pages/ReplayPage";
export const Route = createFileRoute("/operations/replay")({
  head: () => ({
    meta: [
      { title: "Event Replay - MediKiosk" },
      { name: "description", content: "Audited synthetic replay of processing events." },
      { property: "og:title", content: "Event Replay - MediKiosk" },
      { property: "og:description", content: "Audited synthetic replay of processing events." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ReplayPage,
});
