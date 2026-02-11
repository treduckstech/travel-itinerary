import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rateLimit } = await import("@/lib/rate-limit");
  const rl = rateLimit(`timezone:${user.id}`, { limit: 30, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Timezone lookup is not configured" },
      { status: 503 }
    );
  }

  const lat = request.nextUrl.searchParams.get("lat");
  const lng = request.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing lat or lng parameter" },
      { status: 400 }
    );
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json(
      { error: "Invalid coordinates" },
      { status: 400 }
    );
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const url = new URL("https://maps.googleapis.com/maps/api/timezone/json");
    url.searchParams.set("location", `${latNum},${lngNum}`);
    url.searchParams.set("timestamp", String(timestamp));
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Timezone lookup failed" },
        { status: 502 }
      );
    }

    const body = await response.json();

    if (body.status !== "OK") {
      return NextResponse.json(
        { error: "Could not determine timezone for these coordinates" },
        { status: 422 }
      );
    }

    return NextResponse.json({
      timezone: body.timeZoneId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to timezone service" },
      { status: 502 }
    );
  }
}
