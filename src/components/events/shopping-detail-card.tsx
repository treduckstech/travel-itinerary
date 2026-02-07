"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, MapPin, Plus, Trash2, Tag, Store } from "lucide-react";
import { PlaceSearch } from "@/components/events/place-search";
import type { TripEvent, ShoppingStore, PlaceResult } from "@/lib/types";

// Extract city from Google formatted_address
// Examples: "Via Roma, 50123 Firenze FI, Italy" → "Firenze"
//           "151 W 34th St, New York, NY 10001, USA" → "New York"
//           "87 Brompton Rd, London SW1X 7XL, United Kingdom" → "London"
function extractCityFromAddress(address: string): string | null {
  const parts = address.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length < 3) return null;

  const secondLast = parts[parts.length - 2];

  // US: "NY 10001" or "CA 90210"
  if (/^[A-Z]{2}\s+\d{5}/.test(secondLast)) {
    return parts[parts.length - 3] || null;
  }

  // European: "50123 Firenze FI" or "75001 Paris"
  const stripped = secondLast.replace(/^\d{4,6}\s*/, "").replace(/\s+[A-Z]{2}$/, "").trim();
  if (stripped && stripped !== secondLast) {
    return stripped;
  }

  // UK: "London SW1X 7XL"
  const ukMatch = secondLast.match(/^(.+?)\s+[A-Z]{1,2}\d/);
  if (ukMatch) {
    return ukMatch[1].trim();
  }

  // Default: use 2nd-to-last if it doesn't look like a postal code
  if (!/^\d+$/.test(secondLast)) {
    return secondLast;
  }

  return parts[parts.length - 3] || null;
}

interface ShoppingDetailCardProps {
  event: TripEvent;
  stores: ShoppingStore[];
  readOnly?: boolean;
}

export function ShoppingDetailCard({ event, stores, readOnly }: ShoppingDetailCardProps) {
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const googleMapsUrl = event.description?.startsWith("https://www.google.com/maps") ? event.description : null;

  async function handleAddStore(place: PlaceResult) {
    const googleUrl = place.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([place.name, place.address].filter(Boolean).join(", "))}`;

    const { error } = await supabase.from("shopping_stores").insert({
      event_id: event.id,
      name: place.name,
      address: place.address || null,
      google_maps_url: googleUrl,
      category: category || null,
      sort_order: stores.length,
    });

    if (error) {
      toast.error("Failed to add store");
      return;
    }

    // Auto-detect city from first store's address and update event title
    if (place.address) {
      const city = extractCityFromAddress(place.address);
      if (city && (!event.title || event.title === "Shopping")) {
        await supabase.from("events").update({ title: city }).eq("id", event.id);
      }
    }

    setAdding(false);
    setCategory("");
    toast.success("Store added");
    router.refresh();
  }

  async function handleAddManual(name: string) {
    const { error } = await supabase.from("shopping_stores").insert({
      event_id: event.id,
      name,
      category: category || null,
      sort_order: stores.length,
    });

    if (error) {
      toast.error("Failed to add store");
      return;
    }

    setAdding(false);
    setCategory("");
    toast.success("Store added");
    router.refresh();
  }

  async function handleDeleteStore(storeId: string) {
    setDeleting(storeId);
    const { error } = await supabase.from("shopping_stores").delete().eq("id", storeId);
    setDeleting(null);

    if (error) {
      toast.error("Failed to remove store");
      return;
    }

    toast.success("Store removed");
    router.refresh();
  }

  const hasContent = stores.length > 0 || event.notes || googleMapsUrl || !readOnly;
  if (!hasContent) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
      {stores.length > 0 && (
        <div className="space-y-2">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex items-center gap-2 rounded-md border border-border/50 bg-muted/20 px-3 py-2 text-sm"
            >
              <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <span className="font-medium">{store.name}</span>
                {store.category && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Tag className="h-2.5 w-2.5" />
                    {store.category}
                  </span>
                )}
                {store.address && (
                  <p className="text-xs text-muted-foreground truncate">{store.address}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {store.google_maps_url && (
                  <a
                    href={store.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </a>
                )}
                {!readOnly && (
                  <button
                    onClick={() => handleDeleteStore(store.id)}
                    disabled={deleting === store.id}
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
                  placeholder="Category (e.g. Fashion, Souvenirs)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  maxLength={50}
                  className="h-8 text-sm"
                />
                <PlaceSearch
                  value=""
                  onSelect={handleAddStore}
                  onManualEntry={handleAddManual}
                  placeholder="Search for a store..."
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
              Add Store
            </Button>
          )}
        </>
      )}

      {event.notes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {event.notes}
        </p>
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
  );
}
