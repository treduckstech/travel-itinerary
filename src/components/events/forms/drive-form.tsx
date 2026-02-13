"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { PlaceSearch } from "@/components/events/place-search";
import { FormSection } from "../form-section";
import type { EventFormState } from "../use-event-form";

interface DriveFormProps {
  form: EventFormState;
}

export function DriveForm({ form }: DriveFormProps) {
  return (
    <>
      <FormSection title="Route">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Origin</Label>
            <PlaceSearch
              id="drive-from"
              value={form.driveFrom}
              onSelect={form.handleDriveOriginSelect}
              onManualEntry={form.handleDriveOriginManual}
              placeholder="Search origin..."
            />
          </div>
          <div className="space-y-2">
            <Label>Destination</Label>
            <PlaceSearch
              id="drive-to"
              value={form.driveTo}
              onSelect={form.handleDriveDestSelect}
              onManualEntry={form.handleDriveDestManual}
              placeholder="Search destination..."
            />
          </div>
        </div>

        {(form.driveLoading || form.driveDuration != null) && (
          <div className="bg-muted/50 rounded-lg p-3">
            {form.driveLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Calculating drive time...
              </p>
            ) : form.driveDuration != null ? (
              <p className="text-sm font-medium">
                Drive time: {Math.floor(form.driveDuration / 60)}h {form.driveDuration % 60}m
              </p>
            ) : null}
          </div>
        )}
      </FormSection>

      <FormSection title="Schedule">
        <div className="space-y-2">
          <Label htmlFor="drive-departure">Departure</Label>
          <Input
            id="drive-departure"
            type="datetime-local"
            value={form.startDatetime}
            onChange={(e) => form.handleDepartureChange(e.target.value)}
            required
          />
        </div>

        {form.endDatetime && (
          <p className="text-sm text-muted-foreground">
            Arrival: {new Date(form.endDatetime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="drive-notes"
          placeholder="Stops, reminders..."
          value={form.notes}
          onChange={(e) => form.setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
        />
      </FormSection>
    </>
  );
}
