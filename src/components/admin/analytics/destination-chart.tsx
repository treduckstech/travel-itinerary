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

interface DestinationData {
  destination: string;
  count: number;
}

interface DestinationChartProps {
  data: DestinationData[];
  loading: boolean;
}

export function DestinationChart({ data, loading }: DestinationChartProps) {
  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-muted mb-4" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-6">
      <h3 className="text-sm font-medium mb-4">Top Destinations</h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No data available
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="destination"
              tick={{ fontSize: 12 }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
