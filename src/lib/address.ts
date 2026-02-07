// Extract city from Google formatted_address
// Examples: "Via Roma, 50123 Firenze FI, Italy" → "Firenze"
//           "151 W 34th St, New York, NY 10001, USA" → "New York"
//           "87 Brompton Rd, London SW1X 7XL, United Kingdom" → "London"
export function extractCityFromAddress(address: string): string | null {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  const secondLast = parts[parts.length - 2];

  // US: "NY 10001" or "CA 90210"
  if (/^[A-Z]{2}\s+\d{5}/.test(secondLast)) {
    return parts[parts.length - 3] || null;
  }

  // European: "50123 Firenze FI" or "75001 Paris"
  const stripped = secondLast.replace(/^\d{4,6}\s*/, "").replace(/\s+[A-Z]{2}$/, "").trim();
  if (stripped && stripped !== secondLast) {
    return stripped;
  }

  // UK: "London SW1X 7XL"
  const ukMatch = secondLast.match(/^(.+?)\s+[A-Z]{1,2}\d/);
  if (ukMatch) {
    return ukMatch[1].trim();
  }

  // Default: use 2nd-to-last if it doesn't look like a postal code
  if (!/^\d+$/.test(secondLast)) {
    return secondLast;
  }

  return parts[parts.length - 3] || null;
}
