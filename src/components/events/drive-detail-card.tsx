"use client";

import { useState, useEffect } from "react";
import { Car, Clock, ExternalLink, Loader2, MapPin } from "lucide-react";
import type { TripEvent } from "@/lib/types";

function parseAddresses(
  description: string | null,
  location: string | null
): { origin: string; destination: string } | null {
  if (description?.includes("|||")) {
    const [origin, destination] = description.split("|||");
    if (origin?.trim() && destination?.trim()) {
      return { origin: origin.trim(), destination: destination.trim() };
    }
  }
  // Fallback: parse "Origin → Destination" from location field
  if (location?.includes("→")) {
    const [origin, destination] = location.split("→").map((s) => s.trim());
    if (origin && destination) {
      return { origin, destination };
    }
  }
  return null;
}

function formatMinutes(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function DriveDetailCard({ event }: { event: TripEvent }) {
  const [mapError, setMapError] = useState(false);
  const [driveMinutes, setDriveMinutes] = useState<number | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const addresses = parseAddresses(event.description, event.location);

  // Fetch actual drive time from Google Maps Distance Matrix API
  useEffect(() => {
    if (!addresses) return;
    let cancelled = false;
    setDriveLoading(true);
    fetch(
      `/api/places/distance?origin=${encodeURIComponent(addresses.origin)}&destination=${encodeURIComponent(addresses.destination)}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.duration_minutes) {
          setDriveMinutes(data.duration_minutes);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setDriveLoading(false);
      });
    return () => { cancelled = true; };
  }, [addresses?.origin, addresses?.destination]); // eslint-disable-line react-hooks/exhaustive-deps

  const duration = driveMinutes != null
    ? formatMinutes(driveMinutes)
    : null;

  const directionsUrl = addresses
    ? `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${encodeURIComponent(addresses.origin)}&destination=${encodeURIComponent(addresses.destination)}`
    : null;

  const mapUrl = addresses
    ? `/api/maps/static?origin=${encodeURIComponent(addresses.origin)}&destination=${encodeURIComponent(addresses.destination)}`
    : null;

  if (!addresses && !duration) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {mapUrl && !mapError && (
        <div className="overflow-hidden rounded-md max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt="Route map"
            className="w-full h-auto"
            loading="lazy"
            onError={() => setMapError(true)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {driveLoading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Calculating...
          </span>
        ) : duration ? (
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {duration} drive
          </span>
        ) : null}

        {addresses && (
          <>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-green-600" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{addresses.origin}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-red-600" />
              <span className="truncate max-w-[150px] sm:max-w-[200px]">{addresses.destination}</span>
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
