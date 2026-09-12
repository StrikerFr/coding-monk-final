import type { ClinicianNotification } from "../types";

/** SYNTHETIC DEMO DATA ONLY — no notification delivery exists in the frontend. */
export const mockNotifications: ClinicianNotification[] = [
  {
    id: "NOTE-001",
    title: "New case ready for review",
    detail: "Meera Sharma — MK-DEMO-001",
    receivedAt: "2 min ago",
    unread: true,
  },
  {
    id: "NOTE-002",
    title: "1 case requires attention",
    detail: "Anjali Singh — MK-DEMO-003",
    receivedAt: "9 min ago",
    unread: true,
  },
  {
    id: "NOTE-003",
    title: "Document review completed",
    detail: "Blood Test — MK-DEMO-001",
    receivedAt: "24 min ago",
    unread: false,
  },
];
