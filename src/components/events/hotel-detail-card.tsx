"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Hash } from "lucide-react";
import type { TripEvent } from "@/lib/types";

function parseLatLng(description: string | null): { lat: string; lng: string } | null {
  if (!description) return null;
  const match = description.match(/query=([-\d.]+),([-\d.]+)/);
  if (!match) return null;
  return { lat: match[1], lng: match[2] };
}

export function HotelDetailCard({ event }: { event: TripEvent }) {
  const [mapError, setMapError] = useState(false);
  const latLng = parseLatLng(event.description);
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const mapUrl = latLng
    ? `/api/maps/static?lat=${latLng.lat}&lng=${latLng.lng}&zoom=15`
    : null;

  const hasContent = mapUrl || event.location || event.confirmation_number || googleMapsUrl;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {mapUrl && !mapError && (
        <div className="overflow-hidden rounded-md max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt="Hotel location"
            className="w-full h-auto"
            loading="lazy"
            onError={() => setMapError(true)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {event.location && (
          <span className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </span>
        )}

        {event.confirmation_number && (
          <span className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            {event.confirmation_number}
          </span>
        )}
      </div>

      {googleMapsUrl && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" />
            Google Maps
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
