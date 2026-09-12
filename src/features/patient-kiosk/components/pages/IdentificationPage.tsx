import { useState } from "react";
import { useKiosk } from "@/features/patient-kiosk/kiosk-context";
import { stepNumber } from "@/features/patient-kiosk/session";
import type { KioskTranslationKey } from "@/features/patient-kiosk/translations/en";
import { savePatientDetails } from "@/lib/clinical/clinical.functions";
import { KioskChoice } from "../KioskChoice";
import { KioskNumberPad } from "../KioskNumberPad";
import { KioskStepContainer } from "../KioskStepContainer";
import { KioskSubSteps, type KioskSubStep } from "../KioskSubSteps";
import { KioskText } from "../KioskText";
import { KioskVoiceAnswer } from "../KioskVoiceAnswer";

const GENDERS: Array<{ id: string; key: KioskTranslationKey }> = [
  { id: "female", key: "kiosk.id.gender.female" },
  { id: "male", key: "kiosk.id.gender.male" },
  { id: "other", key: "kiosk.id.gender.other" },
];

/** One detail per card: name is spoken, the rest is tapped. No keyboard anywhere. */
export function IdentificationPage() {
  const { session, updateSession } = useKiosk();
  const [name, setName] = useState(session?.profile["name"] ?? "");
  const [age, setAge] = useState(session?.profile["age"] ?? "");
  const [gender, setGender] = useState(session?.profile["gender"] ?? "");
  const [phone, setPhone] = useState(session?.profile["phone"] ?? "");

  const updateProfileField = (key: "name" | "age" | "gender" | "phone", val: string) => {
    if (key === "name") setName(val);
    if (key === "age") setAge(val);
    if (key === "gender") setGender(val);
    if (key === "phone") setPhone(val);
    updateSession({
      profile: {
        ...(session?.profile ?? {}),
        name: key === "name" ? val : name,
        age: key === "age" ? val : age,
        gender: key === "gender" ? val : gender,
        phone: key === "phone" ? val : phone,
      },
    });
  };

  const cards: KioskSubStep[] = [
    {
      id: "name",
      canContinue: Boolean(name),
      content: (
        <KioskVoiceAnswer
          questionKey="kiosk.id.nameQuestion"
          answer={name}
          onAnswer={(text) => updateProfileField("name", text)}
        />
      ),
    },
    {
      id: "age",
      canContinue: Boolean(age),
      content: (
        <div className="mx-auto max-w-md">
          <KioskNumberPad
            labelKey="kiosk.id.age"
            hintKey="kiosk.id.ageHint"
            value={age}
            maxLength={3}
            onChange={(val) => updateProfileField("age", val)}
          />
        </div>
      ),
    },
    {
      id: "gender",
      content: (
        <fieldset className="rounded-3xl border border-border bg-surface px-4 py-3 sm:px-5 sm:py-4">
          <legend className="px-2">
            <KioskText tkey="kiosk.id.gender" as="span" className="text-base font-semibold sm:text-lg" />
          </legend>
          <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
            {GENDERS.map((option) => (
              <KioskChoice
                key={option.id}
                tkey={option.key}
                selected={gender === option.id}
                onSelect={() => updateProfileField("gender", gender === option.id ? "" : option.id)}
              />
            ))}
          </div>
        </fieldset>
      ),
    },
    {
      id: "phone",
      content: (
        <div className="mx-auto max-w-md">
          <KioskNumberPad
            labelKey="kiosk.id.phone"
            hintKey="kiosk.id.phoneHint"
            value={phone}
            maxLength={10}
            onChange={(val) => updateProfileField("phone", val)}
          />
        </div>
      ),
    },
  ];

  return (
    <KioskStepContainer step={stepNumber("identification")}>
      <div className="mx-auto max-w-3xl">
        <KioskText
          tkey="kiosk.id.heading"
          as="h1"
          className="text-2xl font-semibold sm:text-3xl"
          secondaryClassName="text-lg font-normal"
        />
        <KioskText tkey="kiosk.id.support" as="p" className="mt-1 text-sm sm:text-base text-muted-foreground" />

        <div className="mt-3 sm:mt-4">
          <KioskSubSteps
            stepId="identification"
            items={cards}
            onFinish={() => {
              updateSession({ profile: { name, age, gender, phone } });
              if (session?.encounterId) {
                const ageNum = Number(age);
                void savePatientDetails({
                  data: {
                    encounterId: session.encounterId,
                    language: session.language,
                    ...(name.trim() ? { name: name.trim() } : {}),
                    ...(Number.isFinite(ageNum) && ageNum > 0 ? { age: ageNum } : {}),
                    ...(phone.trim() ? { phone: phone.trim() } : {}),
                  },
                });
              }
            }}
          />
        </div>
      </div>
    </KioskStepContainer>
  );
}
