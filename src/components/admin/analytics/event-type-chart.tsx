"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EventTypeData {
  type: string;
  count: number;
}

interface EventTypeChartProps {
  data: EventTypeData[];
  loading: boolean;
}

const typeLabels: Record<string, string> = {
  travel: "Travel",
  hotel: "Hotel",
  restaurant: "Restaurant",
  activity: "Activity",
  shopping: "Shopping",
};

export function EventTypeChart({ data, loading }: EventTypeChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-44 animate-pulse rounded bg-muted mb-4" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const labeled = data.map((d) => ({
    ...d,
    type: typeLabels[d.type] ?? d.type,
  }));

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-sm font-medium mb-4">Event Type Distribution</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={labeled}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="type" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
