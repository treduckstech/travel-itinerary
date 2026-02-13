"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin } from "lucide-react";
import { PlaceSearch } from "@/components/events/place-search";
import { FormSection } from "../form-section";
import { AttachmentField } from "./attachment-field";
import type { EventFormState } from "../use-event-form";

interface ActivityFormProps {
  form: EventFormState;
}

export function ActivityForm({ form }: ActivityFormProps) {
  return (
    <>
      <FormSection title="Activity">
        <div className="space-y-2">
          <Label htmlFor="activity-title">Activity</Label>
          <Input
            id="activity-title"
            placeholder="City Walking Tour"
            value={form.title}
            onChange={(e) => form.setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="activity-location">Location</Label>
          <PlaceSearch
            id="activity-location"
            value={form.location}
            onSelect={form.handleActivityPlaceSelect}
            onManualEntry={(name) => {
              form.setLocation(name);
              form.setDescription("");
            }}
            placeholder="Search places or addresses..."
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
          <Label htmlFor="activity-start">Start</Label>
          <Input
            id="activity-start"
            type="datetime-local"
            value={form.startDatetime}
            onChange={(e) => form.handleDepartureChange(e.target.value)}
            required
          />
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="activity-notes"
          placeholder="Confirmation number, details, reminders..."
          value={form.notes}
          onChange={(e) => form.setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
        />
      </FormSection>

      <FormSection title="Attachments" collapsible defaultOpen={form.attachments.length > 0 || form.pendingFiles.length > 0}>
        <AttachmentField
          attachments={form.attachments}
          pendingFiles={form.pendingFiles}
          maxAttachments={form.MAX_ATTACHMENTS}
          fileInputRef={form.fileInputRef}
          onFileSelect={form.handleFileSelect}
          onRemovePending={form.removePendingFile}
          onRemoveExisting={form.removeExistingAttachment}
          formatFileSize={form.formatFileSize}
        />
      </FormSection>
    </>
  );
}
