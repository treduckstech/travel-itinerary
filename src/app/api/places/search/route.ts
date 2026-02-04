import { NextRequest, NextResponse } from "next/server";

interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
}

export async function GET(request: NextRequest) {
  // Auth check — prevent unauthenticated abuse of paid API proxies
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Place search is not configured" },
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
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", q.trim());
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("Google Places API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Place search failed" },
        { status: 502 }
      );
    }

    const body = await response.json();

    if (body.status !== "OK" && body.status !== "ZERO_RESULTS") {
      console.error("Google Places API status:", body.status, body.error_message);
      return NextResponse.json(
        { error: body.error_message || `Place search error: ${body.status}` },
        { status: 502 }
      );
    }

    const places = (body.results ?? []).slice(0, 10).map((p: GooglePlaceResult) => ({
      id: p.place_id,
      name: p.name,
      address: p.formatted_address ?? "",
    }));

    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to place search service" },
      { status: 502 }
    );
  }
}
