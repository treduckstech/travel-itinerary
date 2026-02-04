import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

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

  // First fetch trips to get IDs for subsequent queries
  const tripsRes = await serviceClient
    .from("trips")
    .select("id, name, destination, start_date")
    .eq("user_id", id)
    .order("start_date", { ascending: false });

  const tripIds = tripsRes.data?.map((t) => t.id) ?? [];

  const todosRes = await serviceClient
    .from("todos")
    .select("id", { count: "exact", head: true })
    .in("trip_id", tripIds.length > 0 ? tripIds : ["__none__"]);

  // Count events across user's trips
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
    .in("trip_id", tripIds.length > 0 ? tripIds : ["__none__"]);

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
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
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
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }
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
