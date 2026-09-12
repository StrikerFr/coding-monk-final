import { createFileRoute } from "@tanstack/react-router";
import { OperationsOverviewPage } from "@/features/operations/components/pages/OperationsOverviewPage";
export const Route = createFileRoute("/operations/")({
  head: () => ({
    meta: [
      { title: "Operations Overview - MediKiosk" },
      {
        name: "description",
        content: "Synthetic system health, attention items and processing activity.",
      },
      { property: "og:title", content: "Operations Overview - MediKiosk" },
      {
        property: "og:description",
        content: "Synthetic system health, attention items and processing activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OperationsOverviewPage,
});
