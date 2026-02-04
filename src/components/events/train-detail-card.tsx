"use client";

import { TrainFront, Clock, Ticket, Armchair } from "lucide-react";
import { stations } from "@/data/stations";
import type { TripEvent } from "@/lib/types";

function resolveStation(code: string): { name: string; city: string } | null {
  const station = stations.find((s) => s.code === code);
  if (station) return { name: station.name, city: station.city };
  return null;
}

function parseTrainDescription(description: string | null): {
  operator: string;
  trainClass: string;
  coach: string;
  seat: string;
} | null {
  if (!description?.includes("|||")) return null;
  const [operator, trainClass, coach, seat] = description.split("|||");
  if (!operator && !trainClass && !coach && !seat) return null;
  return {
    operator: operator || "",
    trainClass: trainClass || "",
    coach: coach || "",
    seat: seat || "",
  };
}

function parseRoute(location: string | null): {
  depCode: string;
  arrCode: string;
  depStation: ReturnType<typeof resolveStation>;
  arrStation: ReturnType<typeof resolveStation>;
} | null {
  if (!location?.includes("→")) return null;
  const [dep, arr] = location.split("→").map((s) => s.trim());
  if (!dep || !arr) return null;
  return {
    depCode: dep,
    arrCode: arr,
    depStation: resolveStation(dep),
    arrStation: resolveStation(arr),
  };
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms <= 0) return "";
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function TrainDetailCard({ event }: { event: TripEvent }) {
  const route = parseRoute(event.location);
  const details = parseTrainDescription(event.description);
  const duration = event.end_datetime
    ? formatDuration(event.start_datetime, event.end_datetime)
    : null;

  const hasDetails = details && (details.operator || details.trainClass || details.coach || details.seat);

  if (!route && !hasDetails && !event.confirmation_number && !event.notes) {
    return null;
  }

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {route && (
        <div className="flex items-center gap-3 text-sm">
          <div className="text-right min-w-0 flex-1">
            <p className="font-medium truncate">
              {route.depStation?.city || route.depCode}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {route.depStation?.name || route.depCode}
            </p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <div className="h-px w-6 bg-border" />
              <TrainFront className="h-3.5 w-3.5" />
              <div className="h-px w-6 bg-border" />
            </div>
            {duration && (
              <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {duration}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">
              {route.arrStation?.city || route.arrCode}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {route.arrStation?.name || route.arrCode}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {details?.operator && (
          <span className="flex items-center gap-1.5">
            <TrainFront className="h-3.5 w-3.5" />
            {details.operator}
          </span>
        )}
        {details?.trainClass && (
          <span className="flex items-center gap-1.5">
            <Ticket className="h-3.5 w-3.5" />
            {details.trainClass}
          </span>
        )}
        {(details?.coach || details?.seat) && (
          <span className="flex items-center gap-1.5">
            <Armchair className="h-3.5 w-3.5" />
            {[
              details.coach && `Coach ${details.coach}`,
              details.seat && `Seat ${details.seat}`,
            ]
              .filter(Boolean)
              .join(", ")}
          </span>
        )}
      </div>

      {event.confirmation_number && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Confirmation:</span>{" "}
          {event.confirmation_number}
        </p>
      )}

      {event.notes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {event.notes}
        </p>
      )}
    </div>
  );
}
