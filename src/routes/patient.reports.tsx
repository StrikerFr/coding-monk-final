import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/reports")({
  head: () => ({
    meta: [
      { title: "Reports - MediKiosk My Health" },
      { name: "description", content: "View your reports in the MediKiosk personal health space." },
      { property: "og:title", content: "Reports - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health reports, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="reports" />,
});
