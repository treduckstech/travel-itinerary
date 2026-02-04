"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DateRangeSelector,
  OverviewCards,
  GrowthChart,
  DestinationChart,
  EventTypeChart,
} from "@/components/admin/analytics";
import type { DateRange } from "@/components/admin/analytics";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function rangeToDays(range: DateRange): number | null {
  switch (range) {
    case "week": return 7;
    case "month": return 30;
    case "quarter": return 90;
    case "year": return 365;
    case "all": return null;
  }
}

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<DateRange>("month");
  const [overview, setOverview] = useState(null);
  const [growth, setGrowth] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const days = rangeToDays(range);
    const qs = days != null ? `?days=${days}` : "";

    const [overviewRes, growthRes, destRes, eventsRes] = await Promise.all([
      fetch(`/api/admin/analytics${qs}`),
      fetch(`/api/admin/analytics/growth${qs}`),
      fetch(`/api/admin/analytics/destinations${qs}`),
      fetch(`/api/admin/analytics/events${qs}`),
    ]);

    const [overviewData, growthData, destData, eventsData] = await Promise.all([
      overviewRes.json(),
      growthRes.json(),
      destRes.json(),
      eventsRes.json(),
    ]);

    setOverview(overviewData);
    setGrowth(growthData);
    setDestinations(destData);
    setEventTypes(eventsData);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleExportCSV() {
    const rows = [
      ["Date", "Users", "Trips", "Events"],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...growth.map((d: any) => [d.date, d.users, d.trips, d.events]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="font-display text-3xl">Analytics</h1>
        <div className="flex items-center gap-3">
          <DateRangeSelector value={range} onChange={setRange} />
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <OverviewCards data={overview} loading={loading} />
        <GrowthChart data={growth} loading={loading} />
        <div className="grid gap-6 lg:grid-cols-2">
          <DestinationChart data={destinations} loading={loading} />
          <EventTypeChart data={eventTypes} loading={loading} />
        </div>
      </div>
    </div>
  );
}
