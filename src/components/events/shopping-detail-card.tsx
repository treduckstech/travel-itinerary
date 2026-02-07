"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, MapPin, Plus, Trash2, Tag, Store } from "lucide-react";
import { PlaceSearch } from "@/components/events/place-search";
import { extractCityFromAddress } from "@/lib/address";
import type { TripEvent, ShoppingStore, PlaceResult } from "@/lib/types";

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
        <div className="space-y-2.5">
          {stores.map((store) => (
            <div
              key={store.id}
              className="rounded-md border border-border/50 bg-muted/20 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="font-semibold text-sm leading-tight truncate">{store.name}</p>
                  </div>
                  <div className="ml-5.5 mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                    {store.category && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" />
                        {store.category}
                      </span>
                    )}
                    {store.address && (
                      <span className="truncate">{store.address}</span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1 pt-0.5">
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
