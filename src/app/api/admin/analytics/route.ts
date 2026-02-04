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

  const { data: usersData } = await serviceClient.auth.admin.listUsers();
  const allUsers = usersData?.users ?? [];

  const now = new Date();
  const cutoff = days ? new Date(now.getTime() - parseInt(days) * 86400000) : null;
  const prevCutoff = days
    ? new Date(now.getTime() - parseInt(days) * 2 * 86400000)
    : null;

  // Current period counts
  const usersInPeriod = cutoff
    ? allUsers.filter((u) => new Date(u.created_at) >= cutoff).length
    : allUsers.length;
  const usersPrevPeriod =
    cutoff && prevCutoff
      ? allUsers.filter(
          (u) =>
            new Date(u.created_at) >= prevCutoff &&
            new Date(u.created_at) < cutoff
        ).length
      : null;

  let tripsQuery = serviceClient.from("trips").select("id", { count: "exact", head: true });
  let eventsQuery = serviceClient.from("events").select("id", { count: "exact", head: true });
  let sharesQuery = serviceClient.from("trip_shares").select("id", { count: "exact", head: true });

  if (cutoff) {
    tripsQuery = tripsQuery.gte("created_at", cutoff.toISOString());
    eventsQuery = eventsQuery.gte("created_at", cutoff.toISOString());
    sharesQuery = sharesQuery.gte("created_at", cutoff.toISOString());
  }

  const [tripsRes, eventsRes, sharesRes] = await Promise.all([
    tripsQuery,
    eventsQuery,
    sharesQuery,
  ]);

  // Previous period counts for growth
  let tripsGrowth: number | null = null;
  let eventsGrowth: number | null = null;
  let sharesGrowth: number | null = null;
  let usersGrowth: number | null = null;

  if (cutoff && prevCutoff) {
    const [prevTrips, prevEvents, prevShares] = await Promise.all([
      serviceClient
        .from("trips")
        .select("id", { count: "exact", head: true })
        .gte("created_at", prevCutoff.toISOString())
        .lt("created_at", cutoff.toISOString()),
      serviceClient
        .from("events")
        .select("id", { count: "exact", head: true })
        .gte("created_at", prevCutoff.toISOString())
        .lt("created_at", cutoff.toISOString()),
      serviceClient
        .from("trip_shares")
        .select("id", { count: "exact", head: true })
        .gte("created_at", prevCutoff.toISOString())
        .lt("created_at", cutoff.toISOString()),
    ]);

    function calcGrowth(current: number, prev: number): number {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prev) / prev) * 100);
    }

    tripsGrowth = calcGrowth(tripsRes.count ?? 0, prevTrips.count ?? 0);
    eventsGrowth = calcGrowth(eventsRes.count ?? 0, prevEvents.count ?? 0);
    sharesGrowth = calcGrowth(sharesRes.count ?? 0, prevShares.count ?? 0);
    usersGrowth = calcGrowth(usersInPeriod, usersPrevPeriod ?? 0);
  }

  return NextResponse.json({
    users: cutoff ? usersInPeriod : allUsers.length,
    trips: tripsRes.count ?? 0,
    events: eventsRes.count ?? 0,
    shares: sharesRes.count ?? 0,
    usersGrowth,
    tripsGrowth,
    eventsGrowth,
    sharesGrowth,
  });
}
