import { createFileRoute } from "@tanstack/react-router";
import { ReviewPage } from "@/features/patient-kiosk/components/pages/ReviewPage";

export const Route = createFileRoute("/patient-kiosk/review")({
  head: () => ({
    meta: [
      { title: "Check-in - MediKiosk" },
      { name: "description", content: "Part of the MediKiosk patient check-in: review." },
      { property: "og:title", content: "Check-in - MediKiosk" },
      { property: "og:description", content: "Part of the MediKiosk patient check-in: review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReviewPage,
});
