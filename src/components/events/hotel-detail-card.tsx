"use client";

import { MapPin, Hash } from "lucide-react";
import { DetailCardWrapper, DetailActionLink, DetailMapImage } from "./detail-card-wrapper";
import type { TripEvent } from "@/lib/types";

export function HotelDetailCard({ event }: { event: TripEvent }) {
  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  const mapUrl = event.location
    ? `/api/maps/static?address=${encodeURIComponent(event.location)}&zoom=15`
    : null;

  const hasContent = mapUrl || event.confirmation_number || googleMapsUrl || event.notes;
  if (!hasContent) return null;

  return (
    <DetailCardWrapper>
      {mapUrl && (
        <DetailMapImage src={mapUrl} alt="Hotel location" />
      )}

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
        <DetailActionLink href={googleMapsUrl} icon={MapPin}>
          Google Maps
        </DetailActionLink>
      )}
    </DetailCardWrapper>
  );
}
