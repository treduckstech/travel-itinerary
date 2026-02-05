"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EventFormDialog } from "./event-form-dialog";
import { DriveDetailCard } from "./drive-detail-card";
import { TrainDetailCard } from "./train-detail-card";
import { RestaurantDetailCard } from "./restaurant-detail-card";
import { HotelDetailCard } from "./hotel-detail-card";
import { ActivityDetailCard } from "./activity-detail-card";
import { stations } from "@/data/stations";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Clock,
  Trash2,
  TrainFront,
  Ship,
  Car,
  ChevronDown,
} from "lucide-react";
import type { TripEvent, EventType, EventAttachment } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";
import { parseTimezone, formatInTimezone, utcToNaiveDate } from "@/lib/timezone";

const typeConfig: Record<
  EventType,
  { icon: React.ElementType; border: string; iconBg: string }
> = {
  travel: { icon: Plane, border: "border-l-event-travel", iconBg: "bg-event-travel-bg text-event-travel" },
  hotel: { icon: Hotel, border: "border-l-event-hotel", iconBg: "bg-event-hotel-bg text-event-hotel" },
  restaurant: { icon: UtensilsCrossed, border: "border-l-event-restaurant", iconBg: "bg-event-restaurant-bg text-event-restaurant" },
  activity: { icon: MapPin, border: "border-l-event-activity", iconBg: "bg-event-activity-bg text-event-activity" },
};

const subTypeIcons: Record<string, React.ElementType> = {
  flight: Plane,
  train: TrainFront,
  ferry: Ship,
  drive: Car,
};

function resolveStationCity(code: string): string {
  const station = stations.find((s) => s.code === code);
  return station?.city || code;
}

function formatTrainLocation(location: string): string {
  if (!location.includes("→")) return location;
  const [dep, arr] = location.split("→").map((s) => s.trim());
  return `${resolveStationCity(dep)} → ${resolveStationCity(arr)}`;
}

function isExpandable(event: TripEvent, attachments?: EventAttachment[]): boolean {
  return (
    event.type === "restaurant" ||
    event.type === "hotel" ||
    (event.type === "travel" && event.sub_type === "drive") ||
    (event.type === "travel" && event.sub_type === "train") ||
    (event.type === "activity" && !!(event.notes || event.description?.startsWith("https://www.google.com/maps") || (attachments && attachments.length > 0)))
  );
}

export function EventCard({ event, readOnly, showDateRange, fillHeight, attachments }: { event: TripEvent; readOnly?: boolean; showDateRange?: boolean; fillHeight?: boolean; attachments?: EventAttachment[] }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [expanded, setExpanded] = useState(fillHeight && isExpandable(event, attachments));
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // For fillHeight cards that start expanded, collapse if content overflows
  useEffect(() => {
    if (!fillHeight || !expanded) return;
    const card = cardRef.current;
    if (!card) return;

    const observer = new ResizeObserver(() => {
      if (card.scrollHeight > card.clientHeight + 4) {
        setExpanded(false);
        observer.disconnect();
      }
    });

    observer.observe(card);
    return () => observer.disconnect();
  }, [fillHeight, expanded]);
  const supabase = createClient();
  const config = typeConfig[event.type];
  const Icon = (event.type === "travel" && event.sub_type && subTypeIcons[event.sub_type])
    ? subTypeIcons[event.sub_type]
    : config.icon;
  const expandable = isExpandable(event, attachments);

  async function handleDelete() {
    setDeleteLoading(true);
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    setDeleteLoading(false);
    if (error) {
      toast.error("Failed to delete event");
      return;
    }
    setDeleteOpen(false);
    toast.success("Event deleted");
    logActivity("event_deleted", { event_id: event.id, title: event.title });
    router.refresh();
  }

  function handleCardClick() {
    if (expandable) {
      setExpanded((prev) => !prev);
    }
  }

  return (
    <div
      ref={cardRef}
      className={`group flex flex-col rounded-lg border border-l-4 ${config.border} bg-card p-4 transition-all duration-200 hover:bg-accent/30 ${expandable ? "cursor-pointer" : ""} ${fillHeight ? "h-full overflow-hidden" : ""}`}
      onClick={handleCardClick}
    >
      <div className="flex gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold leading-tight">{event.title}</p>
              {showDateRange && event.end_datetime && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {(() => {
                    const tz = parseTimezone(event.timezone);
                    if (tz.start) {
                      const startDate = utcToNaiveDate(event.start_datetime, tz.start);
                      const endDate = utcToNaiveDate(event.end_datetime!, tz.end || tz.start);
                      return `${format(new Date(startDate + "T00:00:00"), "MMM d")} – ${format(new Date(endDate + "T00:00:00"), "MMM d")}`;
                    }
                    return `${format(new Date(event.start_datetime), "MMM d")} – ${format(new Date(event.end_datetime!), "MMM d")}`;
                  })()}
                </p>
              )}
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                {event.type !== "hotel" && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(() => {
                      const tz = parseTimezone(event.timezone);
                      if (tz.start) {
                        const startStr = formatInTimezone(event.start_datetime, tz.start);
                        if (event.end_datetime) {
                          const endStr = formatInTimezone(event.end_datetime, tz.end || tz.start);
                          return `${startStr} – ${endStr}`;
                        }
                        return startStr;
                      }
                      return (
                        <>
                          {format(new Date(event.start_datetime), "h:mm a")}
                          {event.end_datetime &&
                            ` – ${format(new Date(event.end_datetime), "h:mm a")}`}
                        </>
                      );
                    })()}
                  </span>
                )}
                {event.location && (
                  (event.type === "restaurant" || event.type === "hotel" || event.type === "activity") && event.description?.startsWith("https://www.google.com/maps") ? (
                    <a
                      href={event.description}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 truncate hover:text-foreground transition-colors"
                    >
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </a>
                  ) : (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {event.type === "travel" && event.sub_type === "train"
                          ? formatTrainLocation(event.location)
                          : event.location}
                      </span>
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              {expandable && (
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              )}
              {!readOnly && (
                <div
                  className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EventFormDialog tripId={event.trip_id} event={event} />
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display text-xl">Delete Event</DialogTitle>
                        <DialogDescription>
                          This will permanently delete &ldquo;{event.title}&rdquo;. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? "Deleting..." : "Delete"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </div>

          {event.notes && !expandable && (
            <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{event.notes}</p>
          )}
        </div>
      </div>

      {expanded && (
        <div className="ml-12">
          {event.type === "travel" && event.sub_type === "drive" && (
            <DriveDetailCard event={event} />
          )}
          {event.type === "travel" && event.sub_type === "train" && (
            <TrainDetailCard event={event} attachments={attachments} />
          )}
          {event.type === "restaurant" && (
            <RestaurantDetailCard event={event} />
          )}
          {event.type === "hotel" && (
            <HotelDetailCard event={event} />
          )}
          {event.type === "activity" && (
            <ActivityDetailCard event={event} attachments={attachments} />
          )}
        </div>
      )}
    </div>
  );
}
