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

// Common IATA → ICAO airline code mapping
const IATA_TO_ICAO: Record<string, string> = {
  AA: "AAL", DL: "DAL", UA: "UAL", WN: "SWA", B6: "JBU",
  AS: "ASA", NK: "NKS", F9: "FFT", HA: "HAL", SY: "SCX",
  AC: "ACA", WS: "WJA", BA: "BAW", LH: "DLH", AF: "AFR",
  KL: "KLM", QF: "QFA", SQ: "SIA", EK: "UAE", QR: "QTR",
  TK: "THY", LX: "SWR", AZ: "ITY", IB: "IBE", JL: "JAL",
  NH: "ANA", CX: "CPA", KE: "KAL", OZ: "AAR", VS: "VIR",
  AM: "AMX", AV: "AVA", CM: "CMP", LA: "LAN", TP: "TAP",
  SK: "SAS", AY: "FIN", OS: "AUA", SN: "BEL", EI: "EIN",
  G4: "AAY", XP: "CXP", MX: "MXY", "5X": "UPS", FX: "FDX",
};

function parseFlightIdent(ident: string): { airline: string; number: string } | null {
  // Match 2-letter IATA code + flight number (e.g., DL9661)
  const iataMatch = ident.match(/^([A-Z]{2})(\d+)$/);
  if (iataMatch) return { airline: iataMatch[1], number: iataMatch[2] };

  // Match 3-letter ICAO code + flight number (e.g., DAL9661)
  const icaoMatch = ident.match(/^([A-Z]{3})(\d+)$/);
  if (icaoMatch) return { airline: icaoMatch[1], number: icaoMatch[2] };

  return null;
}

async function fetchFlights(
  apiKey: string,
  ident: string
): Promise<FlightAwareFlight[] | null> {
  try {
    const url = `https://aeroapi.flightaware.com/aeroapi/flights/${encodeURIComponent(ident)}?max_pages=1`;
    const response = await fetch(url, {
      headers: { "x-apikey": apiKey },
    });

    if (!response.ok) return null;

    const data: FlightAwareResponse = await response.json();
    return data.flights?.length ? data.flights : null;
  } catch {
    return null;
  }
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
    // Try the ident as provided first
    let flights = await fetchFlights(apiKey, normalized);

    // If no results and ident looks like IATA format, try ICAO equivalent
    if (!flights) {
      const parsed = parseFlightIdent(normalized);
      if (parsed && parsed.airline.length === 2 && IATA_TO_ICAO[parsed.airline]) {
        const icaoIdent = IATA_TO_ICAO[parsed.airline] + parsed.number;
        flights = await fetchFlights(apiKey, icaoIdent);
      }
    }

    if (!flights) {
      return NextResponse.json(
        { error: "Flight not found" },
        { status: 404 }
      );
    }

    // Pick the first non-cancelled flight
    const flight = flights.find((f) => !f.cancelled) ?? flights[0];

    const origin = flight.origin;
    const destination = flight.destination;

    const displayIdent = flight.ident_iata || flight.ident || normalized;
    const title = displayIdent;

    const depAirport = origin?.code_iata || origin?.code_icao || "";
    const arrAirport =
      destination?.code_iata || destination?.code_icao || "";

    const departureTime =
      flight.scheduled_out || flight.estimated_out || flight.actual_out || null;
    const arrivalTime =
      flight.scheduled_in || flight.estimated_in || flight.actual_in || null;

    // Calculate flight duration from departure/arrival times
    let durationMinutes: number | null = null;
    if (departureTime && arrivalTime) {
      const dep = new Date(departureTime).getTime();
      const arr = new Date(arrivalTime).getTime();
      if (arr > dep) {
        durationMinutes = Math.round((arr - dep) / 60000);
      }
    }

    return NextResponse.json({
      title,
      departure_airport: depAirport,
      arrival_airport: arrAirport,
      departure_time: departureTime,
      arrival_time: arrivalTime,
      duration_minutes: durationMinutes,
      route: [depAirport, arrAirport].filter(Boolean).join(" → "),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to flight data service" },
      { status: 502 }
    );
  }
}
