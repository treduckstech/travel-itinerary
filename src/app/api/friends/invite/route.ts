import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`friends-invite:${user.id}`, { limit: 10, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  const senderName =
    (user.user_metadata?.full_name as string) ??
    (user.user_metadata?.name as string) ??
    user.email ??
    "Someone";

  const origin = request.nextUrl.origin;

  try {
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: normalizedEmail,
      subject: `${senderName} invited you to join Travel Itinerary`,
      html: `<p><strong>${senderName}</strong> invited you to join Travel Itinerary.</p><p>Sign up at <a href="${origin}">${origin}</a> to start planning trips together.</p>`,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send invite" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
