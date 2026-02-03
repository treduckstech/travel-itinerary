import { format, parseISO } from "date-fns";
import { EventCard } from "./event-card";
import type { TripEvent } from "@/lib/types";

interface EventListProps {
  events: TripEvent[];
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        No events yet. Add your first event!
      </p>
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
