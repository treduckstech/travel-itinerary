import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { escapeHtml } from "@/lib/email";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/";
  // Prevent open redirect: only allow relative paths starting with /
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = await createClient();
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      // Log signup or login
      const serviceClient = createServiceClient();
      const isNewUser =
        data.user.created_at &&
        Date.now() - new Date(data.user.created_at).getTime() < 60000;

      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        null;

      await serviceClient.from("activity_logs").insert({
        user_id: data.user.id,
        user_email: data.user.email,
        action_type: isNewUser ? "signup" : "login",
        action_details: {
          provider: data.user.app_metadata?.provider ?? "unknown",
        },
        ip_address: ip,
        user_agent: request.headers.get("user-agent") ?? null,
      });

      // Send admin notification email on new signup
      if (isNewUser) {
        try {
          const { sendEmail } = await import("@/lib/email");
          await sendEmail({
            to: "ben@treducks.tech",
            subject: `New signup: ${data.user.email}`,
            html: `<p>A new user signed up for Travel Itinerary:</p><p><strong>${escapeHtml(data.user.email ?? "")}</strong></p><p>Provider: ${escapeHtml(String(data.user.app_metadata?.provider ?? "unknown"))}</p>`,
          });
        } catch {
          // Fire-and-forget
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
