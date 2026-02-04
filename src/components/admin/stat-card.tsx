import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string | null;
  growth?: number | null;
  loading?: boolean;
}

export function StatCard({ label, value, growth, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl">{value ?? "—"}</p>
      {growth != null && (
        <div
          className={`mt-2 flex items-center gap-1 text-xs ${
            growth >= 0 ? "text-green-600" : "text-red-500"
          }`}
        >
          {growth >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {growth >= 0 ? "+" : ""}
          {growth}%
        </div>
      )}
    </div>
  );
}
