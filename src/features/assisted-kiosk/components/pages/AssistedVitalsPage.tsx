import { useEffect, useMemo, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  Activity,
  CheckCircle2,
  Heart,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Stethoscope,
  Thermometer,
  User,
  Weight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { staffApi } from "@/features/assisted-kiosk/staff-api";
import type { AnswerRow, EncounterDetail, EncounterRow } from "@/lib/clinical/types";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  StatusBadge,
  formatDateTime,
} from "../StaffUi";

function calculateBmi(heightCm: number, weightKg: number): { bmi: number; category: string; color: string } | null {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  if (bmi < 18.5) return { bmi, category: "Underweight", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  if (bmi <= 24.9) return { bmi, category: "Normal weight", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
  if (bmi <= 29.9) return { bmi, category: "Overweight", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  return { bmi, category: "Obese", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
}

function classifyBp(systolic: number, diastolic: number): { category: string; color: string } | null {
  if (!systolic || !diastolic) return null;
  if (systolic > 180 || diastolic > 120) {
    return { category: "Hypertensive Crisis", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return { category: "Stage 2 Hypertension", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return { category: "Stage 1 Hypertension", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  }
  if (systolic >= 120 && diastolic < 80) {
    return { category: "Elevated", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" };
  }
  if (systolic < 120 && diastolic < 80) {
    return { category: "Normal BP", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" };
  }
  return null;
}

export function AssistedVitalsPage() {
  const searchParams = useSearch({ strict: false }) as { encounterId?: string };
  const [encounters, setEncounters] = useState<EncounterRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(searchParams?.encounterId ?? null);
  const [detail, setDetail] = useState<EncounterDetail | null>(null);
  const [loadingEncounters, setLoadingEncounters] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Form fields
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [temperature, setTemperature] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [spo2, setSpo2] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");

  // Load encounters list
  useEffect(() => {
    let active = true;
    setLoadingEncounters(true);
    staffApi
      .listEncounters()
      .then((rows) => {
        if (!active) return;
        setEncounters(rows);
        if (!selectedId && rows.length > 0 && rows[0]) {
          setSelectedId(rows[0].id);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (active) setLoadingEncounters(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  // Load encounter detail and hydrate form fields
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoadingDetail(true);
    setSaveSuccess(false);
    staffApi
      .getEncounter(selectedId)
      .then((data) => {
        if (!active) return;
        setDetail(data);

        // Populate fields from answers
        const answers = data.answers;
        const findVal = (qid: string) => answers.find((a) => a.questionId === qid)?.transcript ?? "";

        const bpVal = findVal("bp") || findVal("bloodPressure");
        if (bpVal.includes("/")) {
          const parts = bpVal.split("/");
          const s = parts[0];
          const d = parts[1];
          setSystolic(s ? s.replace(/[^0-9]/g, "") : "");
          setDiastolic(d ? d.replace(/[^0-9]/g, "") : "");
        } else {
          setSystolic(findVal("systolic").replace(/[^0-9]/g, ""));
          setDiastolic(findVal("diastolic").replace(/[^0-9]/g, ""));
        }

        setPulse(findVal("pulse").replace(/[^0-9]/g, ""));
        setTemperature(findVal("temperature").replace(/[^0-9.]/g, ""));
        setHeight(findVal("height").replace(/[^0-9.]/g, ""));
        setWeight(findVal("weight").replace(/[^0-9.]/g, ""));
        setSpo2(findVal("spo2").replace(/[^0-9]/g, ""));
        setRespiratoryRate(findVal("respiratoryRate").replace(/[^0-9]/g, ""));
      })
      .catch(() => {
        if (active) setDetail(null);
      })
      .finally(() => {
        if (active) setLoadingDetail(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId, reloadKey]);

  const filteredEncounters = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return encounters;
    return encounters.filter(
      (e) =>
        e.patientName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.patientId.toLowerCase().includes(q),
    );
  }, [encounters, filterQuery]);

  const selectedEncounter = useMemo(
    () => encounters.find((e) => e.id === selectedId) ?? null,
    [encounters, selectedId],
  );

  const bpClassification = useMemo(() => {
    const s = Number(systolic);
    const d = Number(diastolic);
    return classifyBp(s, d);
  }, [systolic, diastolic]);

  const bmiCalc = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    return calculateBmi(h, w);
  }, [height, weight]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const saves: Promise<unknown>[] = [];

      // Blood pressure
      if (systolic.trim() && diastolic.trim()) {
        const bpString = `${systolic.trim()}/${diastolic.trim()} mmHg`;
        saves.push(staffApi.saveVital(selectedId, "bp", bpString, "Blood Pressure"));
        saves.push(staffApi.saveVital(selectedId, "systolic", systolic.trim(), "Systolic BP"));
        saves.push(staffApi.saveVital(selectedId, "diastolic", diastolic.trim(), "Diastolic BP"));
      }

      // Pulse
      if (pulse.trim()) {
        saves.push(staffApi.saveVital(selectedId, "pulse", `${pulse.trim()} bpm`, "Pulse"));
      }

      // Temperature
      if (temperature.trim()) {
        saves.push(staffApi.saveVital(selectedId, "temperature", `${temperature.trim()} °F`, "Temperature"));
      }

      // Height
      if (height.trim()) {
        saves.push(staffApi.saveVital(selectedId, "height", `${height.trim()} cm`, "Height"));
      }

      // Weight
      if (weight.trim()) {
        saves.push(staffApi.saveVital(selectedId, "weight", `${weight.trim()} kg`, "Weight"));
      }

      // SpO2
      if (spo2.trim()) {
        saves.push(staffApi.saveVital(selectedId, "spo2", `${spo2.trim()}%`, "Oxygen Saturation"));
      }

      // Respiratory rate
      if (respiratoryRate.trim()) {
        saves.push(staffApi.saveVital(selectedId, "respiratoryRate", `${respiratoryRate.trim()} /min`, "Respiratory Rate"));
      }

      // BMI if height and weight exist
      if (bmiCalc) {
        saves.push(staffApi.saveVital(selectedId, "bmi", `${bmiCalc.bmi} (${bmiCalc.category})`, "Body Mass Index"));
      }

      await Promise.all(saves);
      setSaveSuccess(true);
      // Refresh encounter data
      setReloadKey((k) => k + 1);
    } catch {
      /* handled */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="A4 · Staff Vitals & Measurements"
        title="Manual Vitals Entry & Triage"
        description="Record and update blood pressure, pulse, temperature, SpO2, and anthropometric vitals for patient visits."
        icon={Stethoscope}
        stats={[
          { label: "Active Visits", value: encounters.filter((e) => e.status === "in-progress").length },
          { label: "Total Patients", value: encounters.length },
          { label: "Vitals Queue", value: "Ready" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left column: Patient encounter selector */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by patient name or ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[640px] space-y-2 overflow-y-auto pr-1">
            {loadingEncounters ? (
              <StaffLoading rows={4} />
            ) : filteredEncounters.length === 0 ? (
              <StaffEmpty title="No encounters found" body="Try a different search query." />
            ) : (
              filteredEncounters.map((encounter) => {
                const active = encounter.id === selectedId;
                return (
                  <button
                    key={encounter.id}
                    type="button"
                    onClick={() => setSelectedId(encounter.id)}
                    className={`flex w-full flex-col items-start gap-1 rounded-xl border p-3.5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary-soft/50 shadow-xs"
                        : "border-border bg-surface hover:bg-surface-sunken"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">{encounter.patientName}</span>
                      <StatusBadge status={encounter.status} />
                    </div>
                    <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                      <span>{encounter.age} yrs · {encounter.language === "hi" ? "Hindi" : "English"}</span>
                      <span className="font-mono">{encounter.id.slice(-8)}</span>
                    </div>
                    {encounter.chiefComplaint && (
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground italic">
                        "{encounter.chiefComplaint}"
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Vitals Form */}
        <div className="space-y-6">
          {selectedEncounter ? (
            <Card className="border-border bg-surface shadow-xs">
              <CardHeader className="border-b border-border pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl font-semibold">
                      {selectedEncounter.patientName}
                    </CardTitle>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {selectedEncounter.age} years · {selectedEncounter.patientId} · Visit started {formatDateTime(selectedEncounter.startedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedEncounter.status} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReloadKey((k) => k + 1)}
                      disabled={loadingDetail}
                    >
                      <RefreshCw className={`size-3.5 ${loadingDetail ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {saveSuccess && (
                  <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                    <span>Vitals successfully recorded and attached to the patient encounter.</span>
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                  {/* Blood Pressure Row */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="size-4 text-rose-500" />
                        <h3 className="text-sm font-semibold">Blood Pressure (BP)</h3>
                      </div>
                      {bpClassification && (
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bpClassification.color}`}>
                          {bpClassification.category}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bp-systolic" className="text-xs text-muted-foreground">
                          Systolic (mmHg)
                        </Label>
                        <Input
                          id="bp-systolic"
                          type="number"
                          min="50"
                          max="260"
                          placeholder="e.g. 120"
                          value={systolic}
                          onChange={(e) => setSystolic(e.target.value)}
                          className="mt-1 font-mono text-base"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bp-diastolic" className="text-xs text-muted-foreground">
                          Diastolic (mmHg)
                        </Label>
                        <Input
                          id="bp-diastolic"
                          type="number"
                          min="30"
                          max="160"
                          placeholder="e.g. 80"
                          value={diastolic}
                          onChange={(e) => setDiastolic(e.target.value)}
                          className="mt-1 font-mono text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Heart Rate & Temperature */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Pulse */}
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="size-4 text-rose-500" />
                          <Label htmlFor="vital-pulse" className="text-sm font-semibold">
                            Pulse / Heart Rate
                          </Label>
                        </div>
                        {pulse && Number(pulse) > 100 && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                            Tachycardia
                          </span>
                        )}
                        {pulse && Number(pulse) < 60 && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                            Bradycardia
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          id="vital-pulse"
                          type="number"
                          min="30"
                          max="220"
                          placeholder="e.g. 72"
                          value={pulse}
                          onChange={(e) => setPulse(e.target.value)}
                          className="font-mono text-base"
                        />
                        <span className="text-xs text-muted-foreground font-medium">bpm</span>
                      </div>
                    </div>

                    {/* Temperature */}
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="size-4 text-amber-500" />
                          <Label htmlFor="vital-temp" className="text-sm font-semibold">
                            Temperature
                          </Label>
                        </div>
                        {temperature && Number(temperature) >= 100.4 && (
                          <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                            Fever
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          id="vital-temp"
                          type="number"
                          step="0.1"
                          min="90"
                          max="110"
                          placeholder="e.g. 98.6"
                          value={temperature}
                          onChange={(e) => setTemperature(e.target.value)}
                          className="font-mono text-base"
                        />
                        <span className="text-xs text-muted-foreground font-medium">°F</span>
                      </div>
                    </div>
                  </div>

                  {/* Height, Weight & Calculated BMI */}
                  <div className="rounded-2xl border border-border bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Weight className="size-4 text-blue-500" />
                        <h3 className="text-sm font-semibold">Body Measurements & BMI</h3>
                      </div>
                      {bmiCalc && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bmiCalc.color}`}>
                          <span>BMI: {bmiCalc.bmi}</span>
                          <span>·</span>
                          <span>{bmiCalc.category}</span>
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vital-height" className="text-xs text-muted-foreground">
                          Height (cm)
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            id="vital-height"
                            type="number"
                            step="0.5"
                            min="30"
                            max="250"
                            placeholder="e.g. 170"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="font-mono text-base"
                          />
                          <span className="text-xs text-muted-foreground font-medium">cm</span>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="vital-weight" className="text-xs text-muted-foreground">
                          Weight (kg)
                        </Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            id="vital-weight"
                            type="number"
                            step="0.1"
                            min="2"
                            max="300"
                            placeholder="e.g. 68.5"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="font-mono text-base"
                          />
                          <span className="text-xs text-muted-foreground font-medium">kg</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SpO2 & Respiratory Rate */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* SpO2 */}
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <Label htmlFor="vital-spo2" className="text-sm font-semibold">
                        Oxygen Saturation (SpO2)
                      </Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          id="vital-spo2"
                          type="number"
                          min="50"
                          max="100"
                          placeholder="e.g. 98"
                          value={spo2}
                          onChange={(e) => setSpo2(e.target.value)}
                          className="font-mono text-base"
                        />
                        <span className="text-xs text-muted-foreground font-medium">%</span>
                      </div>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="rounded-2xl border border-border bg-background p-4">
                      <Label htmlFor="vital-resp" className="text-sm font-semibold">
                        Respiratory Rate
                      </Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          id="vital-resp"
                          type="number"
                          min="5"
                          max="60"
                          placeholder="e.g. 16"
                          value={respiratoryRate}
                          onChange={(e) => setRespiratoryRate(e.target.value)}
                          className="font-mono text-base"
                        />
                        <span className="text-xs text-muted-foreground font-medium">/min</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={saving || loadingDetail}
                      className="min-h-12 min-w-40 px-6 font-semibold"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Saving vitals...
                        </>
                      ) : (
                        <>
                          <Save className="size-4" />
                          Save Vitals
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <StaffEmpty
              title="Select a patient encounter"
              body="Choose a patient from the list on the left to review or enter their clinical vitals."
            />
          )}
        </div>
      </div>
    </div>
  );
}
