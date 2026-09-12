import { createFileRoute } from "@tanstack/react-router";
import { OutboxPage } from "@/features/operations/components/pages/OutboxPage";
export const Route = createFileRoute("/operations/outbox")({
  head: () => ({
    meta: [
      { title: "Outbox Health - MediKiosk" },
      { name: "description", content: "Synthetic outbound delivery health and backlog." },
      { property: "og:title", content: "Outbox Health - MediKiosk" },
      { property: "og:description", content: "Synthetic outbound delivery health and backlog." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OutboxPage,
});
