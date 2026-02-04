import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdmin } from "@/lib/admin";

const PER_PAGE = 20;

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const serviceClient = createServiceClient();
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") ?? "1");
  const actionType = searchParams.get("action_type");
  const email = searchParams.get("email");
  const startDate = searchParams.get("start_date");
  const endDate = searchParams.get("end_date");

  let query = serviceClient
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (actionType) {
    query = query.eq("action_type", actionType);
  }
  if (email) {
    query = query.ilike("user_email", `%${email}%`);
  }
  if (startDate) {
    query = query.gte("created_at", `${startDate}T00:00:00Z`);
  }
  if (endDate) {
    query = query.lte("created_at", `${endDate}T23:59:59Z`);
  }

  const from = (page - 1) * PER_PAGE;
  query = query.range(from, from + PER_PAGE - 1);

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    logs: data ?? [],
    total: count ?? 0,
  });
}
