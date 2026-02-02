"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  flight: { icon: Plane, color: "bg-blue-100 text-blue-700" },
  hotel: { icon: Hotel, color: "bg-purple-100 text-purple-700" },
  restaurant: { icon: UtensilsCrossed, color: "bg-orange-100 text-orange-700" },
  activity: { icon: MapPin, color: "bg-green-100 text-green-700" },
};

export function EventCard({ event }: { event: TripEvent }) {
  const router = useRouter();
  const supabase = createClient();
  const config = typeConfig[event.type];
  const Icon = config.icon;

  async function handleDelete() {
    await supabase.from("events").delete().eq("id", event.id);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={config.color}>
            <Icon className="mr-1 h-3 w-3" />
            {event.type}
          </Badge>
          <span className="font-semibold">{event.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <EventFormDialog tripId={event.trip_id} event={event} />
          <Button variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
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
