"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, MapPin, Plus, Trash2, Tag, Store, Pencil } from "lucide-react";
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
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  function handleStartEdit(store: ShoppingStore) {
    setEditingStoreId(store.id);
    setEditName(store.name);
    setEditCategory(store.category ?? "");
    setTimeout(() => nameRef.current?.focus(), 0);
  }

  async function handleSaveStore(storeId: string) {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setEditingStoreId(null);
      return;
    }

    const store = stores.find((s) => s.id === storeId);
    if (!store) return;

    const trimmedCategory = editCategory.trim();

    // Skip DB call if nothing changed
    if (store.name === trimmedName && (store.category ?? "") === trimmedCategory) {
      setEditingStoreId(null);
      return;
    }

    setEditingStoreId(null);

    const { error } = await supabase
      .from("shopping_stores")
      .update({ name: trimmedName, category: trimmedCategory || null })
      .eq("id", storeId);

    if (error) {
      toast.error("Failed to update store");
      return;
    }

    router.refresh();
  }

  function handleEditKeyDown(e: React.KeyboardEvent, storeId: string) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveStore(storeId);
    } else if (e.key === "Escape") {
      setEditingStoreId(null);
    }
  }

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

  if (!stores.length && !event.notes && readOnly) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
      {stores.length > 0 && (
        <div className="space-y-2">
          {stores.map((store) => (
            <div
              key={store.id}
              className="group flex items-center gap-2.5 py-1.5 text-sm"
            >
              <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                {editingStoreId === store.id ? (
                  <div className="space-y-1">
                    <Input
                      ref={nameRef}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleSaveStore(store.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, store.id)}
                      maxLength={200}
                      className="h-7 text-sm"
                    />
                    <Input
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      onBlur={() => handleSaveStore(store.id)}
                      onKeyDown={(e) => handleEditKeyDown(e, store.id)}
                      placeholder="Category (optional)"
                      maxLength={50}
                      className="h-7 text-xs"
                    />
                  </div>
                ) : (
                  <>
                    <p className="font-medium leading-tight truncate">{store.name}</p>
                    {store.category && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Tag className="h-2.5 w-2.5" />
                        {store.category}
                      </span>
                    )}
                  </>
                )}
              </div>
              {editingStoreId !== store.id && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {store.google_maps_url && (
                    <a
                      href={store.google_maps_url}
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
                      onClick={() => handleStartEdit(store)}
                      className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
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
              )}
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
    </div>
  );
}
