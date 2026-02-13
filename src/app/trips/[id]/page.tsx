export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TripCalendar } from "@/components/calendar/trip-calendar";
import { EventList } from "@/components/events/event-list";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { TodoList } from "@/components/todos/todo-list";
import { TripActions } from "@/components/trips/trip-actions";
import { MapPin, Calendar } from "lucide-react";
import type { Trip, TripEvent, Todo, EventAttachment, ShoppingStore, BarVenue } from "@/lib/types";

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

  // Fetch shopping stores for shopping events
  const shoppingEventIds = typedEvents
    .filter((e) => e.type === "shopping")
    .map((e) => e.id);

  const shoppingStoresMap: Record<string, ShoppingStore[]> = {};
  if (shoppingEventIds.length > 0) {
    const { data: allStores } = await supabase
      .from("shopping_stores")
      .select("*")
      .in("event_id", shoppingEventIds)
      .order("sort_order", { ascending: true });

    for (const store of (allStores as ShoppingStore[] | null) ?? []) {
      if (!shoppingStoresMap[store.event_id]) shoppingStoresMap[store.event_id] = [];
      shoppingStoresMap[store.event_id].push(store);
    }
  }

  // Fetch bar venues for bars events
  const barsEventIds = typedEvents
    .filter((e) => e.type === "bars")
    .map((e) => e.id);

  const barVenuesMap: Record<string, BarVenue[]> = {};
  if (barsEventIds.length > 0) {
    const { data: allVenues } = await supabase
      .from("bar_venues")
      .select("*")
      .in("event_id", barsEventIds)
      .order("sort_order", { ascending: true });

    for (const venue of (allVenues as BarVenue[] | null) ?? []) {
      if (!barVenuesMap[venue.event_id]) barVenuesMap[venue.event_id] = [];
      barVenuesMap[venue.event_id].push(venue);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-tight">{typedTrip.name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
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
        {isOwner && (
          <TripActions
            tripId={id}
            shareToken={typedTrip.share_token}
            eventCount={typedEvents.length}
            todoCount={typedTodos.length}
          />
        )}
      </div>

      <Tabs defaultValue="itinerary">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList variant="line">
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="todos">
              To Do
              {typedTodos.length > 0 && (
                <span className="ml-1.5 rounded-md bg-muted px-1.5 py-0.5 text-xs">{typedTodos.length}</span>
              )}
            </TabsTrigger>
          </TabsList>
          <EventFormDialog tripId={id} />
        </div>

        <TabsContent value="itinerary" className="mt-4">
          <EventList events={typedEvents} attachmentsMap={attachmentsMap} shoppingStoresMap={shoppingStoresMap} barVenuesMap={barVenuesMap} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <TripCalendar
            events={typedEvents}
            tripStart={typedTrip.start_date}
            tripEnd={typedTrip.end_date}
          />
        </TabsContent>

        <TabsContent value="todos" className="mt-4">
          <TodoList tripId={id} todos={typedTodos} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
