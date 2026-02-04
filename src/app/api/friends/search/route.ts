import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rl = rateLimit(`friends-search:${user.id}`, { limit: 30, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const serviceClient = createServiceClient();

  // Get all users
  const { data: userData } = await serviceClient.auth.admin.listUsers();
  if (!userData?.users) {
    return NextResponse.json([]);
  }

  // Get existing friendships (pending or accepted) to exclude
  const { data: friendships } = await serviceClient
    .from("friendships")
    .select("requester_id, addressee_id")
    .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
    .in("status", ["pending", "accepted"]);

  const excludedIds = new Set<string>([user.id]);
  friendships?.forEach((f) => {
    excludedIds.add(f.requester_id);
    excludedIds.add(f.addressee_id);
  });

  const lowerQ = q.toLowerCase();
  const results = userData.users
    .filter((u) => {
      if (excludedIds.has(u.id)) return false;
      const fullName = (u.user_metadata?.full_name ?? u.user_metadata?.name ?? "") as string;
      return fullName.toLowerCase().includes(lowerQ);
    })
    .slice(0, 10)
    .map((u) => ({
      id: u.id,
      name: (u.user_metadata?.full_name ?? u.user_metadata?.name ?? "Unknown") as string,
    }));

  return NextResponse.json(results);
}
