import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Flight lookup is not configured" },
      { status: 503 }
    );
  }

  const flightIata = request.nextUrl.searchParams.get("flight_iata");
  if (!flightIata) {
    return NextResponse.json(
      { error: "Missing flight_iata parameter" },
      { status: 400 }
    );
  }

  const normalized = flightIata.replace(/\s+/g, "").toUpperCase();
  const flightDate = request.nextUrl.searchParams.get("flight_date");

  try {
    const url = new URL("http://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", apiKey);
    url.searchParams.set("flight_iata", normalized);
    if (flightDate) {
      url.searchParams.set("flight_date", flightDate);
    }
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Flight data service unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: "Flight data service error" },
        { status: 502 }
      );
    }

    if (!data.data || data.data.length === 0) {
      return NextResponse.json(
        { error: "Flight not found" },
        { status: 404 }
      );
    }

    const flight = data.data[0];
    const departure = flight.departure;
    const arrival = flight.arrival;
    const airline = flight.airline?.name ?? "";

    const title = airline
      ? `${airline} ${normalized}`
      : normalized;

    return NextResponse.json({
      title,
      departure_airport: departure?.iata ?? "",
      arrival_airport: arrival?.iata ?? "",
      departure_time: departure?.scheduled ?? null,
      arrival_time: arrival?.scheduled ?? null,
      route: [departure?.iata, arrival?.iata].filter(Boolean).join(" → "),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to flight data service" },
      { status: 502 }
    );
  }
}
