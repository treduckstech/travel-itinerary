import { format, parseISO, isSameDay, eachDayOfInterval } from "date-fns";
import { EventCard } from "./event-card";
import { Route, Hotel, UtensilsCrossed, MapPin, ShoppingBag, Wine } from "lucide-react";
import type { TripEvent, EventAttachment, ShoppingStore, BarVenue } from "@/lib/types";
import { parseTimezone, utcToNaiveDate } from "@/lib/timezone";
import { extractCityFromAddress } from "@/lib/address";

interface EventListProps {
  events: TripEvent[];
  readOnly?: boolean;
  attachmentsMap?: Record<string, EventAttachment[]>;
  shoppingStoresMap?: Record<string, ShoppingStore[]>;
  barVenuesMap?: Record<string, BarVenue[]>;
}

const eventHints = [
  { icon: Route, label: "Travel", color: "bg-event-travel-bg text-event-travel" },
  { icon: Hotel, label: "Hotels", color: "bg-event-hotel-bg text-event-hotel" },
  { icon: UtensilsCrossed, label: "Restaurants", color: "bg-event-restaurant-bg text-event-restaurant" },
  { icon: MapPin, label: "Activities", color: "bg-event-activity-bg text-event-activity" },
  { icon: ShoppingBag, label: "Shopping", color: "bg-event-shopping-bg text-event-shopping" },
  { icon: Wine, label: "Bars", color: "bg-event-bars-bg text-event-bars" },
];

function isRightColumnEvent(event: TripEvent): boolean {
  if (event.type !== "hotel" || !event.end_datetime) return false;
  return !isSameDay(parseISO(event.start_datetime), parseISO(event.end_datetime));
}


