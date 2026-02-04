"use client";

import { useEffect, useState, useCallback } from "react";
import { ActivityLogFilters } from "@/components/admin/activity-log-filters";
import { ActivityLogTable } from "@/components/admin/activity-log-table";
import { Pagination } from "@/components/admin/pagination";

const PER_PAGE = 20;

export default function AdminActivityLogPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState("all");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (actionType !== "all") params.set("action_type", actionType);
    if (email) params.set("email", email);
    if (startDate) params.set("start_date", startDate);
    if (endDate) params.set("end_date", endDate);

    const res = await fetch(`/api/admin/activity-log?${params}`);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, [page, actionType, email, startDate, endDate]);

  useEffect(() => {
    const timeout = setTimeout(fetchLogs, email ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchLogs, email]);

  useEffect(() => {
    setPage(1);
  }, [actionType, email, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Activity Log</h1>

      <div className="mb-4">
        <ActivityLogFilters
          actionType={actionType}
          email={email}
          startDate={startDate}
          endDate={endDate}
          onActionTypeChange={setActionType}
          onEmailChange={setEmail}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </div>

      <ActivityLogTable logs={logs} loading={loading} />

      <div className="mt-4">
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
}
