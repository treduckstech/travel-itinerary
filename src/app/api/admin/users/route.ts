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

  const search = request.nextUrl.searchParams.get("search")?.toLowerCase() ?? "";
  const serviceClient = createServiceClient();

  const { data: usersData } = await serviceClient.auth.admin.listUsers();
  const allUsers = usersData?.users ?? [];

  const filtered = search
    ? allUsers.filter((u) => u.email?.toLowerCase().includes(search))
    : allUsers;

  // Get trip and event counts per user
  const { data: trips } = await serviceClient
    .from("trips")
    .select("user_id");
  const { data: events } = await serviceClient
    .from("events")
    .select("trip_id, trips!inner(user_id)");

  const tripCounts = new Map<string, number>();
  const eventCounts = new Map<string, number>();

  for (const t of trips ?? []) {
    tripCounts.set(t.user_id, (tripCounts.get(t.user_id) ?? 0) + 1);
  }

  for (const e of events ?? []) {
    const row = e as unknown as { trip_id: string; trips: { user_id: string } };
    const uid = row.trips?.user_id;
    if (uid) eventCounts.set(uid, (eventCounts.get(uid) ?? 0) + 1);
  }

  const result = filtered.map((u) => ({
    id: u.id,
    email: u.email ?? "",
    created_at: u.created_at,
    trip_count: tripCounts.get(u.id) ?? 0,
    event_count: eventCounts.get(u.id) ?? 0,
  }));

  result.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json(result);
}
