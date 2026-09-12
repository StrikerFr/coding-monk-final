import { useEffect, useState } from "react";
import { Settings2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useClinician } from "@/features/clinician/clinician-context";
import { StaffPageHeader } from "@/features/assisted-kiosk/components/StaffUi";

const STORAGE_KEY = "medikiosk.clinician.preferences";

interface Preferences {
  language: "English" | "Hindi";
  largeText: boolean;
  showPatientWords: boolean;
  alertSounds: boolean;
  compactWorklist: boolean;
}

const DEFAULTS: Preferences = {
  language: "English",
  largeText: false,
  showPatientWords: true,
  alertSounds: false,
  compactWorklist: false,
};

export function ClinicianSettingsPage() {
  const { clinician, availability, setAvailability } = useClinician();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) });
    } catch {
      /* preferences stay at their defaults */
    }
  }, []);

  const update = (patch: Partial<Preferences>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    } catch {
      /* saving preferences is best effort */
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Clinical workspace"
        title="Settings"
        description="Your workspace preferences on this device — language, display and alerts."
        icon={Settings2}
        stats={[
          { label: "Signed in as", value: clinician.name.split(" ")[0] ?? "—" },
          { label: "Availability", value: availability },
          { label: "Saved", value: saved ? "Just now" : "Up to date" },
        ]}
      />

      <Card className="border-border">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-surface-sunken">
              <UserRound className="size-5 text-muted-foreground" />
            </span>
            <div>
              <p className="font-semibold">{clinician.name}</p>
              <p className="text-sm text-muted-foreground">{clinician.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={availability === "available" ? "secondary" : "outline"}>
              {availability}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAvailability(availability === "available" ? "busy" : "available")}
            >
              Mark {availability === "available" ? "busy" : "available"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="space-y-1 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Language
          </h2>
          <p className="pb-3 text-sm text-muted-foreground">
            Used for labels in your workspace. Patient answers always stay in the patient's own words.
          </p>
          <div className="flex gap-2">
            {(["English", "Hindi"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={prefs.language === option ? "default" : "outline"}
                onClick={() => update({ language: option })}
              >
                {option === "Hindi" ? "हिंदी" : "English"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="divide-y divide-border p-0">
          <Toggle
            id="large-text"
            title="Larger text"
            body="Increase text size across the workspace."
            checked={prefs.largeText}
            onChange={(value) => update({ largeText: value })}
          />
          <Toggle
            id="patient-words"
            title="Always show the patient's own words"
            body="Display the original quote beside every confirmed detail."
            checked={prefs.showPatientWords}
            onChange={(value) => update({ showPatientWords: value })}
          />
          <Toggle
            id="alert-sounds"
            title="Sound for new alerts"
            body="Play a short sound when a case is flagged for attention."
            checked={prefs.alertSounds}
            onChange={(value) => update({ alertSounds: value })}
          />
          <Toggle
            id="compact-worklist"
            title="Compact worklist"
            body="Fit more patients on screen by reducing row height."
            checked={prefs.compactWorklist}
            onChange={(value) => update({ compactWorklist: value })}
          />
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Preferences are saved on this device only and never change any patient record.
      </p>
    </div>
  );
}

function Toggle({
  id,
  title,
  body,
  checked,
  onChange,
}: {
  id: string;
  title: string;
  body: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <Label htmlFor={id} className="text-[15px] font-medium">
          {title}
        </Label>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
