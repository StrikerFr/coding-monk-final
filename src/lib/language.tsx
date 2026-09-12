import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAppLanguage } from "./a11y";

export type Lang = "hi" | "en" | "both";

type LanguageValue = {
  /** "both" until the patient chooses; then the chosen language leads. */
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Show Hindi text? */
  hi: boolean;
  /** Show English text? */
  en: boolean;
  /** Which script leads visually. */
  primary: "hi" | "en";
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { language: appLanguage, setLanguage: setAppLanguage } = useAppLanguage();
  const [lang, setLangState] = useState<Lang>("both");

  const setLang = useCallback(
    (next: Lang) => {
      setLangState(next);
      if (next !== "both") setAppLanguage(next);
    },
    [setAppLanguage],
  );

  // Follow a language chosen elsewhere in MediKiosk (shared accessibility panel).
  const previousApp = useRef(appLanguage);
  useEffect(() => {
    if (previousApp.current === appLanguage) return;
    previousApp.current = appLanguage;
    setLangState(appLanguage);
  }, [appLanguage]);

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      hi: lang !== "en",
      en: lang !== "hi",
      primary: lang === "en" ? "en" : "hi",
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
