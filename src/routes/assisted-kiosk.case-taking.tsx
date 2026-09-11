import { createFileRoute } from "@tanstack/react-router";
import { AssistedActiveIntakePage } from "@/features/assisted-kiosk/components/pages/AssistedActiveIntakePage";
export const Route = createFileRoute("/assisted-kiosk/case-taking")({
  head: () => ({
    meta: [
      { title: "Assisted Case Taking - MediKiosk" },
      { name: "description", content: "Capture the patient's concern with staff assistance." },
      { property: "og:title", content: "Assisted Case Taking - MediKiosk" },
      {
        property: "og:description",
        content: "Capture the patient's concern with staff assistance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedActiveIntakePage,
});
