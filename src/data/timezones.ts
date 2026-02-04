export interface TimezoneEntry {
  iana: string;
  city: string;
  region: string;
  label: string;
  searchTerms: string; // lowercase, pre-computed for search
}

/** Common abbreviation aliases mapping to IANA timezone */
const abbreviationAliases: Record<string, string> = {
  est: "America/New_York",
  edt: "America/New_York",
  cst: "America/Chicago",
  cdt: "America/Chicago",
  mst: "America/Denver",
  mdt: "America/Denver",
  pst: "America/Los_Angeles",
  pdt: "America/Los_Angeles",
  akst: "America/Anchorage",
  akdt: "America/Anchorage",
  hst: "Pacific/Honolulu",
  gmt: "Europe/London",
  bst: "Europe/London",
  cet: "Europe/Paris",
  cest: "Europe/Paris",
  eet: "Europe/Helsinki",
  eest: "Europe/Helsinki",
  jst: "Asia/Tokyo",
  kst: "Asia/Seoul",
  cst_asia: "Asia/Shanghai",
  ist: "Asia/Kolkata",
  aest: "Australia/Sydney",
  aedt: "Australia/Sydney",
  acst: "Australia/Adelaide",
  awst: "Australia/Perth",
  nzst: "Pacific/Auckland",
  nzdt: "Pacific/Auckland",
  ast: "America/Halifax",
  adt: "America/Halifax",
  nst: "America/St_Johns",
  ndt: "America/St_Johns",
  wet: "Europe/Lisbon",
  west: "Europe/Lisbon",
  msk: "Europe/Moscow",
  sgt: "Asia/Singapore",
  hkt: "Asia/Hong_Kong",
  ict: "Asia/Bangkok",
  pht: "Asia/Manila",
  wib: "Asia/Jakarta",
  brt: "America/Sao_Paulo",
  art: "America/Argentina/Buenos_Aires",
  cat: "Africa/Johannesburg",
  eat: "Africa/Nairobi",
  wat: "Africa/Lagos",
  gulf: "Asia/Dubai",
  pkt: "Asia/Karachi",
};

/** Get the current abbreviation for a timezone (e.g. "EST", "PDT") */
function getTimezoneAbbreviation(iana: string): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(new Date());
    return parts.find((p) => p.type === "timeZoneName")?.value || "";
  } catch {
    return "";
  }
}

/** Extract a human-readable city name from an IANA timezone string */
function extractCity(iana: string): string {
  const parts = iana.split("/");
  const city = parts[parts.length - 1];
  return city.replace(/_/g, " ");
}

/** Extract the region from an IANA timezone string */
function extractRegion(iana: string): string {
  return iana.split("/")[0];
}

function buildTimezoneList(): TimezoneEntry[] {
  let ianaTimezones: string[];
  try {
    ianaTimezones = Intl.supportedValuesOf("timeZone");
  } catch {
    // Fallback for older environments
    ianaTimezones = [];
  }

  return ianaTimezones
    .filter((iana) => iana.includes("/") && !iana.startsWith("Etc/"))
    .map((iana) => {
      const city = extractCity(iana);
      const region = extractRegion(iana);
      const abbr = getTimezoneAbbreviation(iana);
      const label = abbr ? `${city} (${abbr})` : city;
      const searchTerms = `${city} ${region} ${abbr} ${iana}`.toLowerCase();

      return { iana, city, region, label, searchTerms };
    })
    .sort((a, b) => a.city.localeCompare(b.city));
}

export const timezones: TimezoneEntry[] = buildTimezoneList();

/** Lookup a timezone entry by IANA string */
export function findTimezone(iana: string): TimezoneEntry | undefined {
  return timezones.find((tz) => tz.iana === iana);
}

/** Search timezones by query string (city name, abbreviation, or IANA string) */
export function searchTimezones(query: string, limit = 20): TimezoneEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Check abbreviation aliases first
  const aliasIana = abbreviationAliases[q];
  const aliasEntry = aliasIana ? timezones.find((tz) => tz.iana === aliasIana) : undefined;

  // Find all matching timezones with ranking
  const exact: TimezoneEntry[] = [];
  const startsWith: TimezoneEntry[] = [];
  const contains: TimezoneEntry[] = [];

  for (const tz of timezones) {
    if (tz === aliasEntry) continue; // will be added first
    const cityLower = tz.city.toLowerCase();
    if (cityLower === q || tz.iana.toLowerCase() === q) {
      exact.push(tz);
    } else if (cityLower.startsWith(q) || tz.searchTerms.startsWith(q)) {
      startsWith.push(tz);
    } else if (tz.searchTerms.includes(q)) {
      contains.push(tz);
    }
  }

  const results = [
    ...(aliasEntry ? [aliasEntry] : []),
    ...exact,
    ...startsWith,
    ...contains,
  ];

  return results.slice(0, limit);
}
