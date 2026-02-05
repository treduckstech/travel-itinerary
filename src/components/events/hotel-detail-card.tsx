"use client";

import { ExternalLink, MapPin, Hash } from "lucide-react";
import type { TripEvent } from "@/lib/types";

export function HotelDetailCard({ event }: { event: TripEvent }) {
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const hasContent = event.confirmation_number || googleMapsUrl || event.notes;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {event.confirmation_number && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Hash className="h-3.5 w-3.5" />
            {event.confirmation_number}
          </span>
        </div>
      )}

      {event.notes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {event.notes}
        </p>
      )}

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
