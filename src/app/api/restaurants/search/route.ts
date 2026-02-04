import { NextRequest, NextResponse } from "next/server";

interface BenEatsRestaurantRaw {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  rating: number | null;
  latitude: number | null;
  longitude: number | null;
  google_place_id: string | null;
}

export async function GET(request: NextRequest) {
  // Auth check — prevent unauthenticated abuse of paid API proxies
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 20 restaurant searches per minute per user
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`restaurants:${user.id}`, { limit: 20, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.BENEATS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Restaurant search is not configured" },
      { status: 503 }
    );
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: "Missing q parameter" },
      { status: 400 }
    );
  }

  try {
    const url = `https://beneats.ai/api/v1/restaurants?search=${encodeURIComponent(q.trim())}&limit=10`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Restaurant search failed" },
        { status: 502 }
      );
    }

    const body = await response.json();
    const restaurants = (body.data ?? []).map((r: BenEatsRestaurantRaw) => ({
      id: r.id,
      name: r.name,
      address: r.address,
      city: r.city,
      state: r.state,
      cuisine_type: r.cuisine_type,
      price_range: r.price_range,
      rating: r.rating,
      latitude: r.latitude,
      longitude: r.longitude,
      google_place_id: r.google_place_id,
    }));

    return NextResponse.json(restaurants);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to restaurant search service" },
      { status: 502 }
    );
  }
}
