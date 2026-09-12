import { createFileRoute } from "@tanstack/react-router";
import { AdminOverviewPage } from "@/features/admin/components/pages/AdminOverviewPage";
export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administration Overview - MediKiosk" },
      {
        name: "description",
        content: "Review synthetic access, facilities, and administrative activity.",
      },
      { property: "og:title", content: "Administration Overview - MediKiosk" },
      {
        property: "og:description",
        content: "Review synthetic access, facilities, and administrative activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminOverviewPage,
});
