import { createFileRoute } from "@tanstack/react-router";
import { DlqPage } from "@/features/operations/components/pages/DlqPage";
export const Route = createFileRoute("/operations/dlq")({
  head: () => ({
    meta: [
      { title: "Dead Letter Queue - MediKiosk" },
      { name: "description", content: "Inspect and retry synthetic failed processing events." },
      { property: "og:title", content: "Dead Letter Queue - MediKiosk" },
      {
        property: "og:description",
        content: "Inspect and retry synthetic failed processing events.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DlqPage,
});
