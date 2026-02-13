"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { HotelSearch } from "@/components/events/hotel-search";
import { FormSection } from "../form-section";
import type { EventFormState } from "../use-event-form";

interface HotelFormProps {
  form: EventFormState;
}

export function HotelForm({ form }: HotelFormProps) {
  return (
    <>
      <FormSection title="Hotel">
        <div className="space-y-2">
          <Label htmlFor="hotel-name">Hotel Name</Label>
          <HotelSearch
            id="hotel-name"
            value={form.title}
            onSelect={form.handleHotelSelect}
            onManualEntry={(name) => form.setTitle(name)}
            placeholder="Search hotels..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hotel-location">Location</Label>
          <Input
            id="hotel-location"
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

      <FormSection title="Dates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hotel-checkin">Check-in</Label>
            <Input
              id="hotel-checkin"
              type="date"
              value={form.startDatetime.slice(0, 10)}
              onChange={(e) => form.handleDepartureChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hotel-checkout">Check-out</Label>
            <Input
              id="hotel-checkout"
              type="date"
              value={form.endDatetime.slice(0, 10)}
              onChange={(e) => form.setEndDatetime(e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="hotel-notes"
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
