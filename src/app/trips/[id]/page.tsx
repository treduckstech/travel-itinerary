export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCalendar } from "@/components/calendar/trip-calendar";
import { EventList } from "@/components/events/event-list";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { TodoList } from "@/components/todos/todo-list";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { ShareDialog } from "@/components/trips/share-dialog";
import { MapPin, Calendar, Pencil } from "lucide-react";
import type { Trip, TripEvent, Todo, EventAttachment } from "@/lib/types";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (!trip) notFound();

  const typedTrip = trip as Trip;
  const isOwner = user?.id === typedTrip.user_id;

  const [{ data: events }, { data: todos }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("trip_id", id)
      .order("start_datetime", { ascending: true }),
    supabase
      .from("todos")
      .select("*")
      .eq("trip_id", id)
      .order("sort_order", { ascending: true }),
  ]);

  const typedEvents = (events as TripEvent[] | null) ?? [];
  const typedTodos = (todos as Todo[] | null) ?? [];

  // Fetch attachments for activity events
  const activityEventIds = typedEvents
    .filter((e) => e.type === "activity")
    .map((e) => e.id);

  const attachmentsMap: Record<string, EventAttachment[]> = {};
  if (activityEventIds.length > 0) {
    const { data: allAttachments } = await supabase
      .from("event_attachments")
      .select("*")
      .in("event_id", activityEventIds)
      .order("created_at", { ascending: true });

    for (const att of (allAttachments as EventAttachment[] | null) ?? []) {
      if (!attachmentsMap[att.event_id]) attachmentsMap[att.event_id] = [];
      attachmentsMap[att.event_id].push(att);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">{typedTrip.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-5 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-base font-medium text-foreground/70">
              <MapPin className="h-4 w-4 text-primary" />
              {typedTrip.destination}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4" />
              {format(new Date(typedTrip.start_date + "T00:00:00"), "MMM d")} –{" "}
              {format(
                new Date(typedTrip.end_date + "T00:00:00"),
                "MMM d, yyyy"
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <>
              <ShareDialog tripId={id} shareToken={typedTrip.share_token} />
              <Link href={`/trips/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <DeleteTripButton tripId={id} eventCount={typedEvents.length} todoCount={typedTodos.length} />
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="itinerary">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="todos">
              To Do ({typedTodos.length})
            </TabsTrigger>
          </TabsList>
          <EventFormDialog tripId={id} />
        </div>

        <TabsContent value="itinerary" className="mt-6">
          <EventList events={typedEvents} attachmentsMap={attachmentsMap} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <TripCalendar
            events={typedEvents}
            tripStart={typedTrip.start_date}
            tripEnd={typedTrip.end_date}
          />
        </TabsContent>

        <TabsContent value="todos" className="mt-6">
          <TodoList tripId={id} todos={typedTodos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
