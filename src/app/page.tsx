export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import { Plus } from "lucide-react";
import type { Trip } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user.id)
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
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <p className="mb-4 text-muted-foreground">
            No trips yet. Plan your first adventure!
          </p>
          <Link href="/trips/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Trip
            </Button>
          </Link>
        </div>
      )}

      {upcomingTrips.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Upcoming Trips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
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
