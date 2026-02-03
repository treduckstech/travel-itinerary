"use client";

import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Clock,
} from "lucide-react";
import type { TripEvent, EventType } from "@/lib/types";

const typeIcons: Record<EventType, React.ElementType> = {
  flight: Plane,
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  activity: MapPin,
};

const typeColors: Record<EventType, string> = {
  flight: "bg-event-flight-bg text-event-flight",
  hotel: "bg-event-hotel-bg text-event-hotel",
  restaurant: "bg-event-restaurant-bg text-event-restaurant",
  activity: "bg-event-activity-bg text-event-activity",
};

interface TripCalendarProps {
  events: TripEvent[];
  tripStart: string;
  tripEnd: string;
}

export function TripCalendar({
  events,
  tripStart,
  tripEnd,
}: TripCalendarProps) {
  const startDate = new Date(tripStart + "T00:00:00");
  const endDate = new Date(tripEnd + "T00:00:00");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startDate);

  const eventDates = events.map((e) => parseISO(e.start_datetime));

  const selectedEvents = selectedDate
    ? events
        .filter((e) => isSameDay(parseISO(e.start_datetime), selectedDate))
        .sort(
          (a, b) =>
            new Date(a.start_datetime).getTime() -
            new Date(b.start_datetime).getTime()
        )
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        defaultMonth={startDate}
        modifiers={{
          hasEvents: eventDates,
          tripRange: { from: startDate, to: endDate },
        }}
        modifiersClassNames={{
          hasEvents: "font-bold underline underline-offset-4",
          tripRange: "bg-accent/50",
        }}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d")
              : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing planned for this day
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => {
                const Icon = typeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColors[event.type]}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium leading-none">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        {format(parseISO(event.start_datetime), "h:mm a")}
                        {event.end_datetime &&
                          ` – ${format(
                            parseISO(event.end_datetime),
                            "h:mm a"
                          )}`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
