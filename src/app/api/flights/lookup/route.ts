import { NextRequest, NextResponse } from "next/server";

interface AviationStackResponse {
  error?: unknown;
  data?: Array<{
    departure?: { iata?: string; scheduled?: string };
    arrival?: { iata?: string; scheduled?: string };
    airline?: { name?: string };
  }>;
}

async function fetchFlights(
  apiKey: string,
  flightIata: string,
  flightDate?: string | null
): Promise<AviationStackResponse | null> {
  try {
    const url = new URL("http://api.aviationstack.com/v1/flights");
    url.searchParams.set("access_key", apiKey);
    url.searchParams.set("flight_iata", flightIata);
    if (flightDate) {
      url.searchParams.set("flight_date", flightDate);
    }
    url.searchParams.set("limit", "5");

    const response = await fetch(url.toString());
    if (!response.ok) return null;

    const data: AviationStackResponse = await response.json();
    if (data.error) return null;

    return data;
  } catch {
    return null;
  }
}

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
    // Try with flight_date first, fall back to without it (free tier may not support it)
    let data = flightDate
      ? await fetchFlights(apiKey, normalized, flightDate)
      : null;

    if (!data || !data.data?.length) {
      data = await fetchFlights(apiKey, normalized);
    }

    if (!data || !data.data?.length) {
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
