"use client";

import { useMemo, useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrainFront,
  Ship,
  Car,
} from "lucide-react";
import type { TripEvent, EventType } from "@/lib/types";

const typeIcons: Record<EventType, React.ElementType> = {
  travel: Plane,
  hotel: Hotel,
  restaurant: UtensilsCrossed,
  activity: MapPin,
};

const subTypeIcons: Record<string, React.ElementType> = {
  flight: Plane,
  train: TrainFront,
  ferry: Ship,
  drive: Car,
};

const typeColors: Record<EventType, string> = {
  travel: "bg-event-travel-bg text-event-travel",
  hotel: "bg-event-hotel-bg text-event-hotel",
  restaurant: "bg-event-restaurant-bg text-event-restaurant",
  activity: "bg-event-activity-bg text-event-activity",
};

const DAYS_PER_PAGE = 5;

interface DayGroup {
  dateKey: string;
  label: string;
  events: TripEvent[];
}

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
  const [page, setPage] = useState(0);

  const eventDates = events.map((e) => parseISO(e.start_datetime));

  const dayGroups = useMemo<DayGroup[]>(() => {
    const grouped = new Map<string, TripEvent[]>();
    for (const event of events) {
      const key = format(parseISO(event.start_datetime), "yyyy-MM-dd");
      const group = grouped.get(key);
      if (group) {
        group.push(event);
      } else {
        grouped.set(key, [event]);
      }
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, dayEvents]) => ({
        dateKey,
        label: format(parseISO(dateKey), "EEEE, MMMM d"),
        events: dayEvents.sort(
          (a, b) =>
            new Date(a.start_datetime).getTime() -
            new Date(b.start_datetime).getTime()
        ),
      }));
  }, [events]);

  const totalPages = Math.max(1, Math.ceil(dayGroups.length / DAYS_PER_PAGE));
  const currentGroups = dayGroups.slice(
    page * DAYS_PER_PAGE,
    (page + 1) * DAYS_PER_PAGE
  );

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (!date) return;
    const clickedKey = format(date, "yyyy-MM-dd");
    const index = dayGroups.findIndex((g) => g.dateKey === clickedKey);
    if (index >= 0) {
      setPage(Math.floor(index / DAYS_PER_PAGE));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
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

      <div className="space-y-4">
        {dayGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No events planned for this trip yet.
          </p>
        ) : (
          <>
            {currentGroups.map((group) => {
              const isSelected =
                selectedDate &&
                isSameDay(parseISO(group.dateKey), selectedDate);
              return (
                <div key={group.dateKey} className="space-y-2">
                  <h3
                    className={`font-display text-sm font-semibold ${
                      isSelected
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {group.label}
                  </h3>
                  <div className="space-y-2">
                    {group.events.map((event) => {
                      const Icon = (event.type === "travel" && event.sub_type && subTypeIcons[event.sub_type])
                        ? subTypeIcons[event.sub_type]
                        : typeIcons[event.type];
                      return (
                        <div
                          key={event.id}
                          className="flex items-start gap-3 rounded-lg border p-3"
                        >
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${typeColors[event.type]}`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="truncate font-medium leading-none">
                              {event.title}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0" />
                              {format(
                                parseISO(event.start_datetime),
                                "h:mm a"
                              )}
                              {event.end_datetime &&
                                ` – ${format(
                                  parseISO(event.end_datetime),
                                  "h:mm a"
                                )}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">
                                  {event.location}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Next
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
