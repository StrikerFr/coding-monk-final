import { createFileRoute } from "@tanstack/react-router";
import { WorklistPage } from "@/features/clinician/components/pages/WorklistPage";

export const Route = createFileRoute("/clinician/worklist")({
  head: () => ({
    meta: [
      { title: "Worklist - MediKiosk" },
      { name: "description", content: "Search, filter and sort kiosk-prepared patient cases." },
      { property: "og:title", content: "Worklist - MediKiosk" },
      {
        property: "og:description",
        content: "Search, filter and sort kiosk-prepared patient cases.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WorklistPage,
});
