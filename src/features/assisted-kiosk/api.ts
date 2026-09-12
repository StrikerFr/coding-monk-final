import { mockStaffSession } from "./mock/data";
import { getQueue, startIntake } from "./queue.functions";

/** Queue data is persisted; staff session remains a frontend placeholder. */
export const assistedKioskApi = {
  getSession: async () => ({ ...mockStaffSession }),
  getQueue: () => getQueue(),
  getPatient: async (id: string) => {
    const patients = await getQueue();
    return patients.find((item) => item.id === id) ?? null;
  },
  startIntake: (id: string) => startIntake({ data: { id } }),
  getIntakeStatus: async (id: string) => {
    const patients = await getQueue();
    return patients.find((item) => item.id === id)?.intakeProgress ?? null;
  },
  getHandoffStatus: async (id: string) => {
    const patients = await getQueue();
    return patients.find((item) => item.id === id)?.handoffStatus ?? null;
  },
};
