import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the user owns this trip (only owners should see/manage shares)
  const { data: trip } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: shares, error } = await supabase
    .from("trip_shares")
    .select("*")
    .eq("trip_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(shares);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();
  const serviceClient = createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify ownership
  const { data: trip } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email } = await request.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Look up user by email using service client (bypasses RLS on auth.users)
  const { data: userData } = await serviceClient.auth.admin.listUsers();
  const matchedUser = userData?.users?.find(
    (u) => u.email?.toLowerCase() === normalizedEmail
  );

  const { data: share, error } = await supabase.from("trip_shares").insert({
    trip_id: id,
    shared_with_email: normalizedEmail,
    shared_with_user_id: matchedUser?.id ?? null,
    role: "editor",
  }).select().single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Already shared with this email" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Notify the shared user
  if (matchedUser) {
    await serviceClient.from("notifications").insert({
      recipient_id: matchedUser.id,
      actor_id: user.id,
      type: "trip_shared",
      title: "Trip shared with you",
      body: `${user.email} shared a trip with you`,
      data: { trip_id: id },
    });
  }

  // Send email
  try {
    const { sendEmail } = await import("@/lib/email");
    await sendEmail({
      to: normalizedEmail,
      subject: "A trip was shared with you on Travel Itinerary",
      html: `<p><strong>${user.email}</strong> shared a trip with you on Travel Itinerary.</p><p>Log in to view and edit the trip.</p>`,
    });
  } catch {
    // Fire-and-forget
  }

  return NextResponse.json(share, { status: 201 });
}

export async function DELETE(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("shareId");

  if (!shareId) {
    return NextResponse.json({ error: "shareId is required" }, { status: 400 });
  }

  // Verify the user owns this trip before allowing share deletion
  const { data: trip } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!trip || trip.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("trip_shares")
    .delete()
    .eq("id", shareId)
    .eq("trip_id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
