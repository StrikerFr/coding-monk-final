import { createFileRoute } from "@tanstack/react-router";
import { AdminRolesPage } from "@/features/admin/components/pages/AdminRolesPage";
export const Route = createFileRoute("/admin/roles")({
  head: () => ({
    meta: [
      { title: "Roles & Permissions - MediKiosk" },
      { name: "description", content: "Review predefined synthetic MediKiosk role permissions." },
      { property: "og:title", content: "Roles & Permissions - MediKiosk" },
      {
        property: "og:description",
        content: "Review predefined synthetic MediKiosk role permissions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRolesPage,
});
