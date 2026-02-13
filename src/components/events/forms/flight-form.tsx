"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { AirportCombobox } from "@/components/events/airport-combobox";
import { FormSection } from "../form-section";
import type { EventFormState } from "../use-event-form";

interface FlightFormProps {
  form: EventFormState;
}

export function FlightForm({ form }: FlightFormProps) {
  return (
    <>
      <FormSection title="Flight Details">
        <div className="space-y-2">
          <Label htmlFor="flight-number">Flight #</Label>
          <div className="flex gap-2">
            <Input
              id="flight-number"
              placeholder="UA123"
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              required
              maxLength={100}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={form.handleFlightLookup}
              disabled={form.lookupLoading || !form.title.trim()}
              className="shrink-0"
            >
              {form.lookupLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Look up
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flight-date">Departure Date (for lookup)</Label>
          <Input
            id="flight-date"
            type="date"
            value={form.flightDate}
            onChange={(e) => form.setFlightDate(e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection title="Route">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>From</Label>
            <AirportCombobox
              value={form.depAirport}
              onSelect={form.handleDepAirportSelect}
              placeholder="Departure"
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <AirportCombobox
              value={form.arrAirport}
              onSelect={form.handleArrAirportSelect}
              placeholder="Arrival"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Schedule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="flight-departure">Departure</Label>
            <Input
              id="flight-departure"
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => form.handleDepartureChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flight-arrival">Arrival</Label>
            <Input
              id="flight-arrival"
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => form.setEndDatetime(e.target.value)}
            />
            {form.flightDuration && (
              <p className="text-xs text-muted-foreground">
                Auto-calculated from {Math.floor(form.flightDuration / 60)}h {form.flightDuration % 60}m flight
              </p>
            )}
          </div>
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="flight-notes"
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
