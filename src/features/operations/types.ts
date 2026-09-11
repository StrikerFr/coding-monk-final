export type OpsStatus =
  "operational" | "degraded" | "attention" | "failed" | "paused" | "processing";
export type Priority = "critical" | "high" | "medium" | "low";
export interface ServiceHealth {
  id: string;
  name: string;
  status: OpsStatus;
  latency: string;
  queue: number | null;
}
export interface AttentionItem {
  id: string;
  title: string;
  subject: string;
  kind: "dlq" | "outbox" | "review";
  time: string;
  priority: Priority;
}
export interface ProcessingJob {
  id: string;
  label: string;
  progress: number;
  status: OpsStatus;
}
export interface PipelineStage {
  id: string;
  label: string;
  count: number;
  status: OpsStatus;
}
export interface DlqEvent {
  id: string;
  type: string;
  service: string;
  failedAt: string;
  retries: number;
  status: "failed" | "processing" | "review";
  priority: Priority;
  correlationId: string;
  jobId: string;
  payload: Record<string, string>;
}
export type ReviewCategory = "Document" | "OCR" | "Extraction" | "Summary" | "Other";
export interface ReviewItem {
  id: string;
  category: ReviewCategory;
  reason: string;
  source: string;
  status: "needs-review" | "reviewing" | "reviewed";
  createdAt: string;
  correlationId: string;
}
export interface OutboxEvent {
  id: string;
  event: string;
  source: string;
  createdAt: string;
  status: "pending" | "publishing" | "published" | "failed";
  age: string;
  correlationId: string;
}
export interface SearchHealth {
  status: OpsStatus;
  indexedPercent: number;
  pending: number;
  failed: number;
  lastProjection: string;
}
export interface ReplayRecord {
  id: string;
  event: string;
  createdAt: string;
  status: "completed" | "pending" | "queued";
  requestedBy: string;
  eventId: string;
  correlationId: string;
}
export interface AuditEntry {
  id: string;
  time: string;
  actor: string;
  action: string;
}
export interface OperationsOverview {
  checkedAt: string;
  services: ServiceHealth[];
  attention: AttentionItem[];
  processing: ProcessingJob[];
  pipeline: PipelineStage[];
}
