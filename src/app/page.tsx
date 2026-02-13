export const dynamic = "force-dynamic";

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trips/trip-card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Plus, MapPin, ChevronDown } from "lucide-react";
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
    <div className="space-y-10">
      {hasTrips ? (
        <div className="flex items-end justify-between">
          <h1 className="font-display text-2xl">Trips</h1>
          <Link href="/trips/new">
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mb-3 font-display text-xl">Where to next?</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            Organize flights, hotels, activities, and your packing list in one place.
          </p>
          <Link href="/trips/new">
            <Button variant="outline" size="sm">
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
            {upcomingTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </section>
      )}

      {pastTrips.length > 0 && (
        <Collapsible defaultOpen={pastTrips.length <= 6} asChild>
          <section>
            <CollapsibleTrigger className="group mb-5 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
              <span className="font-display text-2xl">Past ({pastTrips.length})</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pastTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} />
                ))}
              </div>
            </CollapsibleContent>
          </section>
        </Collapsible>
      )}
    </div>
  );
}
