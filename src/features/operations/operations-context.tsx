import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { operationsApi } from "./api";
import type {
  AuditEntry,
  DlqEvent,
  OperationsOverview,
  OutboxEvent,
  ReplayRecord,
  ReviewItem,
  SearchHealth,
} from "./types";

type OperationsContextValue = {
  overview: OperationsOverview | null;
  dlq: DlqEvent[];
  reviews: ReviewItem[];
  outbox: OutboxEvent[];
  searchHealth: SearchHealth | null;
  replays: ReplayRecord[];
  audit: AuditEntry[];
  loading: boolean;
  error: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  retryLoad: () => void;
  retryEvent: (id: string) => Promise<void>;
  moveToReview: (id: string) => void;
  markReviewed: (id: string) => void;
  returnToQueue: (id: string) => void;
  replayEvent: (id: string) => Promise<void>;
};
const OperationsContext = createContext<OperationsContextValue | null>(null);
export function OperationsProvider({ children }: { children: ReactNode }) {
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [dlq, setDlq] = useState<DlqEvent[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [outbox, setOutbox] = useState<OutboxEvent[]>([]);
  const [searchHealth, setSearchHealth] = useState<SearchHealth | null>(null);
  const [replays, setReplays] = useState<ReplayRecord[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      operationsApi.getOverview(),
      operationsApi.getDlq(),
      operationsApi.getManualReview(),
      operationsApi.getOutbox(),
      operationsApi.getSearchHealth(),
      operationsApi.getReplay(),
      operationsApi.getAuditLog(),
    ])
      .then(([o, d, r, out, s, rep, a]) => {
        if (!active) return;
        setOverview(o);
        setDlq(d);
        setReviews(r);
        setOutbox(out);
        setSearchHealth(s);
        setReplays(rep);
        setAudit(a);
        setLoading(false);
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reload]);
  const addAudit = useCallback(
    (action: string) =>
      setAudit((items) => [
        { id: `AUD-${Date.now()}`, time: "Now", actor: "Operations Demo", action },
        ...items,
      ]),
    [],
  );
  const retryEvent = useCallback(
    async (id: string) => {
      await operationsApi.retryEvent(id);
      setDlq((items) =>
        items.map((item) => (item.id === id ? { ...item, status: "processing" } : item)),
      );
      addAudit(`queued retry for ${id}`);
    },
    [addAudit],
  );
  const moveToReview = useCallback(
    (id: string) => {
      const item = dlq.find((event) => event.id === id);
      if (!item) return;
      setDlq((items) =>
        items.map((event) => (event.id === id ? { ...event, status: "review" } : event)),
      );
      setReviews((items) =>
        items.some((review) => review.id === id)
          ? items
          : [
              {
                id,
                category: "Other",
                reason: "Failed event moved for operational review",
                source: item.service,
                status: "needs-review",
                createdAt: "Now",
                correlationId: item.correlationId,
              },
              ...items,
            ],
      );
      addAudit(`moved ${id} to manual review`);
    },
    [dlq, addAudit],
  );
  const markReviewed = useCallback(
    (id: string) => {
      setReviews((items) =>
        items.map((item) => (item.id === id ? { ...item, status: "reviewed" } : item)),
      );
      addAudit(`marked ${id} reviewed`);
    },
    [addAudit],
  );
  const returnToQueue = useCallback(
    (id: string) => {
      setReviews((items) =>
        items.map((item) => (item.id === id ? { ...item, status: "needs-review" } : item)),
      );
      addAudit(`returned ${id} to review queue`);
    },
    [addAudit],
  );
  const replayEvent = useCallback(
    async (id: string) => {
      await operationsApi.replayEvent(id);
      setReplays((items) =>
        items.map((item) => (item.id === id ? { ...item, status: "queued" } : item)),
      );
      addAudit(`queued replay ${id}`);
    },
    [addAudit],
  );
  const value = useMemo(
    () => ({
      overview,
      dlq,
      reviews,
      outbox,
      searchHealth,
      replays,
      audit,
      loading,
      error,
      mobileOpen,
      setMobileOpen,
      retryLoad: () => setReload((v) => v + 1),
      retryEvent,
      moveToReview,
      markReviewed,
      returnToQueue,
      replayEvent,
    }),
    [
      overview,
      dlq,
      reviews,
      outbox,
      searchHealth,
      replays,
      audit,
      loading,
      error,
      mobileOpen,
      retryEvent,
      moveToReview,
      markReviewed,
      returnToQueue,
      replayEvent,
    ],
  );
  return <OperationsContext.Provider value={value}>{children}</OperationsContext.Provider>;
}
export function useOperations() {
  const value = useContext(OperationsContext);
  if (!value) throw new Error("useOperations must be used inside OperationsProvider");
  return value;
}
