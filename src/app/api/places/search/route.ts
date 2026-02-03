import { NextRequest, NextResponse } from "next/server";

interface GooglePlace {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
}

export async function GET(request: NextRequest) {
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
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
        },
        body: JSON.stringify({ textQuery: q.trim() }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("Google Places API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Place search failed" },
        { status: 502 }
      );
    }

    const body = await response.json();
    const places = (body.places ?? []).map((p: GooglePlace) => ({
      id: p.id,
      name: p.displayName?.text ?? "",
      address: p.formattedAddress ?? "",
    }));

    return NextResponse.json(places);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to place search service" },
      { status: 502 }
    );
  }
}
