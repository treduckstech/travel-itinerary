import { format, parseISO, isSameDay, eachDayOfInterval } from "date-fns";
import { EventCard } from "./event-card";
import { Route, Hotel, UtensilsCrossed, MapPin } from "lucide-react";
import type { TripEvent } from "@/lib/types";

interface EventListProps {
  events: TripEvent[];
  readOnly?: boolean;
}

const eventHints = [
  { icon: Route, label: "Travel", color: "bg-event-travel-bg text-event-travel" },
  { icon: Hotel, label: "Hotels", color: "bg-event-hotel-bg text-event-hotel" },
  { icon: UtensilsCrossed, label: "Restaurants", color: "bg-event-restaurant-bg text-event-restaurant" },
  { icon: MapPin, label: "Activities", color: "bg-event-activity-bg text-event-activity" },
];

function isMultiDayHotel(event: TripEvent): boolean {
  if (event.type !== "hotel" || !event.end_datetime) return false;
  return !isSameDay(parseISO(event.start_datetime), parseISO(event.end_datetime));
}

export function EventList({ events, readOnly }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <p className="mb-1 font-display text-lg">Build your itinerary</p>
        <p className="mb-6 max-w-xs text-sm text-muted-foreground">
          Add events to see them organized by day. You can track:
        </p>
        <div className="flex gap-3">
          {eventHints.map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Separate multi-day hotels from day events
  const hotelEvents = events.filter(isMultiDayHotel);
  const dayEvents = events.filter((e) => !isMultiDayHotel(e));

  // Collect all dates: from day events + all days covered by hotels
  const dateSet = new Set<string>();

  dayEvents.forEach((event) => {
    dateSet.add(format(parseISO(event.start_datetime), "yyyy-MM-dd"));
  });

  hotelEvents.forEach((hotel) => {
    const start = parseISO(hotel.start_datetime);
    const end = parseISO(hotel.end_datetime!);
    eachDayOfInterval({ start, end }).forEach((day) => {
      dateSet.add(format(day, "yyyy-MM-dd"));
    });
  });

  const sortedDates = Array.from(dateSet).sort();
  const dateToRow = new Map(sortedDates.map((d, i) => [d, i + 1])); // 1-based for grid rows

  // Group day events by date
  const grouped = dayEvents.reduce<Record<string, TripEvent[]>>((acc, event) => {
    const dateKey = format(parseISO(event.start_datetime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  // Compute hotel grid positions
  const hotelPositions = hotelEvents.map((hotel) => {
    const startKey = format(parseISO(hotel.start_datetime), "yyyy-MM-dd");
    const endKey = format(parseISO(hotel.end_datetime!), "yyyy-MM-dd");
    const startRow = dateToRow.get(startKey) ?? 1;
    // End row is exclusive in CSS grid, so we add 1 to include the checkout day row
    const endRow = (dateToRow.get(endKey) ?? startRow) + 1;
    return { hotel, startRow, endRow };
  });

  const hasHotels = hotelPositions.length > 0;

  return (
    <>
      {/* Desktop: three-column grid layout */}
      <div
        className={`hidden ${hasHotels ? "md:grid" : ""}`}
        style={{
          gridTemplateColumns: "3fr 2fr",
          gridTemplateRows: `repeat(${sortedDates.length}, auto)`,
          columnGap: "24px",
        }}
      >
        {/* Full-width date header lines (behind everything) */}
        {sortedDates.map((dateKey) => {
          const row = dateToRow.get(dateKey)!;
          return (
            <div
              key={`header-${dateKey}`}
              style={{ gridColumn: "1 / -1", gridRow: row }}
              className="pointer-events-none relative z-0 flex items-start"
            >
              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <h3 className="shrink-0 font-display text-lg text-foreground/70">
                  {format(parseISO(dateKey), "EEEE, MMMM d")}
                </h3>
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          );
        })}

        {/* Left column: day events */}
        {sortedDates.map((dateKey) => {
          const row = dateToRow.get(dateKey)!;
          const dateEvents = grouped[dateKey] ?? [];
          return (
            <div
              key={`events-${dateKey}`}
              style={{ gridColumn: 1, gridRow: row }}
              className="relative z-10 min-h-16 pb-4 pt-8"
            >
              {dateEvents.length > 0 && (
                <div className="space-y-3">
                  {dateEvents
                    .sort(
                      (a, b) =>
                        new Date(a.start_datetime).getTime() -
                        new Date(b.start_datetime).getTime()
                    )
                    .map((event) => (
                      <EventCard key={event.id} event={event} readOnly={readOnly} />
                    ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Right column: spanning hotel cards */}
        {hotelPositions.map(({ hotel, startRow, endRow }) => (
          <div
            key={hotel.id}
            style={{
              gridColumn: 2,
              gridRow: `${startRow} / ${endRow}`,
            }}
            className="relative z-10 pb-4 pt-8"
          >
            <div className="h-full">
              <EventCard event={hotel} readOnly={readOnly} showDateRange fillHeight />
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: single column (original layout), also used when no multi-day hotels */}
      <div className={`space-y-10 ${hasHotels ? "md:hidden" : ""}`}>
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h3 className="shrink-0 font-display text-lg text-foreground/70">
                {format(parseISO(dateKey), "EEEE, MMMM d")}
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              {[...(grouped[dateKey] ?? []), ...hotelEvents.filter((h) =>
                format(parseISO(h.start_datetime), "yyyy-MM-dd") === dateKey
              )]
                .sort(
                  (a, b) =>
                    new Date(a.start_datetime).getTime() -
                    new Date(b.start_datetime).getTime()
                )
                .map((event) => (
                  <EventCard key={event.id} event={event} readOnly={readOnly} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
