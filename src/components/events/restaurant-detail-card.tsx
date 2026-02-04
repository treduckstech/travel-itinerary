"use client";

import { ExternalLink, MapPin, Star, DollarSign, UtensilsCrossed } from "lucide-react";
import type { TripEvent } from "@/lib/types";

function parseLatLng(description: string | null): { lat: string; lng: string } | null {
  if (!description) return null;
  const match = description.match(/query=([-\d.]+),([-\d.]+)/);
  if (!match) return null;
  return { lat: match[1], lng: match[2] };
}

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
  const latLng = parseLatLng(event.description);
  const benEatsId = parseBenEatsId(event.confirmation_number);
  const meta = parseNotesMeta(event.notes);
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const mapUrl = latLng
    ? `/api/maps/static?lat=${latLng.lat}&lng=${latLng.lng}&zoom=15`
    : null;

  const hasContent = mapUrl || event.location || meta.cuisine || meta.price || meta.rating || benEatsId || googleMapsUrl;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {mapUrl && (
        <div className="overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapUrl}
            alt="Restaurant location"
            className="w-full h-auto"
            loading="lazy"
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
            href={`https://beneats.ai/restaurants/${benEatsId}`}
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
      </div>
    </div>
  );
}
