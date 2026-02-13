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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { EventFormDialog } from "./event-form-dialog";
import { DriveDetailCard } from "./drive-detail-card";
import { TrainDetailCard } from "./train-detail-card";
import { RestaurantDetailCard } from "./restaurant-detail-card";
import { HotelDetailCard } from "./hotel-detail-card";
import { ActivityDetailCard } from "./activity-detail-card";
import { ShoppingDetailCard } from "./shopping-detail-card";
import { BarDetailCard } from "./bar-detail-card";
import { stations } from "@/data/stations";
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  TrainFront,
  Ship,
  Car,
  ChevronDown,
  ShoppingBag,
  Wine,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import type { TripEvent, EventType, EventAttachment, ShoppingStore, BarVenue } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";
import { parseTimezone, formatInTimezone, utcToNaiveDate } from "@/lib/timezone";
import { extractCityFromAddress } from "@/lib/address";

const typeConfig: Record<
  EventType,
  { icon: React.ElementType; color: string }
> = {
  travel: { icon: Plane, color: "text-event-travel" },
  hotel: { icon: Hotel, color: "text-event-hotel" },
  restaurant: { icon: UtensilsCrossed, color: "text-event-restaurant" },
  activity: { icon: MapPin, color: "text-event-activity" },
  shopping: { icon: ShoppingBag, color: "text-event-shopping" },
  bars: { icon: Wine, color: "text-event-bars" },
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

function getShoppingDisplayTitle(event: TripEvent, stores?: ShoppingStore[]): string {
  // If title is already a city name, use it
  if (event.title && event.title !== "Shopping") {
    return `Shopping in ${event.title}`;
  }
  // Try extracting city from store addresses
  if (stores?.length) {
    for (const store of stores) {
      if (store.address) {
        const city = extractCityFromAddress(store.address);
        if (city) return `Shopping in ${city}`;
      }
    }
  }
  // Try extracting city from event location
  if (event.location) {
    const city = extractCityFromAddress(event.location);
    if (city) return `Shopping in ${city}`;
  }
  return "Shopping";
}

function getBarsDisplayTitle(event: TripEvent, venues?: BarVenue[]): string {
  if (event.title && event.title !== "Bars") {
    return `Bars in ${event.title}`;
  }
  if (venues?.length) {
    for (const venue of venues) {
      if (venue.address) {
        const city = extractCityFromAddress(venue.address);
        if (city) return `Bars in ${city}`;
      }
    }
  }
  if (event.location) {
    const city = extractCityFromAddress(event.location);
    if (city) return `Bars in ${city}`;
  }
  return "Bars";
}

function isExpandable(event: TripEvent, attachments?: EventAttachment[]): boolean {
  return (
    event.type === "restaurant" ||
    event.type === "hotel" ||
    event.type === "shopping" ||
    event.type === "bars" ||
    (event.type === "travel" && event.sub_type === "drive") ||
    (event.type === "travel" && event.sub_type === "train") ||
    (event.type === "activity" && !!(event.notes || event.description?.startsWith("https://www.google.com/maps") || (attachments && attachments.length > 0)))
  );
}

export function EventCard({ event, readOnly, showDateRange, fillHeight, attachments, shoppingStores, barVenues }: { event: TripEvent; readOnly?: boolean; showDateRange?: boolean; fillHeight?: boolean; attachments?: EventAttachment[]; shoppingStores?: ShoppingStore[]; barVenues?: BarVenue[] }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
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

  // Build display title
  const displayTitle = event.type === "shopping"
    ? getShoppingDisplayTitle(event, shoppingStores)
    : event.type === "bars"
    ? getBarsDisplayTitle(event, barVenues)
    : event.title;

  // Build inline metadata segments
  const metaSegments: React.ReactNode[] = [];

  if (showDateRange && event.type !== "shopping" && event.type !== "bars" && event.end_datetime) {
    const tz = parseTimezone(event.timezone);
    if (tz.start) {
      const startDate = utcToNaiveDate(event.start_datetime, tz.start);
      const endDate = utcToNaiveDate(event.end_datetime!, tz.end || tz.start);
      metaSegments.push(
        `${format(new Date(startDate + "T00:00:00"), "MMM d")} – ${format(new Date(endDate + "T00:00:00"), "MMM d")}`
      );
    } else {
      metaSegments.push(
        `${format(new Date(event.start_datetime), "MMM d")} – ${format(new Date(event.end_datetime!), "MMM d")}`
      );
    }
  } else if (event.type !== "hotel" && event.type !== "shopping" && event.type !== "bars") {
    // Time display
    const tz = parseTimezone(event.timezone);
    if (tz.start) {
      const startStr = formatInTimezone(event.start_datetime, tz.start);
      if (event.end_datetime) {
        const endStr = formatInTimezone(event.end_datetime, tz.end || tz.start);
        metaSegments.push(`${startStr} – ${endStr}`);
      } else {
        metaSegments.push(startStr);
      }
    } else {
      const timeStr = format(new Date(event.start_datetime), "h:mm a") +
        (event.end_datetime ? ` – ${format(new Date(event.end_datetime), "h:mm a")}` : "");
      metaSegments.push(timeStr);
    }
  }

  // Shopping/bars store/venue count
  if (event.type === "shopping" && shoppingStores && shoppingStores.length > 0) {
    metaSegments.push(`${shoppingStores.length} ${shoppingStores.length === 1 ? "store" : "stores"}`);
  } else if (event.type === "bars" && barVenues && barVenues.length > 0) {
    metaSegments.push(`${barVenues.length} ${barVenues.length === 1 ? "venue" : "venues"}`);
  }

  // Location
  if (event.location && event.type !== "shopping" && event.type !== "bars") {
    const locationText = event.type === "travel" && event.sub_type === "train"
      ? formatTrainLocation(event.location)
      : event.location;
    metaSegments.push(locationText);
  }

  return (
    <div
      ref={cardRef}
      className={`flex flex-col rounded-lg border bg-card transition-all duration-200 hover:bg-accent/30 ${fillHeight ? "h-full overflow-hidden" : ""}`}
    >
      <Collapsible open={!!expanded} onOpenChange={expandable ? setExpanded : undefined}>
        <div className="flex items-center gap-2 px-3 py-2.5">
          <CollapsibleTrigger
            asChild
            disabled={!expandable}
          >
            <button
              type="button"
              className={`flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm ${expandable ? "cursor-pointer" : "cursor-default"}`}
              tabIndex={0}
              aria-expanded={expandable ? !!expanded : undefined}
            >
              <Icon className={`h-5 w-5 shrink-0 ${config.color}`} />
              <span className="min-w-0 flex-1 flex items-baseline gap-1.5 overflow-hidden">
                <span className="truncate text-sm font-medium">{displayTitle}</span>
                {metaSegments.length > 0 && (
                  <span className="hidden sm:flex shrink-0 items-baseline gap-1 text-sm text-muted-foreground whitespace-nowrap">
                    {metaSegments.map((seg, i) => (
                      <span key={i} className="flex items-baseline gap-1">
                        <span className="text-muted-foreground/50">&middot;</span>
                        <span className="truncate max-w-[200px]">{seg}</span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
              {expandable && (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                />
              )}
            </button>
          </CollapsibleTrigger>

          {!readOnly && (
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile metadata line (below title on small screens) */}
        {metaSegments.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 pb-2 text-xs text-muted-foreground sm:hidden">
            {metaSegments.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/50">&middot;</span>}
                <span className="truncate">{seg}</span>
              </span>
            ))}
          </div>
        )}

        <CollapsibleContent>
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
          {event.type === "shopping" && (
            <ShoppingDetailCard event={event} stores={shoppingStores ?? []} readOnly={readOnly} />
          )}
          {event.type === "bars" && (
            <BarDetailCard event={event} venues={barVenues ?? []} readOnly={readOnly} />
          )}
        </CollapsibleContent>
      </Collapsible>

      {event.notes && !expandable && (
        <p className="px-3 pb-2.5 whitespace-pre-line text-sm text-muted-foreground">{event.notes}</p>
      )}

      {/* Edit dialog - rendered outside dropdown to avoid portal issues */}
      {editOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <EventFormDialog tripId={event.trip_id} event={event} open={editOpen} onOpenChange={setEditOpen} />
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Delete {event.type === "shopping" ? "Shopping" : event.type === "bars" ? "Bars" : "Event"}</DialogTitle>
            <DialogDescription>
              {event.type === "shopping" && shoppingStores && shoppingStores.length > 0
                ? `This will permanently delete "${getShoppingDisplayTitle(event, shoppingStores)}" and all ${shoppingStores.length} ${shoppingStores.length === 1 ? "store" : "stores"} in it. This action cannot be undone.`
                : event.type === "bars" && barVenues && barVenues.length > 0
                ? `This will permanently delete "${getBarsDisplayTitle(event, barVenues)}" and all ${barVenues.length} ${barVenues.length === 1 ? "venue" : "venues"} in it. This action cannot be undone.`
                : <>This will permanently delete &ldquo;{event.title}&rdquo;. This action cannot be undone.</>
              }
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
  );
}
