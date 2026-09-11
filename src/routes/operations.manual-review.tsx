import { createFileRoute } from "@tanstack/react-router";
import { ManualReviewPage } from "@/features/operations/components/pages/ManualReviewPage";
export const Route = createFileRoute("/operations/manual-review")({
  head: () => ({
    meta: [
      { title: "Manual Review - MediKiosk" },
      { name: "description", content: "Synthetic items held for manual operational review." },
      { property: "og:title", content: "Manual Review - MediKiosk" },
      {
        property: "og:description",
        content: "Synthetic items held for manual operational review.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ManualReviewPage,
});
