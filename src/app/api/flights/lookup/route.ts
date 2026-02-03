import { NextRequest, NextResponse } from "next/server";

interface FlightAwareAirport {
  code_iata?: string;
  code_icao?: string;
  name?: string;
  city?: string;
}

interface FlightAwareFlight {
  ident?: string;
  ident_iata?: string;
  operator?: string;
  operator_iata?: string;
  flight_number?: string;
  origin?: FlightAwareAirport;
  destination?: FlightAwareAirport;
  scheduled_out?: string;
  scheduled_in?: string;
  estimated_out?: string;
  estimated_in?: string;
  actual_out?: string;
  actual_in?: string;
  status?: string;
  cancelled?: boolean;
}

interface FlightAwareResponse {
  flights?: FlightAwareFlight[];
}

export async function GET(request: NextRequest) {
  const apiKey = process.env.FLIGHTAWARE_API_KEY;
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

  try {
    const url = `https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(normalized)}?ident_type=designator&max_pages=1`;

    const response = await fetch(url, {
      headers: { "x-apikey": apiKey },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Flight not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: "Flight data service unavailable" },
        { status: 502 }
      );
    }

    const data: FlightAwareResponse = await response.json();

    if (!data.flights?.length) {
      return NextResponse.json(
        { error: "Flight not found" },
        { status: 404 }
      );
    }

    // Pick the first non-cancelled flight
    const flight =
      data.flights.find((f) => !f.cancelled) ?? data.flights[0];

    const origin = flight.origin;
    const destination = flight.destination;

    // Build a readable airline name from the operator or ident
    const airlineCode =
      flight.operator_iata || flight.operator || "";
    const flightNum = flight.flight_number || "";
    const displayIdent = flight.ident_iata || flight.ident || normalized;
    const title = airlineCode && flightNum
      ? `${displayIdent}`
      : normalized;

    const depAirport = origin?.code_iata || origin?.code_icao || "";
    const arrAirport =
      destination?.code_iata || destination?.code_icao || "";

    const departureTime =
      flight.scheduled_out || flight.estimated_out || flight.actual_out || null;
    const arrivalTime =
      flight.scheduled_in || flight.estimated_in || flight.actual_in || null;

    return NextResponse.json({
      title,
      departure_airport: depAirport,
      arrival_airport: arrAirport,
      departure_time: departureTime,
      arrival_time: arrivalTime,
      route: [depAirport, arrAirport].filter(Boolean).join(" → "),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to flight data service" },
      { status: 502 }
    );
  }
}
