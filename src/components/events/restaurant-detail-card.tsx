"use client";

import { useState } from "react";
import { ExternalLink, MapPin, Star, DollarSign, UtensilsCrossed, CalendarPlus } from "lucide-react";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import type { TripEvent } from "@/lib/types";

function parseBenEatsId(confirmationNumber: string | null): string | null {
  if (!confirmationNumber?.startsWith("beneats:")) return null;
  return confirmationNumber.slice(8);
}

function parseNotesMeta(notes: string | null): { cuisine?: string; price?: string; rating?: string } {
  if (!notes) return {};
  const result: { cuisine?: string; price?: string; rating?: string } = {};
  for (const line of notes.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Cuisine: ")) result.cuisine = trimmed.slice(9);
    else if (trimmed.startsWith("Price: ")) result.price = trimmed.slice(7);
    else if (trimmed.startsWith("Rating: ")) result.rating = trimmed.slice(8);
  }
  return result;
}

export function RestaurantDetailCard({ event }: { event: TripEvent }) {
  const [mapError, setMapError] = useState(false);
  const benEatsId = parseBenEatsId(event.confirmation_number);
  const meta = parseNotesMeta(event.notes);
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const mapUrl = event.location
    ? `/api/maps/static?address=${encodeURIComponent(event.location)}&zoom=15`
    : null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {mapUrl && !mapError && (
        <div className="overflow-hidden rounded-md max-w-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt="Restaurant location"
            className="w-full h-auto"
            loading="lazy"
            onError={() => setMapError(true)}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
        {meta.cuisine && (
          <span className="flex items-center gap-1.5">
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {meta.cuisine}
          </span>
        )}

        {meta.price && (
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            {meta.price}
          </span>
        )}

        {meta.rating && (
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            {meta.rating}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {benEatsId && (
          <a
            href={`https://beneats.ai/restaurant/${benEatsId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View on BenEats
            <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {googleMapsUrl && (
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
        )}

        <a
          href={buildGoogleCalendarUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Add to Google Calendar
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
