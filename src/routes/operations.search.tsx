import { createFileRoute } from "@tanstack/react-router";
import { SearchHealthPage } from "@/features/operations/components/pages/SearchHealthPage";
export const Route = createFileRoute("/operations/search")({
  head: () => ({
    meta: [
      { title: "Search Health - MediKiosk" },
      { name: "description", content: "Synthetic search index health and freshness." },
      { property: "og:title", content: "Search Health - MediKiosk" },
      { property: "og:description", content: "Synthetic search index health and freshness." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SearchHealthPage,
});
