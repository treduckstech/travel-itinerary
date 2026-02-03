"use client";

import { useState } from "react";
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
import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Clock,
  Trash2,
} from "lucide-react";
import type { TripEvent, EventType } from "@/lib/types";

const typeConfig: Record<
  EventType,
  { icon: React.ElementType; border: string; iconBg: string }
> = {
  flight: { icon: Plane, border: "border-l-event-flight", iconBg: "bg-event-flight-bg text-event-flight" },
  hotel: { icon: Hotel, border: "border-l-event-hotel", iconBg: "bg-event-hotel-bg text-event-hotel" },
  restaurant: { icon: UtensilsCrossed, border: "border-l-event-restaurant", iconBg: "bg-event-restaurant-bg text-event-restaurant" },
  activity: { icon: MapPin, border: "border-l-event-activity", iconBg: "bg-event-activity-bg text-event-activity" },
};

export function EventCard({ event }: { event: TripEvent }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const config = typeConfig[event.type];
  const Icon = config.icon;

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
    router.refresh();
  }

  return (
    <div className={`group flex gap-3 rounded-lg border border-l-4 ${config.border} bg-card p-4 transition-all duration-200 hover:bg-accent/30`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold leading-tight">{event.title}</p>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_datetime), "h:mm a")}
                {event.end_datetime &&
                  ` – ${format(new Date(event.end_datetime), "h:mm a")}`}
              </span>
              {event.location && (
                event.type === "restaurant" && event.description?.startsWith("https://www.google.com/maps") ? (
                  <a
                    href={event.description}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 truncate hover:text-foreground transition-colors"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </a>
                ) : (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </span>
                )
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
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
        </div>

        {event.notes && (
          <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{event.notes}</p>
        )}
      </div>
    </div>
  );
}
