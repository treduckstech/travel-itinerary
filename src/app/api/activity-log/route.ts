import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 log entries per minute per user
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`activity-log:${user.id}`, { limit: 30, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const ALLOWED_ACTIONS = [
    "signup", "login", "trip_created", "trip_deleted",
    "event_added", "event_deleted", "share_created", "share_revoked",
    "public_link_generated", "public_link_revoked",
  ];

  const { action_type, action_details } = await request.json();

  if (!action_type || !ALLOWED_ACTIONS.includes(action_type)) {
    return NextResponse.json({ error: "Invalid action_type" }, { status: 400 });
  }

  // Limit action_details size to prevent abuse
  const detailsStr = JSON.stringify(action_details ?? {});
  if (detailsStr.length > 2048) {
    return NextResponse.json({ error: "action_details too large" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const userAgent = request.headers.get("user-agent") ?? null;

  const serviceClient = createServiceClient();
  const { error } = await serviceClient.from("activity_logs").insert({
    user_id: user.id,
    user_email: user.email,
    action_type,
    action_details: action_details ?? {},
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
