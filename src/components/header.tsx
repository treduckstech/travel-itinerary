import Link from "next/link";
import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

// Auth UI (user email, sign-out) is deferred. Re-add when auth is enabled.

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5 text-primary" />
          Travel Itinerary
        </Link>
        <Link href="/trips/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Trip
          </Button>
        </Link>
      </div>
    </header>
  );
}
