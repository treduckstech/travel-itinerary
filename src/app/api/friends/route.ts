import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { escapeHtml } from "@/lib/email";

function obscureEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.charAt(0);
  return `${visible}***@${domain}`;
}

function getUserName(user: { user_metadata?: Record<string, unknown> }): string {
  return (
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    "Unknown"
  );
}

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
    return NextResponse.json({ error: "Failed to load friendships" }, { status: 500 });
  }

  // Resolve names and emails for specific friend IDs
  const friendIds = new Set<string>();
  (friendships ?? []).forEach((f) => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
    friendIds.add(friendId);
  });

  const userMap = new Map<string, { email: string; name: string }>();
  await Promise.all(
    [...friendIds].map(async (id) => {
      const { data } = await serviceClient.auth.admin.getUserById(id);
      if (data?.user) {
        userMap.set(id, {
          email: data.user.email ? obscureEmail(data.user.email) : "Unknown",
          name: getUserName(data.user),
        });
      }
    })
  );

  const enriched = (friendships ?? []).map((f) => {
    const friendId = f.requester_id === user.id ? f.addressee_id : f.requester_id;
    const info = userMap.get(friendId);
    return {
      ...f,
      name: info?.name ?? "Unknown",
      email: info?.email ?? "Unknown",
    };
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

  let user_id: string | undefined;
  try {
    const body = await request.json();
    user_id = body.user_id;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!user_id || typeof user_id !== "string") {
    return NextResponse.json({ error: "user_id is required" }, { status: 400 });
  }

  if (user_id === user.id) {
    return NextResponse.json({ error: "Cannot send a friend request to yourself" }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // Look up user by ID to verify they exist
  const { data: userData } = await serviceClient.auth.admin.getUserById(user_id);
  const matchedUser = userData?.user;

  if (!matchedUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const senderName = getUserName(user);
  const matchedEmail = matchedUser.email;

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
        return NextResponse.json({ error: "Failed to update friendship" }, { status: 500 });
      }

      // Notify the original requester that their request was accepted
      await serviceClient.from("notifications").insert({
        recipient_id: matchedUser.id,
        actor_id: user.id,
        type: "friend_request_accepted",
        title: "Friend request accepted",
        body: `${senderName} accepted your friend request`,
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
        return NextResponse.json({ error: "Failed to update friendship" }, { status: 500 });
      }

      return NextResponse.json({ ...friendship, status: "pending" }, { status: 200 });
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
    return NextResponse.json({ error: "Failed to create friend request" }, { status: 500 });
  }

  // Create notification for the addressee
  await serviceClient.from("notifications").insert({
    recipient_id: matchedUser.id,
    actor_id: user.id,
    type: "friend_request",
    title: "New friend request",
    body: `${senderName} sent you a friend request`,
    data: { friendship_id: friendship.id },
  });

  // Send email notification
  if (matchedEmail) {
    try {
      const { sendEmail } = await import("@/lib/email");
      await sendEmail({
        to: matchedEmail,
        subject: "New friend request on Travel Itinerary",
        html: `<p><strong>${escapeHtml(senderName)}</strong> sent you a friend request on Travel Itinerary.</p><p>Log in to accept or decline.</p>`,
      });
    } catch (err) {
      console.error("Failed to send friend request email:", err);
    }
  }

  return NextResponse.json(friendship, { status: 201 });
}
