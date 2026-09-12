import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
export function OperationsFilters({
  search,
  onSearch,
  status,
  onStatus,
  service,
  onService,
  type,
  onType,
  services = [],
  types = [],
}: {
  search: string;
  onSearch: (v: string) => void;
  status: string;
  onStatus: (v: string) => void;
  service?: string;
  onService?: (v: string) => void;
  type?: string;
  onType?: (v: string) => void;
  services?: string[];
  types?: string[];
}) {
  return (
    <div className="grid gap-2 border-y border-border py-3 sm:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_160px_190px_190px]">
      <label className="relative">
        <span className="sr-only">Search events</span>
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search events"
          className="h-10 w-full rounded-md border border-input bg-surface pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>
      <FilterSelect
        label="Status"
        value={status}
        onValue={onStatus}
        values={["all", "failed", "processing", "review", "pending", "published"]}
      />
      {onService && service !== undefined ? (
        <FilterSelect
          label="Service"
          value={service}
          onValue={onService}
          values={["all", ...services]}
        />
      ) : (
        <div className="hidden xl:block" />
      )}
      {onType && type !== undefined ? (
        <FilterSelect label="Type" value={type} onValue={onType} values={["all", ...types]} />
      ) : (
        <FilterSelect label="Time" value="today" onValue={() => {}} values={["today", "hour"]} />
      )}
    </div>
  );
}
function FilterSelect({
  label,
  value,
  onValue,
  values,
}: {
  label: string;
  value: string;
  onValue: (v: string) => void;
  values: string[];
}) {
  return (
    <Select value={value} onValueChange={onValue}>
      <SelectTrigger className="h-10 bg-surface" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {values.map((value) => (
          <SelectItem key={value} value={value}>
            {value === "all"
              ? `All ${label.toLowerCase()}`
              : value === "today"
                ? "Today"
                : value === "hour"
                  ? "Last hour"
                  : value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
