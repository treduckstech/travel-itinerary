/**
 * Timezone utilities for event display and form handling.
 * Uses browser Intl API — no external libraries needed.
 */

/** Parse a timezone column value into start/end timezones */
export function parseTimezone(tz: string | null): { start: string | null; end: string | null } {
  if (!tz) return { start: null, end: null };
  if (tz.includes("|||")) {
    const [start, end] = tz.split("|||");
    return { start, end };
  }
  return { start: tz, end: tz };
}

/** Build a timezone column value from start and optional end timezone */
export function buildTimezone(startTz: string, endTz?: string): string {
  if (endTz && endTz !== startTz) {
    return `${startTz}|||${endTz}`;
  }
  return startTz;
}

/** Get the browser's current timezone */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a datetime-local value (naive) to a UTC ISO string,
 * interpreting the naive datetime in the given timezone.
 *
 * E.g. naiveToUtc("2025-06-15T14:30", "America/New_York")
 * → the UTC equivalent of 2:30 PM in New York on that date.
 */
export function naiveToUtc(naiveDatetime: string, timezone: string): string {
  // Parse the naive datetime parts
  const [datePart, timePart] = naiveDatetime.split("T");
  if (!datePart) return new Date(naiveDatetime).toISOString();

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = (timePart || "00:00").split(":").map(Number);

  // Create a date and find the UTC offset for this timezone at this time
  // We use a binary search approach: format the date in the target timezone
  // and adjust until the formatted result matches our target naive time
  const target = { year, month, day, hours, minutes };

  // Start with a guess: treat the naive time as UTC
  let guess = new Date(Date.UTC(year, month - 1, day, hours, minutes));

  // Format the guess in the target timezone and see how far off we are
  for (let i = 0; i < 3; i++) {
    const parts = getDatePartsInTimezone(guess, timezone);
    const diffMs =
      (target.year - parts.year) * 365.25 * 24 * 3600000 + // rough year
      (target.month - parts.month) * 30.44 * 24 * 3600000 + // rough month
      (target.day - parts.day) * 24 * 3600000 +
      (target.hours - parts.hours) * 3600000 +
      (target.minutes - parts.minutes) * 60000;

    if (Math.abs(diffMs) < 60000) break; // close enough (within 1 minute)
    guess = new Date(guess.getTime() + diffMs);
  }

  // Final precise adjustment
  const finalParts = getDatePartsInTimezone(guess, timezone);
  const finalDiffMs =
    (target.day - finalParts.day) * 24 * 3600000 +
    (target.hours - finalParts.hours) * 3600000 +
    (target.minutes - finalParts.minutes) * 60000;
  if (Math.abs(finalDiffMs) >= 60000) {
    guess = new Date(guess.getTime() + finalDiffMs);
  }

  return guess.toISOString();
}

/**
 * Convert a UTC ISO string to a datetime-local string in a given timezone.
 * Used to populate form fields when editing an event.
 */
export function utcToNaive(utcIso: string, timezone: string): string {
  const date = new Date(utcIso);
  const parts = getDatePartsInTimezone(date, timezone);
  const y = String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  const h = String(parts.hours).padStart(2, "0");
  const min = String(parts.minutes).padStart(2, "0");
  return `${y}-${m}-${d}T${h}:${min}`;
}

/**
 * Convert a UTC ISO string to just the date portion (yyyy-MM-dd) in a given timezone.
 */
export function utcToNaiveDate(utcIso: string, timezone: string): string {
  const date = new Date(utcIso);
  const parts = getDatePartsInTimezone(date, timezone);
  const y = String(parts.year).padStart(4, "0");
  const m = String(parts.month).padStart(2, "0");
  const d = String(parts.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Format a UTC ISO string for display in a given timezone.
 * Returns something like "2:30 PM EST".
 */
export function formatInTimezone(utcIso: string, timezone: string): string {
  const date = new Date(utcIso);
  return date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  });
}

/** Get date component parts for a Date in a specific timezone */
function getDatePartsInTimezone(
  date: Date,
  timezone: string
): { year: number; month: number; day: number; hours: number; minutes: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hours: get("hour") === 24 ? 0 : get("hour"),
    minutes: get("minute"),
  };
}
