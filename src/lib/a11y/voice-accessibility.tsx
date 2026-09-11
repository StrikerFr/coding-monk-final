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
import { useAppLanguage } from "./app-language";
import { getSpeakText } from "./get-speak-text";
import { isSpeechSupported, loadAvailableVoices, voiceService } from "./voice-service";

export type SpeechSpeed = "slow" | "normal" | "fast";

const RATES: Record<SpeechSpeed, number> = { slow: 0.8, normal: 1, fast: 1.15 };

const READ_ALOUD_KEY = "medikiosk-read-aloud";
const SPEED_KEY = "medikiosk-speech-speed";
const HOVER_DEBOUNCE_MS = 300;

type VoiceValue = {
  /** Browser speech synthesis availability. */
  speechSupported: boolean;
  readAloudEnabled: boolean;
  setReadAloudEnabled: (value: boolean) => void;
  toggleReadAloud: () => void;
  speed: SpeechSpeed;
  setSpeed: (speed: SpeechSpeed) => void;
  currentlySpeaking: boolean;
  currentTargetId: string | null;
  /** Speak text explicitly (Listen buttons); works even when hover speech is off. */
  speak: (text: string, options?: { id?: string }) => void;
  stop: () => void;
};

const VoiceContext = createContext<VoiceValue | null>(null);

export function VoiceAccessibilityProvider({ children }: { children: ReactNode }) {
  const { language } = useAppLanguage();
  const [speechSupported, setSpeechSupported] = useState(false);
  const [readAloudEnabled, setReadAloudEnabledState] = useState(false);
  const [speed, setSpeedState] = useState<SpeechSpeed>("normal");
  const [currentlySpeaking, setCurrentlySpeaking] = useState(false);
  const [currentTargetId, setCurrentTargetId] = useState<string | null>(null);

  const languageRef = useRef(language);
  const speedRef = useRef(speed);
  const enabledRef = useRef(readAloudEnabled);
  const lastElementRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);

  languageRef.current = language;
  speedRef.current = speed;
  enabledRef.current = readAloudEnabled;

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
    return loadAvailableVoices();
  }, []);

  // Restore stored preferences after hydration.
  useEffect(() => {
    try {
      setReadAloudEnabledState(window.localStorage.getItem(READ_ALOUD_KEY) === "on");
      const storedSpeed = window.localStorage.getItem(SPEED_KEY);
      if (storedSpeed === "slow" || storedSpeed === "normal" || storedSpeed === "fast") {
        setSpeedState(storedSpeed);
      }
    } catch {
      // Defaults are fine.
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearTimer();
    voiceService.stop();
    lastElementRef.current?.removeAttribute("data-speaking");
    lastElementRef.current = null;
    setCurrentlySpeaking(false);
    setCurrentTargetId(null);
  }, [clearTimer]);

  const speakElement = useCallback((element: HTMLElement) => {
    const text = getSpeakText(element, languageRef.current);
    if (!text) return;

    // Interrupt anything already speaking, then mark the new target.
    voiceService.stop();
    lastElementRef.current?.removeAttribute("data-speaking");
    lastElementRef.current = element;
    element.setAttribute("data-speaking", "true");
    setCurrentTargetId(element.id || element.getAttribute("data-speak-id") || null);

    voiceService.speak({
      text,
      language: languageRef.current,
      rate: RATES[speedRef.current],
      onStart: () => setCurrentlySpeaking(true),
      onEnd: () => {
        element.removeAttribute("data-speaking");
        setCurrentlySpeaking(false);
      },
    });
  }, []);

  const speak = useCallback(
    (text: string, options?: { id?: string }) => {
      if (!text.trim()) return;
      clearTimer();
      voiceService.stop();
      lastElementRef.current?.removeAttribute("data-speaking");
      lastElementRef.current = null;
      setCurrentTargetId(options?.id ?? null);
      voiceService.speak({
        text,
        language: languageRef.current,
        rate: RATES[speedRef.current],
        onStart: () => setCurrentlySpeaking(true),
        onEnd: () => setCurrentlySpeaking(false),
      });
    },
    [clearTimer],
  );

  const setReadAloudEnabled = useCallback(
    (value: boolean) => {
      setReadAloudEnabledState(value);
      try {
        window.localStorage.setItem(READ_ALOUD_KEY, value ? "on" : "off");
      } catch {
        // Session-only preference.
      }
      if (!value) stop();
    },
    [stop],
  );

  const setSpeed = useCallback((next: SpeechSpeed) => {
    setSpeedState(next);
    try {
      window.localStorage.setItem(SPEED_KEY, next);
    } catch {
      // Session-only preference.
    }
  }, []);

  // Changing language must never continue speech in the previous language.
  useEffect(() => {
    voiceService.stop();
    setCurrentlySpeaking(false);
  }, [language]);

  // One global delegated listener set — no surface implements its own speech.
  useEffect(() => {
    if (!readAloudEnabled || !speechSupported) return;

    const readable = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const element = target.closest<HTMLElement>("[data-speak]");
      if (!element || element.getAttribute("data-speak") === "off") return null;
      if (element.getAttribute("aria-hidden") === "true") return null;
      return element;
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return; // touch uses focus / Listen controls
      const element = readable(event.target);
      if (!element || element === lastElementRef.current) return;
      clearTimer();
      timerRef.current = window.setTimeout(() => speakElement(element), HOVER_DEBOUNCE_MS);
    };

    const onPointerOut = (event: PointerEvent) => {
      const element = readable(event.target);
      if (!element) return;
      const next = readable(event.relatedTarget);
      if (next === element) return;
      clearTimer();
      if (element === lastElementRef.current) {
        element.removeAttribute("data-speaking");
        lastElementRef.current = null;
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const element = readable(event.target);
      if (!element || element === lastElementRef.current) return;
      clearTimer();
      speakElement(element);
    };

    document.addEventListener("pointerover", onPointerOver, true);
    document.addEventListener("pointerout", onPointerOut, true);
    document.addEventListener("focusin", onFocusIn, true);
    return () => {
      document.removeEventListener("pointerover", onPointerOver, true);
      document.removeEventListener("pointerout", onPointerOut, true);
      document.removeEventListener("focusin", onFocusIn, true);
      clearTimer();
    };
  }, [readAloudEnabled, speechSupported, speakElement, clearTimer]);

  // Never leave speech running when the surface unmounts.
  useEffect(() => () => voiceService.stop(), []);

  const value = useMemo<VoiceValue>(
    () => ({
      speechSupported,
      readAloudEnabled,
      setReadAloudEnabled,
      toggleReadAloud: () => setReadAloudEnabled(!readAloudEnabled),
      speed,
      setSpeed,
      currentlySpeaking,
      currentTargetId,
      speak,
      stop,
    }),
    [
      speechSupported,
      readAloudEnabled,
      setReadAloudEnabled,
      speed,
      setSpeed,
      currentlySpeaking,
      currentTargetId,
      speak,
      stop,
    ],
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}

export function useVoiceAccessibility() {
  const ctx = useContext(VoiceContext);
  if (!ctx) throw new Error("useVoiceAccessibility must be used inside VoiceAccessibilityProvider");
  return ctx;
}

/** Speak a specific piece of text on demand (used by Listen controls). */
export function useSpeech() {
  const { speak, stop, currentlySpeaking, speechSupported } = useVoiceAccessibility();
  return { speak, stop, currentlySpeaking, speechSupported };
}
