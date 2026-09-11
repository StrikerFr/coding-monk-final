import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Visual accessibility preferences shared by every MediKiosk surface: text
 * size, high contrast and reduced motion. Each toggle drives a class or CSS
 * variable already defined in styles.css.
 */
type DisplayValue = {
  scaleStep: number;
  canGrow: boolean;
  canShrink: boolean;
  grow: () => void;
  shrink: () => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (value: boolean) => void;
  reset: () => void;
};

const DisplayContext = createContext<DisplayValue | null>(null);

const STORAGE_KEY = "medikiosk-display-preferences";

type Stored = {
  scaleStep: number;
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
};

function readStored(): Stored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      scaleStep: typeof parsed.scaleStep === "number" ? parsed.scaleStep : 0,
      highContrast: Boolean(parsed.highContrast),
      reduceMotion: Boolean(parsed.reduceMotion),
      screenReaderMode: Boolean(parsed.screenReaderMode),
    };
  } catch {
    return null;
  }
}

export function DisplayPreferencesProvider({ children }: { children: ReactNode }) {
  const [scaleStep, setScaleStep] = useState(0); // -1 .. 3
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  useEffect(() => {
    const stored = readStored();
    if (!stored) return;
    setScaleStep(stored.scaleStep);
    setHighContrast(stored.highContrast);
    setReduceMotion(stored.reduceMotion);
    setScreenReaderMode(stored.screenReaderMode);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accessibility-scale", `${1 + scaleStep * 0.1}`);
    root.classList.toggle("accessibility-contrast", highContrast);
    root.classList.toggle("accessibility-reduce-motion", reduceMotion);
    root.classList.toggle("accessibility-screen-reader", screenReaderMode);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ scaleStep, highContrast, reduceMotion, screenReaderMode }),
      );
    } catch {
      // Preference still applies for this session.
    }
  }, [scaleStep, highContrast, reduceMotion, screenReaderMode]);

  const reset = useCallback(() => {
    setScaleStep(0);
    setHighContrast(false);
    setReduceMotion(false);
    setScreenReaderMode(false);
  }, []);

  const value = useMemo<DisplayValue>(
    () => ({
      scaleStep,
      canGrow: scaleStep < 3,
      canShrink: scaleStep > -1,
      grow: () => setScaleStep((step) => Math.min(3, step + 1)),
      shrink: () => setScaleStep((step) => Math.max(-1, step - 1)),
      highContrast,
      setHighContrast,
      reduceMotion,
      setReduceMotion,
      screenReaderMode,
      setScreenReaderMode,
      reset,
    }),
    [scaleStep, highContrast, reduceMotion, screenReaderMode, reset],
  );

  return <DisplayContext.Provider value={value}>{children}</DisplayContext.Provider>;
}

export function useDisplayPreferences() {
  const ctx = useContext(DisplayContext);
  if (!ctx) throw new Error("useDisplayPreferences must be used inside DisplayPreferencesProvider");
  return ctx;
}
