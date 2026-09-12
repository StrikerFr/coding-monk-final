/**
 * Shared English UI strings used by the global language + voice accessibility
 * layer. Surface-specific dictionaries stay in their own feature folders; this
 * file only holds strings that appear across MediKiosk applications.
 */
export const appEn = {
  "language.label": "Language",
  "language.hindi": "Hindi",
  "language.english": "English",
  "language.chooseHindi": "Show interface in Hindi",
  "language.chooseEnglish": "Show interface in English",

  "a11y.title": "Accessibility",
  "a11y.open": "Open accessibility settings",
  "a11y.textSize": "Text size",
  "a11y.decreaseText": "Decrease text size",
  "a11y.increaseText": "Increase text size",
  "a11y.contrast": "High contrast",
  "a11y.motion": "Reduced motion",
  "a11y.reset": "Reset accessibility settings",

  "voice.title": "Read Aloud",
  "voice.on": "Read Aloud On",
  "voice.off": "Read Aloud Off",
  "voice.toggle": "Turn Read Aloud on or off",
  "voice.hint": "When on, MediKiosk speaks the item you point at or move focus to.",
  "voice.speed": "Speech speed",
  "voice.speed.slow": "Slow",
  "voice.speed.normal": "Normal",
  "voice.speed.fast": "Fast",
  "voice.stop": "Stop speaking",
  "voice.speaking": "Speaking",
  "voice.listen": "Listen",
  "voice.listenTo": "Listen to this text",
  "voice.unsupported": "Read Aloud isn't available in this browser.",

  "common.home": "Home",
  "common.help": "Need Help?",
  "common.start": "Start",
  "common.continue": "Continue",
  "common.back": "Back",
  "common.close": "Close",
  "common.menu": "Menu",
  "common.search": "Search",
  "common.settings": "Settings",
  "common.skipToContent": "Skip to main content",
} as const;

export type AppTranslationKey = keyof typeof appEn;
