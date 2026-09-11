import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications - MediKiosk My Health" },
      {
        name: "description",
        content: "View your notifications in the MediKiosk personal health space.",
      },
      { property: "og:title", content: "Notifications - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health notifications, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="notifications" />,
});
