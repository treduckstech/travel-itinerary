"use client";

import { useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
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
  flight: "bg-blue-100 text-blue-700",
  hotel: "bg-purple-100 text-purple-700",
  restaurant: "bg-orange-100 text-orange-700",
  activity: "bg-green-100 text-green-700",
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
          <CardTitle className="text-base">
            {selectedDate
              ? format(selectedDate, "EEEE, MMMM d, yyyy")
              : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events on this date.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((event) => {
                const Icon = typeIcons[event.type];
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-md border p-3"
                  >
                    <Badge
                      variant="secondary"
                      className={typeColors[event.type]}
                    >
                      <Icon className="h-3 w-3" />
                    </Badge>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">
                        {event.title}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(parseISO(event.start_datetime), "h:mm a")}
                        {event.end_datetime &&
                          ` - ${format(
                            parseISO(event.end_datetime),
                            "h:mm a"
                          )}`}
                      </div>
                      {event.location && (
                        <p className="text-xs text-muted-foreground">
                          {event.location}
                        </p>
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
