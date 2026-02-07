import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let status: string | undefined;
  try {
    const body = await request.json();
    status = body.status;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!status || !["accepted", "declined"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Verify this friendship exists and user is the addressee
  const { data: friendship } = await serviceClient
    .from("friendships")
    .select("*")
    .eq("id", id)
    .single();

  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (friendship.addressee_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (friendship.status !== "pending") {
    return NextResponse.json({ error: "Request already handled" }, { status: 400 });
  }

  const { error } = await serviceClient
    .from("friendships")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }

  // Notify the requester if accepted
  if (status === "accepted") {
    const userName =
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      user.email ??
      "Someone";

    await serviceClient.from("notifications").insert({
      recipient_id: friendship.requester_id,
      actor_id: user.id,
      type: "friend_request_accepted",
      title: "Friend request accepted",
      body: `${userName} accepted your friend request`,
      data: { friendship_id: id },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Verify this friendship exists and user is a party
  const { data: friendship } = await serviceClient
    .from("friendships")
    .select("*")
    .eq("id", id)
    .single();

  if (!friendship) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (friendship.requester_id !== user.id && friendship.addressee_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await serviceClient
    .from("friendships")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
