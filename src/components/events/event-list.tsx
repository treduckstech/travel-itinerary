import { format, parseISO } from "date-fns";
import { EventCard } from "./event-card";
import { Route, Hotel, UtensilsCrossed, MapPin } from "lucide-react";
import type { TripEvent } from "@/lib/types";

interface EventListProps {
  events: TripEvent[];
}

const eventHints = [
  { icon: Route, label: "Travel", color: "bg-event-travel-bg text-event-travel" },
  { icon: Hotel, label: "Hotels", color: "bg-event-hotel-bg text-event-hotel" },
  { icon: UtensilsCrossed, label: "Restaurants", color: "bg-event-restaurant-bg text-event-restaurant" },
  { icon: MapPin, label: "Activities", color: "bg-event-activity-bg text-event-activity" },
];

export function EventList({ events }: EventListProps) {
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

  // Group events by date
  const grouped = events.reduce<Record<string, TripEvent[]>>((acc, event) => {
    const dateKey = format(parseISO(event.start_datetime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-10">
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
            {grouped[dateKey]
              .sort(
                (a, b) =>
                  new Date(a.start_datetime).getTime() -
                  new Date(b.start_datetime).getTime()
              )
              .map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
