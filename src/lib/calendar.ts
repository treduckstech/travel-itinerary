import type { TripEvent } from "@/lib/types";

function toGoogleCalendarDate(isoString: string): string {
  return isoString.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace(/Z$/, "") + (isoString.endsWith("Z") ? "Z" : "");
}

function addHours(isoString: string, hours: number): string {
  const d = new Date(isoString);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d.toISOString();
}

export function buildGoogleCalendarUrl(event: TripEvent): string {
  const start = toGoogleCalendarDate(event.start_datetime);
  const end = toGoogleCalendarDate(
    event.end_datetime || addHours(event.start_datetime, 1)
  );

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });

  if (event.location) {
    params.set("location", event.location);
  }

  if (event.notes) {
    params.set("details", event.notes);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
