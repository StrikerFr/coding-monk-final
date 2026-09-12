import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/clinician/components/pages/DashboardPage";

export const Route = createFileRoute("/clinician/")({
  head: () => ({
    meta: [
      { title: "Clinical Dashboard - MediKiosk" },
      {
        name: "description",
        content: "Today's prepared cases, attention items and clinic activity.",
      },
      { property: "og:title", content: "Clinical Dashboard - MediKiosk" },
      {
        property: "og:description",
        content: "Today's prepared cases, attention items and clinic activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
});
