import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = request.nextUrl.searchParams.get("days");
  const serviceClient = createServiceClient();

  const now = new Date();
  const cutoff = days
    ? new Date(now.getTime() - parseInt(days) * 86400000)
    : new Date("2020-01-01");

  const { data: usersData } = await serviceClient.auth.admin.listUsers();
  const allUsers = usersData?.users ?? [];

  const [tripsRes, eventsRes] = await Promise.all([
    serviceClient
      .from("trips")
      .select("created_at")
      .gte("created_at", cutoff.toISOString())
      .order("created_at"),
    serviceClient
      .from("events")
      .select("created_at")
      .gte("created_at", cutoff.toISOString())
      .order("created_at"),
  ]);

  // Build daily buckets
  const buckets = new Map<string, { users: number; trips: number; events: number }>();

  for (const u of allUsers) {
    if (new Date(u.created_at) < cutoff) continue;
    const date = u.created_at.slice(0, 10);
    const bucket = buckets.get(date) ?? { users: 0, trips: 0, events: 0 };
    bucket.users++;
    buckets.set(date, bucket);
  }

  for (const t of tripsRes.data ?? []) {
    const date = t.created_at.slice(0, 10);
    const bucket = buckets.get(date) ?? { users: 0, trips: 0, events: 0 };
    bucket.trips++;
    buckets.set(date, bucket);
  }

  for (const e of eventsRes.data ?? []) {
    const date = e.created_at.slice(0, 10);
    const bucket = buckets.get(date) ?? { users: 0, trips: 0, events: 0 };
    bucket.events++;
    buckets.set(date, bucket);
  }

  // Convert to cumulative array
  const sorted = [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b));
  let cumUsers = 0;
  let cumTrips = 0;
  let cumEvents = 0;

  const result = sorted.map(([date, counts]) => {
    cumUsers += counts.users;
    cumTrips += counts.trips;
    cumEvents += counts.events;
    return { date, users: cumUsers, trips: cumTrips, events: cumEvents };
  });

  return NextResponse.json(result);
}
