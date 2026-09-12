import { createFileRoute } from "@tanstack/react-router";
import { AdminConfigurationPage } from "@/features/admin/components/pages/AdminConfigurationPage";
export const Route = createFileRoute("/admin/configuration")({
  head: () => ({
    meta: [
      { title: "System Configuration - MediKiosk" },
      { name: "description", content: "Manage synthetic controlled platform defaults." },
      { property: "og:title", content: "System Configuration - MediKiosk" },
      { property: "og:description", content: "Manage synthetic controlled platform defaults." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminConfigurationPage,
});
