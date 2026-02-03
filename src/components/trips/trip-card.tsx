import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, Calendar } from "lucide-react";
import type { Trip } from "@/lib/types";

interface TripCardProps {
  trip: Trip;
  featured?: boolean;
}

export function TripCard({ trip, featured = false }: TripCardProps) {
  const now = new Date();
  const start = new Date(trip.start_date + "T00:00:00");
  const end = new Date(trip.end_date + "T00:00:00");

  let status: "upcoming" | "active" | "past";
  if (now < start) status = "upcoming";
  else if (now > end) status = "past";
  else status = "active";

  const daysUntil = differenceInDays(start, now);
  const daysLeft = differenceInDays(end, now);

  function getCountdown() {
    if (status === "active") {
      return daysLeft === 0 ? "Last day!" : `${daysLeft}d left`;
    }
    if (status === "upcoming") {
      if (daysUntil === 0) return "Today!";
      if (daysUntil === 1) return "Tomorrow!";
      if (daysUntil <= 14) return `${daysUntil}d away`;
    }
    return null;
  }

  const countdown = getCountdown();

  const borderColor =
    status === "active"
      ? "border-l-event-activity"
      : status === "upcoming"
      ? "border-l-primary"
      : "border-l-transparent";

  return (
    <Link href={`/trips/${trip.id}`} className={featured ? "sm:col-span-2 lg:col-span-2" : ""}>
      <Card className={`border-l-4 ${borderColor} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        featured ? "shadow-sm" : ""
      } ${status === "past" ? "opacity-75" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className={`truncate font-display ${featured ? "text-2xl" : "text-lg"}`}>
              {trip.name}
            </CardTitle>
            {countdown && (
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === "active"
                  ? "bg-event-activity-bg text-event-activity"
                  : "bg-warm/10 text-warm"
              }`}>
                {countdown}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground/70">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{trip.destination}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {format(start, "MMM d")} – {format(end, "MMM d, yyyy")}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
