import type {
  AuditEntry,
  DlqEvent,
  OperationsOverview,
  OutboxEvent,
  ReplayRecord,
  ReviewItem,
  SearchHealth,
  ServiceHealth,
} from "./types";
import { getDocument, listCollection, patchDocument } from "@/lib/store.functions";

/** Data boundary for the operations console. Reads and writes stored records. */

const listOf = async <T>(collection: string): Promise<T[]> =>
  (await listCollection({ data: { collection } })) as unknown as T[];

const docOf = async <T>(collection: string, id = "default"): Promise<T | null> =>
  (await getDocument({ data: { collection, id } })) as unknown as T | null;

export const operationsApi = {
  async getOverview(): Promise<OperationsOverview> {
    const data = await docOf<OperationsOverview>("ops_overview");
    if (!data) throw new Error("Overview is unavailable");
    return data;
  },
  getServices: () => listOf<ServiceHealth>("ops_services"),
  getDlq: () => listOf<DlqEvent>("ops_dlq"),
  getManualReview: () => listOf<ReviewItem>("ops_review"),
  getOutbox: () => listOf<OutboxEvent>("ops_outbox"),
  async getSearchHealth(): Promise<SearchHealth> {
    const data = await docOf<SearchHealth>("ops_search_health");
    if (!data) throw new Error("Search health is unavailable");
    return data;
  },
  getReplay: () => listOf<ReplayRecord>("ops_replay"),
  getAuditLog: () => listOf<AuditEntry>("ops_audit"),
  inspectEvent: (id: string) => docOf<DlqEvent>("ops_dlq", id),
  async retryEvent(id: string) {
    await patchDocument({
      data: { collection: "ops_dlq", id, updates: { status: "processing" } },
    });
    return { id, status: "processing" as const };
  },
  async replayEvent(id: string) {
    await patchDocument({
      data: { collection: "ops_replay", id, updates: { status: "queued" } },
    });
    return { id, status: "queued" as const };
  },
};
