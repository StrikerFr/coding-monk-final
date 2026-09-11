import { createFileRoute } from "@tanstack/react-router";
import { AdminFacilitiesPage } from "@/features/admin/components/pages/AdminFacilitiesPage";
export const Route = createFileRoute("/admin/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities - MediKiosk Administration" },
      { name: "description", content: "Review synthetic participating facility configuration." },
      { property: "og:title", content: "Facilities - MediKiosk Administration" },
      {
        property: "og:description",
        content: "Review synthetic participating facility configuration.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminFacilitiesPage,
});
