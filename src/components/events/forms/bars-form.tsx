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

interface BarsFormProps {
  form: EventFormState;
}

export function BarsForm({ form }: BarsFormProps) {
  const detectedCity = form.barVenue?.address
    ? extractCityFromAddress(form.barVenue.address)
    : null;

  // Edit mode: just show the city title
  if (form.isEditing) {
    return (
      <FormSection title="Bars">
        <div className="space-y-2">
          <Label htmlFor="bars-city">City</Label>
          <Input
            id="bars-city"
            placeholder="London"
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
        Search for a bar and it will be automatically grouped by city.
      </DialogDescription>

      <FormSection title="Venue">
        <div className="space-y-2">
          <Label htmlFor="bar-venue">Venue</Label>
          <PlaceSearch
            id="bar-venue"
            value={form.barVenue?.name ?? ""}
            onSelect={(place: PlaceResult) => form.setBarVenue(place)}
            onManualEntry={(name: string) => form.setBarVenue({ id: "", name, address: "" })}
            placeholder="Search for a bar..."
          />
          {detectedCity && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">City:</span>
              <Badge variant="secondary">{detectedCity}</Badge>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bar-note">Note (optional)</Label>
          <Input
            id="bar-note"
            placeholder="Cocktails, Wine bar, Pub..."
            value={form.barNote}
            onChange={(e) => form.setBarNote(e.target.value)}
            maxLength={50}
          />
        </div>
      </FormSection>
    </>
  );
}
