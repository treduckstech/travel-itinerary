"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StationCombobox } from "@/components/events/station-combobox";
import { FormSection } from "../form-section";
import type { EventFormState } from "../use-event-form";

interface FerryFormProps {
  form: EventFormState;
}

export function FerryForm({ form }: FerryFormProps) {
  return (
    <>
      <FormSection title="Ferry Details">
        <div className="space-y-2">
          <Label htmlFor="ferry-title">Ferry / Route</Label>
          <Input
            id="ferry-title"
            placeholder="Blue Star Ferries"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <StationCombobox
              value={form.depStation}
              onSelect={form.handleDepStationSelect}
              placeholder="Departure"
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <StationCombobox
              value={form.arrStation}
              onSelect={form.handleArrStationSelect}
              placeholder="Arrival"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Schedule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ferry-departure">Departure</Label>
            <Input
              id="ferry-departure"
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => form.handleDepartureChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ferry-arrival">Arrival</Label>
            <Input
              id="ferry-arrival"
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => form.setEndDatetime(e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="ferry-notes"
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
