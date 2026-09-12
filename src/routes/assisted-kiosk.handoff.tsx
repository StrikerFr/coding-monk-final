import { createFileRoute } from "@tanstack/react-router";
import { AssistedCompletedPage } from "@/features/assisted-kiosk/components/pages/AssistedCompletedPage";
export const Route = createFileRoute("/assisted-kiosk/handoff")({
  head: () => ({
    meta: [
      { title: "Clinician Handoff - MediKiosk" },
      { name: "description", content: "Prepare an assisted check-in for clinician review." },
      { property: "og:title", content: "Clinician Handoff - MediKiosk" },
      { property: "og:description", content: "Prepare an assisted check-in for clinician review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AssistedCompletedPage,
});
