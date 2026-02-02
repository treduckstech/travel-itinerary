export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { Plus, Calendar, ListChecks, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true });

  const now = new Date().toISOString().split("T")[0];
  const upcomingTrips = (trips as Trip[] | null)?.filter(
    (t) => t.end_date >= now
  ) ?? [];
  const pastTrips = (trips as Trip[] | null)?.filter(
    (t) => t.end_date < now
  ) ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Trips</h1>
        <Link href="/trips/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>

      {upcomingTrips.length === 0 && pastTrips.length === 0 && (
        <div className="space-y-8">
          <div className="flex flex-col items-center justify-center rounded-xl bg-accent/50 px-6 py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Plan your next adventure</h2>
            <p className="mb-6 max-w-md text-muted-foreground">
              Create a trip to start organizing your flights, hotels, activities, and packing list -- all in one place.
            </p>
            <Link href="/trips/new">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Trip
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2 rounded-lg border p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-event-flight-bg">
                <Calendar className="h-4.5 w-4.5 text-event-flight" />
              </div>
              <h3 className="font-medium">Day-by-day itinerary</h3>
              <p className="text-sm text-muted-foreground">
                Add flights, hotels, restaurants, and activities -- see them organized by date.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-event-hotel-bg">
                <Calendar className="h-4.5 w-4.5 text-event-hotel" />
              </div>
              <h3 className="font-medium">Calendar overview</h3>
              <p className="text-sm text-muted-foreground">
                See your whole trip at a glance with an interactive calendar view.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-event-activity-bg">
                <ListChecks className="h-4.5 w-4.5 text-event-activity" />
              </div>
              <h3 className="font-medium">Prep checklist</h3>
              <p className="text-sm text-muted-foreground">
                Track what you need to do before you go -- visas, packing, bookings.
              </p>
            </div>
          </div>
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Upcoming Trips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} featured={i === 0 && upcomingTrips.length > 1} />
            ))}
          </div>
        </section>
      )}

      {pastTrips.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
            Past Trips
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
