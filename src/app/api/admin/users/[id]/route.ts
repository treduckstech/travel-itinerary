import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceClient();

  const { data: userData } = await serviceClient.auth.admin.getUserById(id);
  if (!userData?.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const targetUser = userData.user;

  const [tripsRes, , todosRes] = await Promise.all([
    serviceClient
      .from("trips")
      .select("id, name, destination, start_date")
      .eq("user_id", id)
      .order("start_date", { ascending: false }),
    serviceClient
      .from("trip_shares")
      .select("id, trip_id, shared_with_email, trips(name)")
      .or(`shared_with_user_id.eq.${id},trip_id.in.(${`select id from trips where user_id='${id}'`})`)
      ,
    serviceClient
      .from("todos")
      .select("id", { count: "exact", head: true })
      .in(
        "trip_id",
        (
          await serviceClient.from("trips").select("id").eq("user_id", id)
        ).data?.map((t) => t.id) ?? []
      ),
  ]);

  // Count events across user's trips
  const tripIds = tripsRes.data?.map((t) => t.id) ?? [];
  let eventsCount = 0;
  if (tripIds.length > 0) {
    const { count } = await serviceClient
      .from("events")
      .select("id", { count: "exact", head: true })
      .in("trip_id", tripIds);
    eventsCount = count ?? 0;
  }

  // Get shares where user is the owner of the trip
  const { data: ownerShares } = await serviceClient
    .from("trip_shares")
    .select("id, trip_id, shared_with_email, trips(name)")
    .in("trip_id", tripIds);

  const provider =
    targetUser.app_metadata?.provider ??
    targetUser.app_metadata?.providers?.[0] ??
    "email";

  return NextResponse.json({
    id: targetUser.id,
    email: targetUser.email ?? "",
    created_at: targetUser.created_at,
    provider,
    trips: tripsRes.data ?? [],
    events_count: eventsCount,
    shares: (ownerShares ?? []).map((s) => ({
      id: s.id,
      trip_id: s.trip_id,
      shared_with_email: s.shared_with_email,
      trip_name: (s.trips as unknown as { name: string })?.name ?? null,
    })),
    todos_count: todosRes.count ?? 0,
  });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceClient();

  // Delete user's trips (cascades to events, todos, shares)
  await serviceClient.from("trips").delete().eq("user_id", id);

  // Delete shares where this user is the shared-with user
  await serviceClient.from("trip_shares").delete().eq("shared_with_user_id", id);

  // Delete the auth user
  const { error } = await serviceClient.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceClient();
  const body = await request.json();

  if (body.action === "delete_trip" && body.trip_id) {
    const { error } = await serviceClient
      .from("trips")
      .delete()
      .eq("id", body.trip_id)
      .eq("user_id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  if (body.action === "remove_share" && body.share_id) {
    const { error } = await serviceClient
      .from("trip_shares")
      .delete()
      .eq("id", body.share_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
