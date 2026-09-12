/**
 * Voice service — the single speech abstraction for all MediKiosk surfaces.
 *
 * Today it wraps the browser Web Speech API (window.speechSynthesis). The
 * interface is intentionally transport-agnostic so a MediKiosk Speech Service
 * (for example POST /api/v1/tts/synthesize) can replace the engine later
 * without any UI change.
 */
export type SpeechLanguage = "hi" | "en";

export type SpeakRequest = {
  text: string;
  language: SpeechLanguage;
  /** 0.8 slow, 1 normal, 1.15 fast. */
  rate?: number;
  /** "immediate" cancels anything already speaking (default). */
  priority?: "immediate" | "queue";
  onStart?: () => void;
  onEnd?: () => void;
};

const LOCALE_PREFERENCE: Record<SpeechLanguage, string[]> = {
  hi: ["hi-in", "hi"],
  en: ["en-in", "en-gb", "en-us", "en"],
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function synth(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return "speechSynthesis" in window ? window.speechSynthesis : null;
}

export function isSpeechSupported() {
  return synth() !== null && typeof window !== "undefined" && "SpeechSynthesisUtterance" in window;
}

/** Voices load asynchronously in several browsers, so refresh on change. */
export function loadAvailableVoices(onChange?: (voices: SpeechSynthesisVoice[]) => void) {
  const engine = synth();
  if (!engine) return () => {};

  const read = () => {
    const voices = engine.getVoices();
    if (voices.length) {
      cachedVoices = voices;
      onChange?.(voices);
    }
  };

  read();
  engine.addEventListener?.("voiceschanged", read);
  return () => engine.removeEventListener?.("voiceschanged", read);
}

/** Best available voice for a language; never assumes a specific voice name. */
export function getBestVoice(language: SpeechLanguage): SpeechSynthesisVoice | null {
  const engine = synth();
  if (!engine) return null;
  const voices = cachedVoices.length ? cachedVoices : engine.getVoices();
  if (!voices.length) return null;

  for (const locale of LOCALE_PREFERENCE[language]) {
    const exact = voices.find((voice) => voice.lang?.toLowerCase().replace("_", "-") === locale);
    if (exact) return exact;
    const partial = voices.find((voice) =>
      voice.lang?.toLowerCase().replace("_", "-").startsWith(locale),
    );
    if (partial) return partial;
  }
  return null;
}

/** Trim text so hover speech stays short and never reads an entire document. */
export function normaliseSpeechText(text: string, maxLength = 320) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength);
  const boundary = Math.max(cut.lastIndexOf("। "), cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${cut.slice(0, boundary > 60 ? boundary : maxLength)}…`;
}

export const voiceService = {
  get supported() {
    return isSpeechSupported();
  },

  speak({ text, language, rate = 1, priority = "immediate", onStart, onEnd }: SpeakRequest) {
    const engine = synth();
    const spoken = normaliseSpeechText(text);
    if (!engine || !spoken) {
      onEnd?.();
      return false;
    }

    if (priority === "immediate") engine.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = rate;
      const voice = getBestVoice(language);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.onstart = () => onStart?.();
      utterance.onend = () => onEnd?.();
      utterance.onerror = () => onEnd?.();
      engine.speak(utterance);
      return true;
    } catch {
      onEnd?.();
      return false;
    }
  },

  stop() {
    synth()?.cancel();
  },

  pause() {
    synth()?.pause();
  },

  resume() {
    synth()?.resume();
  },
};
