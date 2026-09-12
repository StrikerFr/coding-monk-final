import { createFileRoute } from "@tanstack/react-router";
import { PatientSectionPage } from "@/features/patient/components/pages/PatientSectionPage";
export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [
      { title: "Profile - MediKiosk My Health" },
      { name: "description", content: "View your profile in the MediKiosk personal health space." },
      { property: "og:title", content: "Profile - MediKiosk My Health" },
      {
        property: "og:description",
        content: "Your personal health profile, kept clear and accessible.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PatientSectionPage section="profile" />,
});
