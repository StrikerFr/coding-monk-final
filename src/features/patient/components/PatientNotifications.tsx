import { Bell } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePatient } from "@/features/patient/patient-context";

export function PatientNotifications() {
  const { notifications, unreadCount, markAllRead, t } = usePatient();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative min-h-11 min-w-11"
          aria-label={`${t("header.notifications")}${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-semibold">{t("header.notifications")}</h2>
          <Button variant="link" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {notifications.slice(0, 3).map((note) => (
            <li key={note.id} className="px-4 py-3">
              <p className="flex gap-2 text-sm font-semibold">
                {note.unread && (
                  <span
                    aria-label="Unread"
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                  />
                )}
                <span>{note.title}</span>
              </p>
              <p className="mt-1 pl-4 text-xs text-muted-foreground">
                {note.detail} · {note.time}
              </p>
            </li>
          ))}
        </ul>
        <Button asChild variant="ghost" className="h-11 w-full rounded-none border-t border-border">
          <Link to="/patient/notifications">{t("notifications.view")}</Link>
        </Button>
      </PopoverContent>
    </Popover>
  );
}
