import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // Get friendships where user is either requester or addressee
  const { data: friendships, error } = await serviceClient
    .from("friendships")
    .select("*")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .in("status", ["pending", "accepted"])
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Resolve emails for friend IDs
  const { data: userData } = await serviceClient.auth.admin.listUsers();
  const userMap = new Map<string, string>();
  userData?.users?.forEach((u) => {
    if (u.email) userMap.set(u.id, u.email);
  });

  const enriched = (friendships ?? []).map((f) => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
    return { ...f, email: userMap.get(friendId) ?? "Unknown" };
  });

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`friends:${user.id}`, { limit: 20, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (normalizedEmail === user.email?.toLowerCase()) {
    return NextResponse.json({ error: "Cannot send a friend request to yourself" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Look up user by email
  const { data: userData } = await serviceClient.auth.admin.listUsers();
  const matchedUser = userData?.users?.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );

  if (!matchedUser) {
    return NextResponse.json({ error: "No user found with that email" }, { status: 404 });
  }

  // Check if there's already a friendship in either direction
  const { data: existing } = await serviceClient
    .from("friendships")
    .select("*")
    .or(
      `and(requester_id.eq.${user.id},addressee_id.eq.${matchedUser.id}),and(requester_id.eq.${matchedUser.id},addressee_id.eq.${user.id})`
    )
    .limit(1);

  if (existing && existing.length > 0) {
    const friendship = existing[0];
    // If there's a pending request FROM them TO us, auto-accept
    if (
      friendship.requester_id === matchedUser.id &&
      friendship.addressee_id === user.id &&
      friendship.status === "pending"
    ) {
      const { error: updateError } = await serviceClient
        .from("friendships")
        .update({ status: "accepted", updated_at: new Date().toISOString() })
        .eq("id", friendship.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      // Notify the original requester that their request was accepted
      await serviceClient.from("notifications").insert({
        recipient_id: matchedUser.id,
        actor_id: user.id,
        type: "friend_request_accepted",
        title: "Friend request accepted",
        body: `${user.email} accepted your friend request`,
        data: { friendship_id: friendship.id },
      });

      return NextResponse.json({ ...friendship, status: "accepted" }, { status: 200 });
    }

    if (friendship.status === "accepted") {
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }
    if (friendship.status === "pending") {
      return NextResponse.json({ error: "Friend request already sent" }, { status: 409 });
    }
    if (friendship.status === "declined") {
      // Re-send: update existing to pending
      const { error: updateError } = await serviceClient
        .from("friendships")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", friendship.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }
  }

  // Create new friendship request
  const { data: friendship, error: insertError } = await serviceClient
    .from("friendships")
    .insert({
      requester_id: user.id,
      addressee_id: matchedUser.id,
      status: "pending",
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ error: "Friend request already sent" }, { status: 409 });
    }
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Create notification for the addressee
  await serviceClient.from("notifications").insert({
    recipient_id: matchedUser.id,
    actor_id: user.id,
    type: "friend_request",
    title: "New friend request",
    body: `${user.email} sent you a friend request`,
    data: { friendship_id: friendship.id },
  });

  // Send email (will be added in Phase 5)
  try {
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: normalizedEmail,
      subject: "New friend request on Travel Itinerary",
      html: `<p><strong>${user.email}</strong> sent you a friend request on Travel Itinerary.</p><p>Log in to accept or decline.</p>`,
    });
  } catch {
    // Fire-and-forget
  }

  return NextResponse.json(friendship, { status: 201 });
}
