export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { Plus, MapPin } from "lucide-react";
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

  const hasTrips = upcomingTrips.length > 0 || pastTrips.length > 0;

  return (
    <div className="space-y-8">
      {hasTrips ? (
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Trips</h1>
          <Link href="/trips/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <MapPin className="mb-4 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Plan your next adventure</h2>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Organize flights, hotels, activities, and your packing list in one place.
          </p>
          <Link href="/trips/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
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
            Past
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
