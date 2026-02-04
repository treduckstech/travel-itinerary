export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { Plus, MapPin } from "lucide-react";
import type { Trip } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: trips, error: tripsError } = await supabase
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
    <div className="space-y-10">
      {/* DEBUG: remove after verifying */}
      <pre className="rounded bg-muted p-3 text-xs overflow-auto">
        {JSON.stringify({ userId: user?.id, email: user?.email, tripCount: trips?.length, error: tripsError }, null, 2)}
      </pre>
      {hasTrips ? (
        <div className="flex items-end justify-between">
          <h1 className="font-display text-4xl">My Trips</h1>
          <Link href="/trips/new">
            <Button className="bg-warm text-warm-foreground hover:bg-warm/90">
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-3 font-display text-3xl">Where to next?</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Organize flights, hotels, activities, and your packing list in one place.
          </p>
          <Link href="/trips/new">
            <Button size="lg" className="bg-warm text-warm-foreground hover:bg-warm/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Trip
            </Button>
          </Link>
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <section>
          <h2 className="mb-5 font-display text-2xl">Upcoming</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.map((trip, i) => (
              <TripCard key={trip.id} trip={trip} featured={i === 0 && upcomingTrips.length > 1} />
            ))}
          </div>
        </section>
      )}

      {pastTrips.length > 0 && (
        <section>
          <h2 className="mb-5 font-display text-2xl text-muted-foreground">
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
