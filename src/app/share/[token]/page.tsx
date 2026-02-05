export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createServiceClient } from "@/lib/supabase/service";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCalendar } from "@/components/calendar/trip-calendar";
import { EventList } from "@/components/events/event-list";
import { TodoList } from "@/components/todos/todo-list";
import { MapPin, Calendar } from "lucide-react";
import type { Trip, TripEvent, Todo, EventAttachment } from "@/lib/types";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const supabase = createServiceClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("id, name, destination, start_date, end_date, share_token, created_at")
    .eq("share_token", token)
    .single();

  if (!trip) notFound();

  const typedTrip = trip as Trip;

  const [{ data: events }, { data: todos }] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("trip_id", typedTrip.id)
      .order("start_datetime", { ascending: true }),
    supabase
      .from("todos")
      .select("*")
      .eq("trip_id", typedTrip.id)
      .order("sort_order", { ascending: true }),
  ]);

  const typedEvents = (events as TripEvent[] | null) ?? [];
  const typedTodos = (todos as Todo[] | null) ?? [];

  // Fetch attachments for activity events
  const activityEventIds = typedEvents
    .filter((e) => e.type === "activity" || (e.type === "travel" && e.sub_type === "train"))
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
      <div>
        <p className="mb-2 text-sm text-muted-foreground">Shared itinerary</p>
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

      <Tabs defaultValue="itinerary">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="todos">
            To Do ({typedTodos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="mt-6">
          <EventList events={typedEvents} readOnly attachmentsMap={attachmentsMap} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <TripCalendar
            events={typedEvents}
            tripStart={typedTrip.start_date}
            tripEnd={typedTrip.end_date}
          />
        </TabsContent>

        <TabsContent value="todos" className="mt-6">
          <TodoList tripId={typedTrip.id} todos={typedTodos} readOnly />
        </TabsContent>
      </Tabs>
    </div>
  );
}
