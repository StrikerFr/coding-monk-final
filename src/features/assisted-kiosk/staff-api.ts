import { getEncounter, listEncounters, saveAnswer } from "@/lib/clinical/clinical.functions";
import { listRecentDocuments } from "@/lib/clinical/documents.functions";

/** Real clinic data used by the staff workspace pages. */
export const staffApi = {
  listEncounters: () => listEncounters(),
  getEncounter: (encounterId: string) => getEncounter({ data: { encounterId } }),
  listRecentDocuments: () => listRecentDocuments(),
  saveVital: (encounterId: string, questionId: string, value: string, label: string) =>
    saveAnswer({
      data: {
        encounterId,
        questionId,
        questionText: label,
        transcript: value,
        source: "typed",
      },
    }),
};
