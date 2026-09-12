import { useState } from "react";
import { Accessibility, Bell, Languages, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/features/admin/admin-context";
import type { AdminConfiguration } from "@/features/admin/types";
import { AdminError, ConfigurationSkeleton } from "../AdminStates";
import { AdminPageHeader, DemoFeedback } from "../AdminPrimitives";
export function AdminConfigurationPage() {
  const { configuration, loading, error, retryLoad, updateConfiguration } = useAdmin();
  const [message, setMessage] = useState("");
  if (error) return <AdminError onRetry={retryLoad} />;
  if (loading || !configuration)
    return (
      <>
        <AdminPageHeader
          title="System Configuration"
          description="Manage controlled platform defaults."
        />
        <ConfigurationSkeleton />
      </>
    );
  const change = async (updates: Partial<AdminConfiguration>) => {
    await updateConfiguration(updates);
    setMessage("Setting updated in demo mode.");
  };
  const sections = [
    {
      title: "Accessibility",
      icon: Accessibility,
      rows: [
        { label: "Large text", key: "largeTextDefault" as const },
        { label: "High contrast available", key: "highContrastAvailable" as const },
        { label: "Reduced motion available", key: "reducedMotionAvailable" as const },
      ],
    },
    {
      title: "Patient experience",
      icon: MonitorSmartphone,
      rows: [
        { label: "Patient kiosk", key: "patientKiosk" as const },
        { label: "Assisted kiosk", key: "assistedKiosk" as const },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      rows: [
        { label: "Notification preferences configured", key: "notificationsConfigured" as const },
      ],
    },
  ];
  return (
    <>
      <AdminPageHeader
        title="System Configuration"
        description="Manage controlled platform defaults."
      />
      {message && (
        <div className="mb-5">
          <DemoFeedback message={message} />
        </div>
      )}
      <div className="grid gap-x-8 gap-y-7 xl:grid-cols-2">
        <section>
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Languages className="size-5 text-primary" />
            <h2 className="font-semibold">General</h2>
          </div>
          <div className="space-y-4 py-4">
            <label className="grid gap-2 text-sm font-medium sm:grid-cols-[1fr_14rem] sm:items-center">
              Default language
              <Select
                value={configuration.defaultLanguage}
                onValueChange={(v) => void change({ defaultLanguage: v as "Hindi" | "English" })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-2 text-sm font-medium sm:grid-cols-[1fr_14rem] sm:items-center">
              Secondary language
              <Select
                value={configuration.secondaryLanguage}
                onValueChange={(v) => void change({ secondaryLanguage: v as "Hindi" | "English" })}
              >
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
        </section>
        {sections.map((section) => (
          <section key={section.title}>
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <section.icon className="size-5 text-primary" />
              <h2 className="font-semibold">{section.title}</h2>
            </div>
            <div className="divide-y divide-border">
              {section.rows.map((row) => (
                <label
                  key={row.key}
                  className="flex min-h-16 items-center justify-between gap-4 text-sm font-medium"
                >
                  <span>
                    {row.label}
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      Demo default
                    </span>
                  </span>
                  <Switch
                    checked={configuration[row.key]}
                    onCheckedChange={(v) => void change({ [row.key]: v })}
                  />
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-5">
        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
          These are interface mock settings. No production configuration is connected or changed.
        </p>
        <Button onClick={() => setMessage("Settings remain available in demo mode.")}>
          Update setting
        </Button>
      </div>
    </>
  );
}
