import type { TripEvent } from "@/lib/types";
import { parseTimezone, utcToNaive } from "@/lib/timezone";

/**
 * Format a naive datetime string (yyyy-MM-ddTHH:mm) as Google Calendar's
 * date format: YYYYMMDDTHHmmSS (no Z suffix — interpreted in the ctz timezone).
 */
function naiveToGoogleDate(naive: string): string {
  return naive.replace(/[-:]/g, "") + "00";
}

/**
 * Format a UTC ISO string as Google Calendar's UTC date format: YYYYMMDDTHHmmSSZ
 */
function utcToGoogleDate(isoString: string): string {
  return isoString.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function addHoursUtc(isoString: string, hours: number): string {
  const d = new Date(isoString);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

export function buildGoogleCalendarUrl(event: TripEvent): string {
  const { start: tz } = parseTimezone(event.timezone);
  const endUtc = event.end_datetime || addHoursUtc(event.start_datetime, 1);

  let start: string;
  let end: string;

  if (tz) {
    // Convert UTC to local time in the event's timezone, pass as floating time
    start = naiveToGoogleDate(utcToNaive(event.start_datetime, tz));
    end = naiveToGoogleDate(utcToNaive(endUtc, tz));
  } else {
    // No timezone info — fall back to UTC
    start = utcToGoogleDate(event.start_datetime);
    end = utcToGoogleDate(endUtc);
  }

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });

  if (tz) {
    params.set("ctz", tz);
  }

  if (event.location) {
    params.set("location", event.location);
  }

  if (event.notes) {
    params.set("details", event.notes);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
