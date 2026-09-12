import heroPoster from "@/assets/hero-kiosk-poster.jpg";
import stepSpeak from "@/assets/step-speak.jpg";
import stepDoctor from "@/assets/step-doctor.jpg";
import noTyping from "@/assets/no-typing.jpg";
import trustAmbient from "@/assets/trust-ambient.jpg";
import closingAmbient from "@/assets/closing-ambient.jpg";
import patientElderMan from "@/assets/patient-elder-man.jpg";
import patientElderWoman from "@/assets/patient-elder-woman.jpg";
import patientYoungWoman from "@/assets/patient-young-woman.jpg";
import patientFamily from "@/assets/patient-family.jpg";
import documentsPhoto from "@/assets/documents.jpg";
import careCinematic from "@/assets/care-cinematic.jpg";
import ayushRoom from "@/assets/ayush.jpg";

/**
 * Mock content + media map. Real video files can be added here later as
 * `video: "/media/....mp4"`; posters stay as the graceful fallback.
 */
export const media = {
  hero: {
    poster: heroPoster,
    width: 1600,
    height: 1008,
    alt: "A woman speaks calmly to a MediKiosk screen in a bright hospital lobby.",
    altHi: "एक महिला अस्पताल में मेडिकिओस्क स्क्रीन से आराम से बात कर रही है।",
    video: undefined as string | undefined,
  },
  speak: {
    poster: stepSpeak,
    width: 1008,
    height: 1200,
    alt: "An elderly man speaking calmly while seated in a hospital waiting area.",
    altHi: "एक बुज़ुर्ग व्यक्ति अस्पताल में शांति से बात कर रहे हैं।",
    video: undefined as string | undefined,
  },
  doctor: {
    poster: stepDoctor,
    width: 1008,
    height: 1200,
    alt: "A doctor reading a short patient summary on a tablet.",
    altHi: "एक डॉक्टर टैबलेट पर मरीज़ का संक्षिप्त विवरण पढ़ रही हैं।",
    video: undefined as string | undefined,
  },
  noTyping: {
    poster: noTyping,
    width: 1408,
    height: 1008,
    alt: "A woman speaking to a kiosk with her hands relaxed at her sides.",
    altHi: "एक महिला हाथ लगाए बिना, बोलकर कियोस्क से बात कर रही है।",
    video: undefined as string | undefined,
  },
  trust: {
    poster: trustAmbient,
    width: 1408,
    height: 912,
    alt: "Soft warm light falling across a quiet ivory surface.",
    altHi: "शांत हल्की रोशनी वाली एक सादी सतह।",
  },
  closing: {
    poster: closingAmbient,
    width: 1600,
    height: 912,
    alt: "A softly blurred, sunlit hospital corridor with green plants.",
    altHi: "धूप से भरा, धुंधला अस्पताल का शांत गलियारा।",
  },
  documents: {
    poster: documentsPhoto,
    width: 1408,
    height: 1008,
    alt: "A handwritten prescription and a printed lab report resting on a warm table.",
    altHi: "मेज़ पर रखी एक पर्ची और एक जाँच रिपोर्ट।",
  },
  cinematic: {
    poster: careCinematic,
    width: 1920,
    height: 1080,
    alt: "A quiet, sunlit corridor of an Indian health centre with plants along the windows.",
    altHi: "धूप से भरा, पौधों वाला भारतीय स्वास्थ्य केंद्र का शांत गलियारा।",
  },
  ayush: {
    poster: ayushRoom,
    width: 1408,
    height: 1008,
    alt: "An AYUSH consultation table with brass bowls of dried herbs and an open notebook.",
    altHi: "आयुष परामर्श कक्ष की मेज़ पर पीतल के बर्तनों में जड़ी-बूटियाँ और एक खुली नोटबुक।",
  },
} as const;

/** Faces of the people MediKiosk is built for. Photography, not statistics. */
export const patients = [
  {
    poster: patientElderWoman,
    alt: "An elderly Indian woman seated calmly in a clinic waiting area.",
    altHi: "क्लिनिक में शांति से बैठी एक बुज़ुर्ग महिला।",
    hi: "अपनी भाषा में बोल सकें।",
    en: "Speak in your own language.",
  },
  {
    poster: patientElderMan,
    alt: "An elderly Indian man in a white kurta seated in a bright clinic.",
    altHi: "सफ़ेद कुर्ते में क्लिनिक में बैठे एक बुज़ुर्ग व्यक्ति।",
    hi: "कम पढ़ना पड़े।",
    en: "Less to read.",
  },
  {
    poster: patientYoungWoman,
    alt: "A young woman speaking to a touchscreen kiosk at a health centre.",
    altHi: "स्वास्थ्य केंद्र में कियोस्क से बात करती एक युवती।",
    hi: "कम लिखना पड़े।",
    en: "Nothing to type.",
  },
  {
    poster: patientFamily,
    alt: "A man helping his elderly mother at a health centre reception.",
    altHi: "स्वास्थ्य केंद्र में अपनी माँ की मदद करते एक व्यक्ति।",
    hi: "हर सवाल समझ में आए।",
    en: "Every question makes sense.",
  },
] as const;
