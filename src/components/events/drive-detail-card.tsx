"use client";

import { Car, Clock, ExternalLink, MapPin } from "lucide-react";
import type { TripEvent } from "@/lib/types";

function parseAddresses(description: string | null): { origin: string; destination: string } | null {
  if (!description?.includes("|||")) return null;
  const [origin, destination] = description.split("|||");
  if (!origin?.trim() || !destination?.trim()) return null;
  return { origin: origin.trim(), destination: destination.trim() };
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

export function DriveDetailCard({ event }: { event: TripEvent }) {
  const addresses = parseAddresses(event.description);
  const duration = event.end_datetime
    ? formatDuration(event.start_datetime, event.end_datetime)
    : null;

  const directionsUrl = addresses
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(addresses.origin)}&destination=${encodeURIComponent(addresses.destination)}`
    : null;

  const mapUrl = addresses
    ? `/api/maps/static?origin=${encodeURIComponent(addresses.origin)}&destination=${encodeURIComponent(addresses.destination)}`
    : null;

  if (!addresses && !duration) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {mapUrl && (
        <div className="overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt="Route map"
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {duration && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration} drive
          </span>
        )}

        {addresses && (
          <>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-green-600" />
              <span className="truncate max-w-[200px]">{addresses.origin}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-red-600" />
              <span className="truncate max-w-[200px]">{addresses.destination}</span>
            </span>
          </>
        )}
      </div>

      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Car className="h-3.5 w-3.5" />
          Open in Google Maps
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
