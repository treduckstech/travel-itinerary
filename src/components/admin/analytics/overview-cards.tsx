"use client";

import { StatCard } from "@/components/admin/stat-card";

interface OverviewData {
  users: number;
  trips: number;
  events: number;
  shares: number;
  usersGrowth: number | null;
  tripsGrowth: number | null;
  eventsGrowth: number | null;
  sharesGrowth: number | null;
}

interface OverviewCardsProps {
  data: OverviewData | null;
  loading: boolean;
}

export function OverviewCards({ data, loading }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Users"
        value={data?.users ?? null}
        growth={data?.usersGrowth}
        loading={loading}
      />
      <StatCard
        label="Trips"
        value={data?.trips ?? null}
        growth={data?.tripsGrowth}
        loading={loading}
      />
      <StatCard
        label="Events"
        value={data?.events ?? null}
        growth={data?.eventsGrowth}
        loading={loading}
      />
      <StatCard
        label="Shares"
        value={data?.shares ?? null}
        growth={data?.sharesGrowth}
        loading={loading}
      />
    </div>
  );
}
