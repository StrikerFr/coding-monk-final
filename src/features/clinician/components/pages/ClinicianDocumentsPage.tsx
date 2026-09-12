import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileCheck2, FileText, RefreshCw, ScanLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listRecentDocuments } from "@/lib/clinical/documents.functions";
import type { DocumentRow } from "@/lib/clinical/documents.types";
import { CaseDocumentDialog } from "@/features/clinician/components/CaseDocumentDialog";
import {
  StaffEmpty,
  StaffError,
  StaffLoading,
  StaffPageHeader,
  formatDateTime,
} from "@/features/assisted-kiosk/components/StaffUi";

const TYPE_LABELS: Record<string, string> = {
  prescription: "Prescription",
  lab_report: "Lab report",
  medical_report: "Medical report",
  discharge_summary: "Discharge summary",
  previous_consultation: "Previous consultation",
  other: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  UPLOADING: "Uploading",
  UPLOADED: "Uploaded",
  OCR_PROCESSING: "Reading text",
  OCR_COMPLETED: "Text read",
  EXTRACTION_PROCESSING: "Understanding",
  READY_FOR_REVIEW: "Ready for review",
  REVIEWED: "Reviewed",
  FAILED: "Could not read",
};

export function ClinicianDocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState<string | null>(null);
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState("pending");
  const [openDocument, setOpenDocument] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listRecentDocuments()
      .then((rows) => {
        if (!active) return;
        setDocs(rows);
        setFailed(null);
      })
      .catch((error: unknown) => active && setFailed(String((error as Error)?.message ?? error)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return docs.filter((doc) => {
      if (type !== "all" && doc.documentType !== type) return false;
      if (status === "pending" && doc.status !== "READY_FOR_REVIEW") return false;
      if (status === "reviewed" && doc.status !== "REVIEWED") return false;
      if (status === "failed" && doc.status !== "FAILED" && doc.errorCode !== "AI_EXTRACTION_FAILED") return false;
      if (!text) return true;
      return doc.fileName.toLowerCase().includes(text) || doc.patientId.toLowerCase().includes(text);
    });
  }, [docs, type, query, status]);

  const review = docs.filter((doc) => doc.status === "READY_FOR_REVIEW").length;
  const failedCount = docs.filter((doc) => doc.status === "FAILED").length;

  return (
    <div className="space-y-6">
      <StaffPageHeader
        eyebrow="Clinical workspace"
        title="Documents"
        description="Prescriptions and reports patients brought to the kiosk, across all cases."
        icon={FileText}
        stats={[
          { label: "Documents", value: docs.length },
          { label: "Ready to review", value: review },
          { label: "Unreadable", value: failedCount },
        ]}
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {[{ key: "pending", label: "Needs review" }, { key: "reviewed", label: "Reviewed" }, { key: "failed", label: "Failed" }, { key: "all", label: "All" }].map((item) => (
              <Button key={item.key} size="sm" variant={status === item.key ? "default" : "outline"} onClick={() => setStatus(item.key)}>{item.label}</Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
          {["all", "prescription", "lab_report", "medical_report", "other"].map((key) => (
            <Button
              key={key}
              size="sm"
              variant={type === key ? "default" : "outline"}
              onClick={() => setType(key)}
            >
              {key === "all" ? "All" : TYPE_LABELS[key]}
            </Button>
          ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search file or patient"
            className="w-56"
            aria-label="Search documents"
          />
          <Button asChild variant="outline" size="sm">
            <Link to="/document-check">
              <ScanLine className="size-4" />
              Read a document
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {failed ? <StaffError message={failed} /> : null}
      {loading ? <StaffLoading /> : null}
      {!loading && !failed && visible.length === 0 ? (
        <StaffEmpty
          title="No documents"
          body="Documents patients upload during check-in appear here."
        />
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2">
        {visible.map((doc) => (
          <Card key={doc.id} className="border-border">
            <CardContent className="flex items-start gap-4 p-5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-surface-sunken text-muted-foreground">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.fileName}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline">{TYPE_LABELS[doc.documentType] ?? doc.documentType}</Badge>
                  <Badge variant={doc.status === "FAILED" ? "destructive" : "secondary"}>
                    {STATUS_LABELS[doc.status] ?? doc.status}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {Math.max(1, Math.round(doc.fileSize / 1024))} KB · Added {formatDateTime(doc.createdAt)}
                </p>
              </div>
              {doc.encounterId ? (
                <Button size="sm" variant={doc.status === "READY_FOR_REVIEW" ? "default" : "outline"} onClick={() => setOpenDocument(doc.id)}>
                  <FileCheck2 className="size-4" /> {doc.status === "REVIEWED" ? "View review" : "Verify"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
      <CaseDocumentDialog documentId={openDocument} onClose={() => setOpenDocument(null)} onReviewed={() => setReloadKey((key) => key + 1)} />
    </div>
  );
}
