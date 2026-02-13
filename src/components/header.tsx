import Link from "next/link";
import { headers } from "next/headers";
import { ChevronRight, Plane } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { UserNav } from "@/components/user-nav";

// Match UUID pattern for trip pages
const TRIP_PAGE_RE = /^\/trips\/([0-9a-f-]{36})/;

export async function Header() {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  if (pathname.startsWith("/admin")) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch trip name for breadcrumbs
  let tripName: string | null = null;
  const tripMatch = pathname.match(TRIP_PAGE_RE);
  if (tripMatch) {
    const { data } = await supabase
      .from("trips")
      .select("name")
      .eq("id", tripMatch[1])
      .maybeSingle();
    tripName = data?.name ?? null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 items-center justify-between max-w-5xl px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Plane className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-lg hidden sm:inline">Travel Itinerary</span>
            <span className="font-display text-lg sm:hidden">Trips</span>
          </Link>
          {tripName && (
            <nav className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="max-w-[200px] truncate">{tripName}</span>
            </nav>
          )}
        </div>
        {user && (
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserNav
              email={user.email ?? ""}
              isAdmin={isAdmin(user.email)}
            />
          </div>
        )}
      </div>
    </header>
  );
}
