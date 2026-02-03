import Link from "next/link";
import { Plane } from "lucide-react";

// Auth UI (user email, sign-out) is deferred. Re-add when auth is enabled.

export function Header() {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-display text-lg">Travel Itinerary</span>
        </Link>
      </div>
    </header>
  );
}
