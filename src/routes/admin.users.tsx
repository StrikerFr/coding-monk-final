import { createFileRoute } from "@tanstack/react-router";
import { AdminUsersPage } from "@/features/admin/components/pages/AdminUsersPage";
export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Users - MediKiosk Administration" },
      {
        name: "description",
        content: "Manage synthetic user access assignments in the MediKiosk admin demo.",
      },
      { property: "og:title", content: "Users - MediKiosk Administration" },
      {
        property: "og:description",
        content: "Manage synthetic user access assignments in the MediKiosk admin demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUsersPage,
});
