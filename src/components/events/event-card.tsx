"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Hash,
  Trash2,
} from "lucide-react";
import type { TripEvent, EventType } from "@/lib/types";

const typeConfig: Record<
  EventType,
  { icon: React.ElementType; color: string }
> = {
  flight: { icon: Plane, color: "bg-event-flight-bg text-event-flight" },
  hotel: { icon: Hotel, color: "bg-event-hotel-bg text-event-hotel" },
  restaurant: { icon: UtensilsCrossed, color: "bg-event-restaurant-bg text-event-restaurant" },
  activity: { icon: MapPin, color: "bg-event-activity-bg text-event-activity" },
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex min-w-0 items-center gap-2">
          <Badge variant="secondary" className={`shrink-0 ${config.color}`}>
            <Icon className="mr-1 h-3 w-3" />
            {event.type}
          </Badge>
          <span className="truncate font-semibold">{event.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <EventFormDialog tripId={event.trip_id} event={event} />
          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Event</DialogTitle>
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
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5" />
          {format(new Date(event.start_datetime), "h:mm a")}
          {event.end_datetime &&
            ` - ${format(new Date(event.end_datetime), "h:mm a")}`}
        </div>
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </div>
        )}
        {event.confirmation_number && (
          <div className="flex items-center gap-2">
            <Hash className="h-3.5 w-3.5" />
            {event.confirmation_number}
          </div>
        )}
        {event.description && (
          <p className="pt-1">{event.description}</p>
        )}
        {event.notes && (
          <p className="pt-1 italic">{event.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
