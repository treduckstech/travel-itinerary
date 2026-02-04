"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const actionTypes = [
  { value: "all", label: "All actions" },
  { value: "signup", label: "Signup" },
  { value: "login", label: "Login" },
  { value: "trip_created", label: "Trip created" },
  { value: "trip_deleted", label: "Trip deleted" },
  { value: "event_added", label: "Event added" },
  { value: "event_deleted", label: "Event deleted" },
  { value: "share_created", label: "Share created" },
  { value: "share_revoked", label: "Share revoked" },
  { value: "public_link_generated", label: "Public link generated" },
  { value: "public_link_revoked", label: "Public link revoked" },
];

interface ActivityLogFiltersProps {
  actionType: string;
  email: string;
  startDate: string;
  endDate: string;
  onActionTypeChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function ActivityLogFilters({
  actionType,
  email,
  startDate,
  endDate,
  onActionTypeChange,
  onEmailChange,
  onStartDateChange,
  onEndDateChange,
}: ActivityLogFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Select value={actionType} onValueChange={onActionTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {actionTypes.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Filter by email..."
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="w-[200px] pl-9"
        />
      </div>

      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        className="w-[150px]"
        placeholder="Start date"
      />

      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        className="w-[150px]"
        placeholder="End date"
      />
    </div>
  );
}
