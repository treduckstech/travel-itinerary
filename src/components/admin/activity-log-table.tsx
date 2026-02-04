"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const actionColors: Record<string, string> = {
  signup: "bg-green-100 text-green-800",
  login: "bg-blue-100 text-blue-800",
  trip_created: "bg-purple-100 text-purple-800",
  trip_deleted: "bg-red-100 text-red-800",
  event_added: "bg-amber-100 text-amber-800",
  event_deleted: "bg-red-100 text-red-800",
  share_created: "bg-cyan-100 text-cyan-800",
  share_revoked: "bg-orange-100 text-orange-800",
  public_link_generated: "bg-indigo-100 text-indigo-800",
  public_link_revoked: "bg-rose-100 text-rose-800",
};

interface ActivityLog {
  id: string;
  user_email: string | null;
  action_type: string;
  action_details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

interface ActivityLogTableProps {
  logs: ActivityLog[];
  loading: boolean;
}

function ActionBadge({ type }: { type: string }) {
  const color = actionColors[type] ?? "bg-gray-100 text-gray-800";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${color}`}
    >
      {type.replace(/_/g, " ")}
    </span>
  );
}

function DetailsCell({ details }: { details: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const entries = Object.entries(details);

  if (entries.length === 0) return <span className="text-muted-foreground">—</span>;

  const summary = entries
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(", ");

  if (entries.length <= 2) {
    return <span className="text-xs">{summary}</span>;
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {expanded ? "Hide" : summary + "..."}
      </button>
      {expanded && (
        <pre className="mt-1 text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function ActivityLogTable({ logs, loading }: ActivityLogTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Details</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="border-b">
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Action</th>
            <th className="px-4 py-3 font-medium">Details</th>
            <th className="px-4 py-3 font-medium">IP</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                No activity logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b last:border-0">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{log.user_email ?? "—"}</td>
                <td className="px-4 py-3">
                  <ActionBadge type={log.action_type} />
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  <DetailsCell details={log.action_details ?? {}} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {log.ip_address ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
