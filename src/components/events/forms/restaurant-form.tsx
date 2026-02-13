"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { RestaurantSearch } from "@/components/events/restaurant-search";
import { FormSection } from "../form-section";
import type { EventFormState } from "../use-event-form";

interface RestaurantFormProps {
  form: EventFormState;
}

export function RestaurantForm({ form }: RestaurantFormProps) {
  return (
    <>
      <FormSection title="Restaurant">
        <div className="space-y-2">
          <Label htmlFor="restaurant-name">Restaurant</Label>
          <RestaurantSearch
            id="restaurant-name"
            value={form.title}
            onSelect={form.handleRestaurantSelect}
            onManualEntry={(name) => form.setTitle(name)}
            placeholder="Search restaurants..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurant-location">Location</Label>
          <Input
            id="restaurant-location"
            placeholder="123 Main St"
            value={form.location}
            onChange={(e) => form.setLocation(e.target.value)}
            maxLength={200}
          />
          {form.description && form.description.startsWith("https://www.google.com/maps") && (
            <a
              href={form.description}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MapPin className="h-3 w-3" />
              View on Google Maps
            </a>
          )}
        </div>
      </FormSection>

      <FormSection title="Schedule">
        <div className="space-y-2">
          <Label htmlFor="restaurant-time">Reservation Time</Label>
          <Input
            id="restaurant-time"
            type="datetime-local"
            value={form.startDatetime}
            onChange={(e) => form.handleDepartureChange(e.target.value)}
            required
          />
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="restaurant-notes"
          placeholder="Confirmation number, details, reminders..."
          value={form.notes}
          onChange={(e) => form.setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
        />
      </FormSection>
    </>
  );
}
