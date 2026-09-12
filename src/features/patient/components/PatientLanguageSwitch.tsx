import { GlobalLanguageSelector } from "@/components/a11y";

/** Patient PWA reuses the one global MediKiosk language control. */
export function PatientLanguageSwitch({ compact = false }: { compact?: boolean }) {
  return <GlobalLanguageSelector size={compact ? "compact" : "default"} />;
}
