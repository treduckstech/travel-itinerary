export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { TripCalendar } from "@/components/calendar/trip-calendar";
import { EventList } from "@/components/events/event-list";
import { EventFormDialog } from "@/components/events/event-form-dialog";
import { TodoList } from "@/components/todos/todo-list";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { ArrowLeft, MapPin, Calendar, Pencil } from "lucide-react";
import type { Trip, TripEvent, Todo } from "@/lib/types";

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (!trip) notFound();

  const typedTrip = trip as Trip;

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
      .order("created_at", { ascending: true }),
  ]);

  const typedEvents = (events as TripEvent[] | null) ?? [];
  const typedTodos = (todos as Todo[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{typedTrip.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {typedTrip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(typedTrip.start_date + "T00:00:00"), "MMM d")} -{" "}
              {format(
                new Date(typedTrip.end_date + "T00:00:00"),
                "MMM d, yyyy"
              )}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trips/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <DeleteTripButton tripId={id} eventCount={typedEvents.length} todoCount={typedTodos.length} />
        </div>
      </div>

      <Separator />

      <Tabs defaultValue="itinerary">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="todos">
              Prep List ({typedTodos.length})
            </TabsTrigger>
          </TabsList>
          <EventFormDialog tripId={id} />
        </div>

        <TabsContent value="itinerary" className="mt-6">
          <EventList events={typedEvents} />
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
