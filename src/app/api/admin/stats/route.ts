import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceClient();

  const [usersRes, tripsRes, eventsRes, sharesRes] = await Promise.all([
    serviceClient.auth.admin.listUsers(),
    serviceClient.from("trips").select("id", { count: "exact", head: true }),
    serviceClient.from("events").select("id", { count: "exact", head: true }),
    serviceClient.from("trip_shares").select("id", { count: "exact", head: true }),
  ]);

  const users = usersRes.data?.users ?? [];
  const now = new Date();
  const d7 = new Date(now.getTime() - 7 * 86400000);
  const d30 = new Date(now.getTime() - 30 * 86400000);

  const newUsers7d = users.filter(
    (u) => new Date(u.created_at) >= d7
  ).length;
  const newUsers30d = users.filter(
    (u) => new Date(u.created_at) >= d30
  ).length;

  return NextResponse.json({
    totalUsers: users.length,
    newUsers7d,
    newUsers30d,
    totalTrips: tripsRes.count ?? 0,
    totalEvents: eventsRes.count ?? 0,
    totalShares: sharesRes.count ?? 0,
  });
}
