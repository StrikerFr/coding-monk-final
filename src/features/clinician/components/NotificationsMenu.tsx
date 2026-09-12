import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useClinician } from "@/features/clinician/clinician-context";
import { EmptyState } from "./States";

export function NotificationsMenu() {
  const { notifications, unreadCount, markAllRead } = useClinician();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell aria-hidden="true" className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 origin-top-right p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            type="button"
            onClick={markAllRead}
            className="rounded text-xs font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        </div>
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You are up to date."
            icon="clear"
            className="py-8"
          />
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {notifications.map((note) => (
              <li key={note.id} className="px-4 py-3">
                <p className="flex items-start gap-2 text-sm font-medium">
                  {note.unread && (
                    <span
                      aria-hidden="true"
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                    />
                  )}
                  <span>{note.title}</span>
                </p>
                <p className="mt-0.5 pl-4 text-xs text-muted-foreground">{note.detail}</p>
                <p className="pl-4 text-xs text-muted-foreground">{note.receivedAt}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Demonstration notifications only.
        </p>
      </PopoverContent>
    </Popover>
  );
}
