import { createFileRoute, Outlet } from "@tanstack/react-router";
import { KioskProvider } from "@/features/patient-kiosk/kiosk-context";
import { KioskShell } from "@/features/patient-kiosk/components/KioskShell";

export const Route = createFileRoute("/patient-kiosk")({
  head: () => ({
    meta: [
      { title: "Patient Check-in - MediKiosk" },
      {
        name: "description",
        content: "The MediKiosk patient check-in experience, in Hindi or English.",
      },
      { property: "og:title", content: "Patient Check-in - MediKiosk" },
      {
        property: "og:description",
        content: "The MediKiosk patient check-in experience, in Hindi or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: KioskLayout,
});

function KioskLayout() {
  return (
    <KioskProvider>
      <KioskShell>
        <Outlet />
      </KioskShell>
    </KioskProvider>
  );
}
