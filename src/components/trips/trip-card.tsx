import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import type { Trip } from "@/lib/types";

export function TripCard({ trip }: { trip: Trip }) {
  const now = new Date();
  const start = new Date(trip.start_date + "T00:00:00");
  const end = new Date(trip.end_date + "T00:00:00");

  let status: "upcoming" | "active" | "past";
  if (now < start) status = "upcoming";
  else if (now > end) status = "past";
  else status = "active";

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="transition-colors hover:bg-accent/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{trip.name}</CardTitle>
            <Badge
              variant={
                status === "active"
                  ? "default"
                  : status === "upcoming"
                  ? "secondary"
                  : "outline"
              }
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {trip.destination}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(start, "MMM d")} - {format(end, "MMM d, yyyy")}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
