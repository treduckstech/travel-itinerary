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
  const { data: notifications, error } = await serviceClient
    .from("notifications")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }

  return NextResponse.json(notifications);
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const serviceClient = createServiceClient();

  if (body.all === true) {
    const { error } = await serviceClient
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .eq("read", false);

    if (error) {
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  } else if (Array.isArray(body.ids) && body.ids.length > 0) {
    const { error } = await serviceClient
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", user.id)
      .in("id", body.ids);

    if (error) {
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: "Provide { all: true } or { ids: [...] }" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
