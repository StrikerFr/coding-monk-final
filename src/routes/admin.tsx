import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { AdminProvider } from "@/features/admin/admin-context";
import { RequireAuth } from "@/features/auth/RequireAuth";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration - MediKiosk" },
      { name: "description", content: "MediKiosk controlled administrative workspace demo." },
      { property: "og:title", content: "Administration - MediKiosk" },
      {
        property: "og:description",
        content: "MediKiosk controlled administrative workspace demo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});
function AdminLayout() {
  return (
    <RequireAuth>
      <AdminProvider>
        <AdminShell>
          <Outlet />
        </AdminShell>
      </AdminProvider>
    </RequireAuth>
  );
}
