import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const days = request.nextUrl.searchParams.get("days");
  const serviceClient = createServiceClient();

  let query = serviceClient.from("events").select("type");
  if (days) {
    const cutoff = new Date(Date.now() - parseInt(days) * 86400000);
    query = query.gte("created_at", cutoff.toISOString());
  }

  const { data: events } = await query;

  const counts = new Map<string, number>();
  for (const e of events ?? []) {
    counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  }

  const result = [...counts.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json(result);
}
