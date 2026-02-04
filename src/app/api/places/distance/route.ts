import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Auth check — prevent unauthenticated abuse of paid API proxies
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 30 distance calculations per minute per user
  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`distance:${user.id}`, { limit: 30, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Distance calculation is not configured" },
      { status: 503 }
    );
  }

  const origin = request.nextUrl.searchParams.get("origin");
  const destination = request.nextUrl.searchParams.get("destination");

  if (!origin?.trim() || !destination?.trim()) {
    return NextResponse.json(
      { error: "Missing origin or destination parameter" },
      { status: 400 }
    );
  }

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", origin.trim());
    url.searchParams.set("destinations", destination.trim());
    url.searchParams.set("mode", "driving");
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("Google Distance Matrix API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Distance calculation failed" },
        { status: 502 }
      );
    }

    const body = await response.json();
    const element = body.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return NextResponse.json(
        { error: "Could not calculate distance between these locations" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      duration_minutes: Math.round(element.duration.value / 60),
      distance_text: element.distance.text,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to distance service" },
      { status: 502 }
    );
  }
}
