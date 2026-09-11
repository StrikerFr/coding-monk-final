import { getEncounter, listEncounters } from "@/lib/clinical/clinical.functions";
import { listRecentDocuments } from "@/lib/clinical/documents.functions";

/** Real clinic data used by the staff workspace pages. */
export const staffApi = {
  listEncounters: () => listEncounters(),
  getEncounter: (encounterId: string) => getEncounter({ data: { encounterId } }),
  listRecentDocuments: () => listRecentDocuments(),
};
