import { NextRequest, NextResponse } from "next/server";

// --- Shared result shape ---

interface LookupResult {
  title: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time: string | null;
  arrival_time: string | null;
  duration_minutes: number | null;
  route: string;
}

// --- FlightAware types ---

interface FlightAwareAirport {
  code_iata?: string;
  code_icao?: string;
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
  cancelled?: boolean;
}

interface FlightAwareResponse {
  flights?: FlightAwareFlight[];
}

// --- AirLabs types (routes endpoint) ---

interface AirLabsRoute {
  flight_iata?: string;
  flight_icao?: string;
  airline_iata?: string;
  airline_icao?: string;
  dep_iata?: string;
  dep_icao?: string;
  dep_time?: string;
  dep_time_utc?: string;
  arr_iata?: string;
  arr_icao?: string;
  arr_time?: string;
  arr_time_utc?: string;
  duration?: number;
  cs_flight_iata?: string;
  days?: string; // e.g. "1234567" where 1=Mon, 7=Sun
}

interface AirLabsRoutesResponse {
  response?: AirLabsRoute[];
  error?: { message?: string };
}

// --- IATA → ICAO mapping for FlightAware ---

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
  const iataMatch = ident.match(/^([A-Z]{2})(\d+)$/);
  if (iataMatch) return { airline: iataMatch[1], number: iataMatch[2] };
  const icaoMatch = ident.match(/^([A-Z]{3})(\d+)$/);
  if (icaoMatch) return { airline: icaoMatch[1], number: icaoMatch[2] };
  return null;
}

function computeDuration(dep: string, arr: string): number | null {
  const depMs = new Date(dep).getTime();
  const arrMs = new Date(arr).getTime();
  if (arrMs > depMs) return Math.round((arrMs - depMs) / 60000);
  return null;
}

// --- FlightAware lookup ---

async function fetchFlightAware(
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

async function lookupViaFlightAware(
  apiKey: string,
  normalized: string
): Promise<LookupResult | null> {
  let flights = await fetchFlightAware(apiKey, normalized);

  if (!flights) {
    const parsed = parseFlightIdent(normalized);
    if (parsed && parsed.airline.length === 2 && IATA_TO_ICAO[parsed.airline]) {
      flights = await fetchFlightAware(apiKey, IATA_TO_ICAO[parsed.airline] + parsed.number);
    }
  }

  if (!flights) return null;

  const flight = flights.find((f) => !f.cancelled) ?? flights[0];
  const depAirport = flight.origin?.code_iata || flight.origin?.code_icao || "";
  const arrAirport = flight.destination?.code_iata || flight.destination?.code_icao || "";
  const departureTime = flight.scheduled_out || flight.estimated_out || flight.actual_out || null;
  const arrivalTime = flight.scheduled_in || flight.estimated_in || flight.actual_in || null;

  return {
    title: flight.ident_iata || flight.ident || normalized,
    departure_airport: depAirport,
    arrival_airport: arrAirport,
    departure_time: departureTime,
    arrival_time: arrivalTime,
    duration_minutes: departureTime && arrivalTime ? computeDuration(departureTime, arrivalTime) : null,
    route: [depAirport, arrAirport].filter(Boolean).join(" → "),
  };
}

// --- AirLabs lookup ---

function getDayOfWeek(dateStr: string): string {
  // Returns "1"-"7" where 1=Mon, 7=Sun (matching AirLabs format)
  const d = new Date(dateStr + "T00:00:00");
  const jsDay = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  return jsDay === 0 ? "7" : String(jsDay);
}

async function fetchAirLabsRoutes(
  apiKey: string,
  normalized: string,
  depIata: string | null
): Promise<AirLabsRoute[]> {
  try {
    let url = `https://airlabs.co/api/v9/routes?flight_iata=${encodeURIComponent(normalized)}&api_key=${encodeURIComponent(apiKey)}`;
    if (depIata) {
      url += `&dep_iata=${encodeURIComponent(depIata)}`;
    }
    const response = await fetch(url);
    if (!response.ok) return [];
    const data: AirLabsRoutesResponse = await response.json();
    if (data.error || !data.response?.length) return [];
    return data.response;
  } catch {
    return [];
  }
}

function pickBestRoute(routes: AirLabsRoute[], flightDate: string | null): AirLabsRoute {
  if (flightDate && routes.length > 1) {
    const dayNum = getDayOfWeek(flightDate);
    const match = routes.find((r) => r.days?.includes(dayNum));
    if (match) return match;
  }
  return routes[0];
}

function routeToResult(route: AirLabsRoute, normalized: string): LookupResult {
  const depAirport = route.dep_iata || route.dep_icao || "";
  const arrAirport = route.arr_iata || route.arr_icao || "";
  return {
    title: route.flight_iata || normalized,
    departure_airport: depAirport,
    arrival_airport: arrAirport,
    departure_time: route.dep_time_utc || route.dep_time || null,
    arrival_time: route.arr_time_utc || route.arr_time || null,
    duration_minutes: route.duration ?? null,
    route: [depAirport, arrAirport].filter(Boolean).join(" → "),
  };
}

async function lookupViaAirLabs(
  apiKey: string,
  normalized: string,
  flightDate: string | null,
  depAirportFilter: string | null
): Promise<LookupResult | null> {
  // Try with dep_iata filter first
  if (depAirportFilter) {
    const filtered = await fetchAirLabsRoutes(apiKey, normalized, depAirportFilter);
    if (filtered.length) {
      return routeToResult(pickBestRoute(filtered, flightDate), normalized);
    }
    // Fall back to unfiltered search
  }

  const routes = await fetchAirLabsRoutes(apiKey, normalized, null);
  if (!routes.length) return null;
  return routeToResult(pickBestRoute(routes, flightDate), normalized);
}

// --- Main handler ---

export async function GET(request: NextRequest) {
  // Auth check — prevent unauthenticated abuse of paid API proxies
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const flightAwareKey = process.env.FLIGHTAWARE_API_KEY;
  const airLabsKey = process.env.AIRLABS_API_KEY;

  if (!flightAwareKey && !airLabsKey) {
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
  const flightDate = request.nextUrl.searchParams.get("flight_date"); // optional YYYY-MM-DD
  const depAirport = request.nextUrl.searchParams.get("dep_iata")?.toUpperCase() || null; // optional, e.g. "ATL"

  const debug: Record<string, unknown> = { normalized, flightDate, depAirport, providers: [] as string[] };

  try {
    // Try FlightAware first (better data), fall back to AirLabs (better codeshare support)
    let result: LookupResult | null = null;

    if (flightAwareKey) {
      (debug.providers as string[]).push("flightaware");
      result = await lookupViaFlightAware(flightAwareKey, normalized);
      debug.flightaware = result ? "found" : "not_found";
    }

    if (!result && airLabsKey) {
      (debug.providers as string[]).push("airlabs");
      result = await lookupViaAirLabs(airLabsKey, normalized, flightDate, depAirport);
      debug.airlabs = result ? "found" : "not_found";

      // Include available routes in debug for troubleshooting
      if (!result) {
        const allRoutes = await fetchAirLabsRoutes(airLabsKey, normalized, null);
        debug.airlabs_available_routes = allRoutes.map((r) => ({
          dep: r.dep_iata, arr: r.arr_iata, days: r.days, duration: r.duration,
        }));
      }
    }

    if (!result) {
      return NextResponse.json(
        { error: "Flight not found", debug },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to flight data service", debug },
      { status: 502 }
    );
  }
}
