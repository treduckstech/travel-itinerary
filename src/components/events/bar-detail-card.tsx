"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, MapPin, Plus, Trash2, Wine, Pencil } from "lucide-react";
import { PlaceSearch } from "@/components/events/place-search";
import { DetailCardWrapper } from "./detail-card-wrapper";
import { extractCityFromAddress } from "@/lib/address";
import type { TripEvent, BarVenue, PlaceResult } from "@/lib/types";

interface BarDetailCardProps {
  event: TripEvent;
  venues: BarVenue[];
  readOnly?: boolean;
}

export function BarDetailCard({ event, venues, readOnly }: BarDetailCardProps) {
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const noteRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleStartEdit(venue: BarVenue) {
    setEditingVenueId(venue.id);
    setEditNote(venue.category ?? "");
    setTimeout(() => noteRef.current?.focus(), 0);
  }

  async function handleSaveNote(venueId: string) {
    const venue = venues.find((v) => v.id === venueId);
    if (!venue) return;

    const trimmedNote = editNote.trim();

    // Skip DB call if nothing changed
    if ((venue.category ?? "") === trimmedNote) {
      setEditingVenueId(null);
      return;
    }

    setEditingVenueId(null);

    const { error } = await supabase
      .from("bar_venues")
      .update({ category: trimmedNote || null })
      .eq("id", venueId);

    if (error) {
      toast.error("Failed to update note");
      return;
    }

    router.refresh();
  }

  function handleNoteKeyDown(e: React.KeyboardEvent, venueId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveNote(venueId);
    } else if (e.key === "Escape") {
      setEditingVenueId(null);
    }
  }

  async function handleAddVenue(place: PlaceResult) {
    const googleUrl = place.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name, place.address].filter(Boolean).join(", "))}`;

    const { error } = await supabase.from("bar_venues").insert({
      event_id: event.id,
      name: place.name,
      address: place.address || null,
      google_maps_url: googleUrl,
      category: category || null,
      sort_order: venues.length,
    });

    if (error) {
      toast.error("Failed to add venue");
      return;
    }

    // Auto-detect city from first venue's address and update event title
    if (place.address) {
      const city = extractCityFromAddress(place.address);
      if (city && (!event.title || event.title === "Bars")) {
        await supabase.from("events").update({ title: city }).eq("id", event.id);
      }
    }

    setAdding(false);
    setCategory("");
    toast.success("Venue added");
    router.refresh();
  }

  async function handleAddManual(name: string) {
    const { error } = await supabase.from("bar_venues").insert({
      event_id: event.id,
      name,
      category: category || null,
      sort_order: venues.length,
    });

    if (error) {
      toast.error("Failed to add venue");
      return;
    }

    setAdding(false);
    setCategory("");
    toast.success("Venue added");
    router.refresh();
  }

  async function handleDeleteVenue(venueId: string) {
    setDeleting(venueId);
    const { error } = await supabase.from("bar_venues").delete().eq("id", venueId);
    setDeleting(null);

    if (error) {
      toast.error("Failed to remove venue");
      return;
    }

    toast.success("Venue removed");
    router.refresh();
  }

  if (!venues.length && !event.notes && readOnly) return null;

  return (
    <DetailCardWrapper>
      {venues.length > 0 && (
        <div className="space-y-2">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="group flex items-center gap-2.5 py-1.5 text-sm"
            >
              <Wine className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-tight truncate">{venue.name}</p>
                {editingVenueId === venue.id ? (
                  <Input
                    ref={noteRef}
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    onBlur={() => handleSaveNote(venue.id)}
                    onKeyDown={(e) => handleNoteKeyDown(e, venue.id)}
                    placeholder="Add a note..."
                    maxLength={100}
                    className="mt-1 h-6 text-xs"
                  />
                ) : venue.category ? (
                  <p className="text-xs text-muted-foreground truncate">{venue.category}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {venue.google_maps_url && (
                  <a
                    href={venue.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                  >
                    <MapPin className="h-3 w-3" />
                    <span className="hidden sm:inline">Map</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleStartEdit(venue)}
                    className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleDeleteVenue(venue.id)}
                    disabled={deleting === venue.id}
                    className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!readOnly && (
        <>
          {adding ? (
            <div className="space-y-2">
              <div className="space-y-1.5">
                <Input
                  placeholder="Note (e.g. Cocktails, Wine bar)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={100}
                  className="h-8 text-sm"
                />
                <PlaceSearch
                  value=""
                  onSelect={handleAddVenue}
                  onManualEntry={handleAddManual}
                  placeholder="Search for a bar..."
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setAdding(false); setCategory(""); }}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdding(true)}
              className="text-xs"
            >
              <Plus className="mr-1 h-3 w-3" />
              Add Venue
            </Button>
          )}
        </>
      )}

      {event.notes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {event.notes}
        </p>
      )}
    </DetailCardWrapper>
  );
}
