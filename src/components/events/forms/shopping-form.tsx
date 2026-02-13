"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlaceSearch } from "@/components/events/place-search";
import { DialogDescription } from "@/components/ui/dialog";
import { FormSection } from "../form-section";
import { extractCityFromAddress } from "@/lib/address";
import type { EventFormState } from "../use-event-form";
import type { PlaceResult } from "@/lib/types";

interface ShoppingFormProps {
  form: EventFormState;
}

export function ShoppingForm({ form }: ShoppingFormProps) {
  const detectedCity = form.shoppingStore?.address
    ? extractCityFromAddress(form.shoppingStore.address)
    : null;

  // Edit mode: just show the city title
  if (form.isEditing) {
    return (
      <FormSection title="Shopping">
        <div className="space-y-2">
          <Label htmlFor="shopping-city">City</Label>
          <Input
            id="shopping-city"
            placeholder="Florence"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            maxLength={100}
          />
        </div>
      </FormSection>
    );
  }

  return (
    <>
      <DialogDescription className="text-sm text-muted-foreground">
        Search for a store and it will be automatically grouped by city.
      </DialogDescription>

      <FormSection title="Store">
        <div className="space-y-2">
          <Label htmlFor="shopping-store">Store</Label>
          <PlaceSearch
            id="shopping-store"
            value={form.shoppingStore?.name ?? ""}
            onSelect={(place: PlaceResult) => form.setShoppingStore(place)}
            onManualEntry={(name: string) => form.setShoppingStore({ id: "", name, address: "" })}
            placeholder="Search for a store..."
          />
          {detectedCity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">City:</span>
              <Badge variant="secondary">{detectedCity}</Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="shopping-category">Category (optional)</Label>
          <Input
            id="shopping-category"
            placeholder="Fashion, Souvenirs, Gifts..."
            value={form.shoppingCategory}
            onChange={(e) => form.setShoppingCategory(e.target.value)}
            maxLength={50}
          />
        </div>
      </FormSection>
    </>
  );
}
