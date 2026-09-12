import { createFileRoute } from "@tanstack/react-router";
import { ClinicianSettingsPage } from "@/features/clinician/components/pages/ClinicianSettingsPage";

export const Route = createFileRoute("/clinician/settings")({
  head: () => ({
    meta: [
      { title: "Workspace Settings - MediKiosk" },
      {
        name: "description",
        content: "Language, accessibility and display preferences for the workspace.",
      },
      { property: "og:title", content: "Workspace Settings - MediKiosk" },
      {
        property: "og:description",
        content: "Language, accessibility and display preferences for the workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClinicianSettingsPage,
});
