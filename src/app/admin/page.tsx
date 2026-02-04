"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/admin/stat-card";

interface Stats {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
  totalTrips: number;
  totalEvents: number;
  totalShares: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Users" value={stats?.totalUsers ?? null} loading={loading} />
        <StatCard label="New Users (7d)" value={stats?.newUsers7d ?? null} loading={loading} />
        <StatCard label="New Users (30d)" value={stats?.newUsers30d ?? null} loading={loading} />
        <StatCard label="Total Trips" value={stats?.totalTrips ?? null} loading={loading} />
        <StatCard label="Total Events" value={stats?.totalEvents ?? null} loading={loading} />
        <StatCard label="Total Shares" value={stats?.totalShares ?? null} loading={loading} />
      </div>
    </div>
  );
}
