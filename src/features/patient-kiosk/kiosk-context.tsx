import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en, type KioskTranslationKey } from "./translations/en";
import { hi as hiStrings } from "./translations/hi";
import { patientKioskApi } from "./api";
import { useAppLanguage } from "@/lib/a11y";
import type { KioskLanguage, KioskStepId, PatientKioskSession } from "./session";

type Vars = Record<string, string | number>;

type KioskValue = {
  language: KioskLanguage;
  setLanguage: (lang: KioskLanguage) => void;
  /** True until the patient picks a language — screens show Hindi + English together. */
  bilingual: boolean;
  /** Translate a key in the active language. */
  t: (key: KioskTranslationKey, vars?: Vars) => string;
  /** Translate a key in a specific language (for bilingual pairings). */
  tIn: (lang: KioskLanguage, key: KioskTranslationKey, vars?: Vars) => string;
  session: PatientKioskSession | null;
  goToStep: (step: KioskStepId) => void;
  /** Merges details, answers, papers or measurements into the session. */
  updateSession: (patch: Partial<PatientKioskSession>) => void;
  /** Stores the whole check-in. Resolves false when it could not be saved. */
  saveSession: () => Promise<boolean>;
  /** Finishes the check-in. Resolves false when it could not be completed. */
  completeSession: () => Promise<boolean>;
  /** The patient agreed with the read-back for one question. */
  confirmAnswer: (questionId: string) => Promise<void>;
};

const KioskContext = createContext<KioskValue | null>(null);

const dictionaries: Record<KioskLanguage, Record<KioskTranslationKey, string>> = {
  en,
  hi: hiStrings,
};

function format(template: string, vars?: Vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}

export function KioskProvider({ children }: { children: ReactNode }) {
  const { language: appLanguage, setLanguage: setAppLanguage } = useAppLanguage();
  const [language, setLanguageState] = useState<KioskLanguage>("hi");
  const [languageChosen, setLanguageChosen] = useState(false);
  const [session, setSession] = useState<PatientKioskSession | null>(null);

  useEffect(() => {
    let active = true;
    void patientKioskApi.startSession(language).then((s) => {
      if (active) setSession(s);
    });
    return () => {
      active = false;
    };
    // Session starts once per kiosk mount; language changes go through updateLanguage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLanguage = useCallback(
    (lang: KioskLanguage) => {
      setLanguageState(lang);
      setLanguageChosen(true);
      setAppLanguage(lang);
      void patientKioskApi.updateLanguage(lang).then(setSession);
    },
    [setAppLanguage],
  );

  // A language chosen anywhere else in MediKiosk (for example the shared
  // accessibility panel) applies to the kiosk session too.
  useEffect(() => {
    setLanguageState(appLanguage);
    setLanguageChosen(true);
    void patientKioskApi.updateLanguage(appLanguage).then(setSession);
  }, [appLanguage]);

  const goToStep = useCallback((step: KioskStepId) => {
    void patientKioskApi.setStep(step).then(setSession);
  }, []);

  const updateSession = useCallback((patch: Partial<PatientKioskSession>) => {
    void patientKioskApi.patchSession(patch).then(setSession);
  }, []);

  const saveSession = useCallback(async () => {
    try {
      setSession(await patientKioskApi.saveSession());
      return true;
    } catch {
      return false;
    }
  }, []);

  const completeSession = useCallback(async () => {
    try {
      setSession(await patientKioskApi.completeSession());
      return true;
    } catch {
      return false;
    }
  }, []);

  const confirmAnswer = useCallback(async (questionId: string) => {
    try {
      setSession(await patientKioskApi.confirmAnswer(questionId));
    } catch {
      /* the answer itself is already stored */
    }
  }, []);

  const value = useMemo<KioskValue>(
    () => ({
      language,
      setLanguage,
      bilingual: !languageChosen,
      t: (key, vars) => format(dictionaries[language][key], vars),
      tIn: (lang, key, vars) => format(dictionaries[lang][key], vars),
      session,
      goToStep,
      updateSession,
      saveSession,
      completeSession,
      confirmAnswer,
    }),
    [
      language,
      setLanguage,
      languageChosen,
      session,
      goToStep,
      updateSession,
      saveSession,
      completeSession,
      confirmAnswer,
    ],
  );

  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
}

export function useKiosk() {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error("useKiosk must be used inside KioskProvider");
  return ctx;
}

/** True when the active language is Hindi — used for Devanagari type treatment. */
export function useIsDeva() {
  return useKiosk().language === "hi";
}