export function EventList({ events, readOnly, attachmentsMap, shoppingStoresMap, barVenuesMap }: EventListProps) {
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

  // Separate hotels, shopping, bars, and day events
  const hotelEvents = events.filter(isRightColumnEvent);
  const shoppingEvents = events.filter((e) => e.type === "shopping");
  const barsEvents = events.filter((e) => e.type === "bars");
  const col3Events = [...shoppingEvents, ...barsEvents];
  const dayEvents = events.filter((e) => !isRightColumnEvent(e) && e.type !== "shopping" && e.type !== "bars");

  // City matching: map each column-3 event (shopping/bars) to a hotel
  // Try: 1) event title vs hotel location, 2) city from event location, 3) city from child addresses
  const hotelCol3Map = new Map<string, TripEvent[]>(); // hotelId → col3 events
  const unmatchedCol3: TripEvent[] = [];

  for (const ev of col3Events) {
    const candidates: string[] = [];

    // 1) Event title (e.g. "Firenze")
    if (ev.title && ev.title !== "Shopping" && ev.title !== "Bars") {
      candidates.push(ev.title.toLowerCase());
    }

    // 2) City extracted from event's location field
    if (ev.location) {
      const city = extractCityFromAddress(ev.location);
      if (city) candidates.push(city.toLowerCase());
    }

    // 3) City extracted from child addresses (stores or venues)
    const children = ev.type === "shopping"
      ? shoppingStoresMap?.[ev.id]
      : barVenuesMap?.[ev.id];
    if (children) {
      for (const child of children) {
        if (child.address) {
          const city = extractCityFromAddress(child.address);
          if (city) {
            candidates.push(city.toLowerCase());
            break;
          }
        }
      }
    }

    const matchedHotel = hotelEvents.find((h) =>
      candidates.some((c) => h.location?.toLowerCase().includes(c))
    );

    if (matchedHotel) {
      const existing = hotelCol3Map.get(matchedHotel.id) ?? [];
      existing.push(ev);
      hotelCol3Map.set(matchedHotel.id, existing);
    } else {
      unmatchedCol3.push(ev);
    }
  }

  // Collect all dates: from day events + all days covered by hotels
  const dateSet = new Set<string>();

  dayEvents.forEach((event) => {
    const tz = parseTimezone(event.timezone);
    const dateKey = tz.start
      ? utcToNaiveDate(event.start_datetime, tz.start)
      : format(parseISO(event.start_datetime), "yyyy-MM-dd");
    dateSet.add(dateKey);
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
    const tz = parseTimezone(event.timezone);
    const dateKey = tz.start
      ? utcToNaiveDate(event.start_datetime, tz.start)
      : format(parseISO(event.start_datetime), "yyyy-MM-dd");
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

  const hasRightColumn = hotelPositions.length > 0 || col3Events.length > 0;

  return (
    <>
      {/* Desktop: three-column grid layout (day events | hotels | shopping) */}
      <div
        className={`hidden ${hasRightColumn ? "lg:grid" : ""}`}
        style={{
          gridTemplateColumns: col3Events.length > 0 ? "minmax(0, 3fr) minmax(0, 4fr) minmax(0, 3fr)" : "minmax(0, 2fr) minmax(0, 3fr)",
          gridTemplateRows: `repeat(${sortedDates.length + (unmatchedCol3.length > 0 ? 1 : 0)}, auto)`,
          columnGap: "16px",
        }}
      >
        {/* Full-width date header lines (behind everything) */}
        {sortedDates.map((dateKey) => {
          const row = dateToRow.get(dateKey)!;
          const hasEvents = !!grouped[dateKey]?.length;
          return (
            <div
              key={`header-${dateKey}`}
              style={{ gridColumn: "1 / -1", gridRow: row }}
              className="pointer-events-none relative z-0 flex items-start"
            >
              <div className="flex w-full items-center gap-3">
                <h3 className={`shrink-0 font-display text-foreground/70 ${hasEvents ? "text-lg" : "text-sm text-muted-foreground"}`}>
                  {format(parseISO(dateKey), "EEEE, MMMM d")}
                </h3>
                <div className={`h-px flex-1 ${hasEvents ? "bg-border" : "bg-border/50"}`} />
              </div>
            </div>
          );
        })}

        {/* Column 1: day events */}
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
                      <EventCard key={event.id} event={event} readOnly={readOnly} attachments={attachmentsMap?.[event.id]} shoppingStores={shoppingStoresMap?.[event.id]} barVenues={barVenuesMap?.[event.id]} />
                    ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Column 2: spanning hotel cards */}
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
              <EventCard event={hotel} readOnly={readOnly} showDateRange fillHeight attachments={attachmentsMap?.[hotel.id]} shoppingStores={shoppingStoresMap?.[hotel.id]} barVenues={barVenuesMap?.[hotel.id]} />
            </div>
          </div>
        ))}

        {/* Column 3: shopping/bars cards matched to hotels */}
        {hotelPositions.map(({ hotel, startRow, endRow }) => {
          const matchedCol3 = hotelCol3Map.get(hotel.id);
          if (!matchedCol3) return null;
          return (
            <div
              key={`col3-${hotel.id}`}
              style={{
                gridColumn: 3,
                gridRow: `${startRow} / ${endRow}`,
              }}
              className="relative z-10 pb-4 pt-8"
            >
              <div className="space-y-3">
                {matchedCol3.map((ev) => (
                  <EventCard key={ev.id} event={ev} readOnly={readOnly} shoppingStores={shoppingStoresMap?.[ev.id]} barVenues={barVenuesMap?.[ev.id]} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Column 3: unmatched shopping/bars at the bottom */}
        {unmatchedCol3.length > 0 && (
          <div
            style={{
              gridColumn: col3Events.length > 0 ? 3 : 2,
              gridRow: sortedDates.length + 1,
            }}
            className="relative z-10 pb-4 pt-8"
          >
            <div className="space-y-3">
              {unmatchedCol3.map((ev) => (
                <EventCard key={ev.id} event={ev} readOnly={readOnly} shoppingStores={shoppingStoresMap?.[ev.id]} barVenues={barVenuesMap?.[ev.id]} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: single column (original layout), also used when no right column */}
      <div className={`space-y-10 ${hasRightColumn ? "lg:hidden" : ""}`}>
        {sortedDates.map((dateKey) => (
          <div key={dateKey}>
            <div className="mb-4 flex items-center gap-3">
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
                  <EventCard key={event.id} event={event} readOnly={readOnly} attachments={attachmentsMap?.[event.id]} shoppingStores={shoppingStoresMap?.[event.id]} />
                ))}
            </div>
          </div>
        ))}

        {shoppingEvents.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h3 className="shrink-0 font-display text-lg text-foreground/70">
                Shopping
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              {shoppingEvents.map((event) => (
                <EventCard key={event.id} event={event} readOnly={readOnly} shoppingStores={shoppingStoresMap?.[event.id]} barVenues={barVenuesMap?.[event.id]} />
              ))}
            </div>
          </div>
        )}

        {barsEvents.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <h3 className="shrink-0 font-display text-lg text-foreground/70">
                Bars
              </h3>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              {barsEvents.map((event) => (
                <EventCard key={event.id} event={event} readOnly={readOnly} shoppingStores={shoppingStoresMap?.[event.id]} barVenues={barVenuesMap?.[event.id]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
