import Link from "next/link";
import { Plane } from "lucide-react";

// Auth UI (user email, sign-out) is deferred. Re-add when auth is enabled.

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Plane className="h-5 w-5" />
          Travel Itinerary
        </Link>
      </div>
    </header>
  );
}
