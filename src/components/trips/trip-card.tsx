import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      return daysLeft === 0 ? "Last day!" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
    }
    if (status === "upcoming") {
      if (daysUntil === 0) return "Starts today!";
      if (daysUntil === 1) return "Tomorrow!";
      if (daysUntil <= 14) return `${daysUntil} days away`;
    }
    return null;
  }

  const countdown = getCountdown();

  return (
    <Link href={`/trips/${trip.id}`} className={featured ? "sm:col-span-2 lg:col-span-2" : ""}>
      <Card className={`transition-colors hover:bg-accent/50 ${
        featured ? "border-primary/20 shadow-sm" : ""
      } ${status === "active" ? "border-event-activity/30" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className={featured ? "text-xl" : "text-lg"}>{trip.name}</CardTitle>
            <div className="flex items-center gap-2">
              {countdown && (
                <span className={`text-xs font-medium ${
                  status === "active" ? "text-event-activity" : "text-primary"
                }`}>
                  {countdown}
                </span>
              )}
              <Badge
                variant={status === "past" ? "outline" : "default"}
                className={
                  status === "active"
                    ? "bg-event-activity-bg text-event-activity border-event-activity/20"
                    : status === "upcoming"
                    ? "bg-primary text-primary-foreground"
                    : ""
                }
              >
                {status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" />
            {trip.destination}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
