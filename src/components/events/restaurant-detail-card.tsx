"use client";

import { MapPin, UtensilsCrossed, DollarSign, Star, CalendarPlus } from "lucide-react";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { DetailCardWrapper, DetailActionLink, DetailMapImage } from "./detail-card-wrapper";
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
  const benEatsId = parseBenEatsId(event.confirmation_number);
  const meta = parseNotesMeta(event.notes);
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const mapUrl = event.location
    ? `/api/maps/static?address=${encodeURIComponent(event.location)}&zoom=15`
    : null;

  return (
    <DetailCardWrapper>
      {mapUrl && (
        <DetailMapImage src={mapUrl} alt="Restaurant location" />
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

      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        {benEatsId && (
          <DetailActionLink href={`https://beneats.ai/restaurant/${benEatsId}`}>
            View on BenEats
          </DetailActionLink>
        )}

        {googleMapsUrl && (
          <DetailActionLink href={googleMapsUrl} icon={MapPin}>
            Google Maps
          </DetailActionLink>
        )}

        <DetailActionLink href={buildGoogleCalendarUrl(event)} icon={CalendarPlus}>
          Add to Google Calendar
        </DetailActionLink>
      </div>
    </DetailCardWrapper>
  );
}
