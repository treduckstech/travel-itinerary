import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const zoom = searchParams.get("zoom") || "15";
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");

  let staticUrl: string;

  if (origin && destination) {
    // Drive mode: fetch directions for polyline, then render route map
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&key=${apiKey}`;
    try {
      const dirRes = await fetch(directionsUrl);
      const dirData = await dirRes.json();

      if (dirData.status === "OK" && dirData.routes?.[0]?.overview_polyline?.points) {
        const polyline = dirData.routes[0].overview_polyline.points;
        staticUrl = `https://maps.googleapis.com/maps/api/staticmap?size=400x200&scale=2&path=weight:4|color:0x4285F4ff|enc:${polyline}&markers=size:small|color:green|label:A|${encodeURIComponent(origin)}&markers=size:small|color:red|label:B|${encodeURIComponent(destination)}&key=${apiKey}`;
      } else {
        // Fallback: just show markers without route
        staticUrl = `https://maps.googleapis.com/maps/api/staticmap?size=400x200&scale=2&markers=size:small|color:green|label:A|${encodeURIComponent(origin)}&markers=size:small|color:red|label:B|${encodeURIComponent(destination)}&key=${apiKey}`;
      }
    } catch {
      staticUrl = `https://maps.googleapis.com/maps/api/staticmap?size=400x200&scale=2&markers=size:small|color:green|label:A|${encodeURIComponent(origin)}&markers=size:small|color:red|label:B|${encodeURIComponent(destination)}&key=${apiKey}`;
    }
  } else if (lat && lng) {
    // Restaurant mode: single marker
    staticUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=400x200&scale=2&markers=color:red|${lat},${lng}&key=${apiKey}`;
  } else {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  try {
    const imageRes = await fetch(staticUrl);
    if (!imageRes.ok) {
      return new NextResponse(null, { status: 502 });
    }

    const contentType = imageRes.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      return new NextResponse(null, { status: 502 });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
