import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { appEn, type AppTranslationKey } from "./translations/en";
import { appHi } from "./translations/hi";

export type Language = "hi" | "en";

const STORAGE_KEY = "medikiosk-language";

const dictionaries: Record<Language, Record<AppTranslationKey, string>> = {
  en: appEn,
  hi: appHi,
};

type AppLanguageValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Translate a shared key in the active language. */
  t: (key: AppTranslationKey) => string;
  /** Translate a shared key in a specific language. */
  tIn: (language: Language, key: AppTranslationKey) => string;
  isHindi: boolean;
};

const AppLanguageContext = createContext<AppLanguageValue | null>(null);

function readStored(): Language {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "hi" || stored === "en" ? stored : "en";
}

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Read the stored choice after hydration so SSR markup stays stable.
  useEffect(() => setLanguageState(readStored()), []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode); the choice still applies now.
    }
  }, []);

  const value = useMemo<AppLanguageValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionaries[language][key],
      tIn: (lang, key) => dictionaries[lang][key],
      isHindi: language === "hi",
    }),
    [language, setLanguage],
  );

  return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  const ctx = useContext(AppLanguageContext);
  if (!ctx) throw new Error("useAppLanguage must be used inside AppLanguageProvider");
  return ctx;
}

/** Convenience alias so components can read only the translator. */
export function useTranslation() {
  const { t, tIn, language } = useAppLanguage();
  return { t, tIn, language };
}
