import { createFileRoute } from "@tanstack/react-router";
import { AdminAuditPage } from "@/features/admin/components/pages/AdminAuditPage";
export const Route = createFileRoute("/admin/audit")({
  head: () => ({
    meta: [
      { title: "Audit Log - MediKiosk Administration" },
      {
        name: "description",
        content: "Review synthetic administrative actions and access changes.",
      },
      { property: "og:title", content: "Audit Log - MediKiosk Administration" },
      {
        property: "og:description",
        content: "Review synthetic administrative actions and access changes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAuditPage,
});
