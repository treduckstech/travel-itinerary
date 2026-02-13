"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StationCombobox } from "@/components/events/station-combobox";
import { FormSection } from "../form-section";
import { AttachmentField } from "./attachment-field";
import type { EventFormState } from "../use-event-form";

interface TrainFormProps {
  form: EventFormState;
}

export function TrainForm({ form }: TrainFormProps) {
  return (
    <>
      <FormSection title="Route Details">
        <div className="space-y-2">
          <Label htmlFor="train-title">Train / Route</Label>
          <Input
            id="train-title"
            placeholder="Eurostar 9014"
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
              placeholder="Departure station"
            />
          </div>
          <div className="space-y-2">
            <Label>To</Label>
            <StationCombobox
              value={form.arrStation}
              onSelect={form.handleArrStationSelect}
              placeholder="Arrival station"
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Schedule">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="train-departure">Departure</Label>
            <Input
              id="train-departure"
              type="datetime-local"
              value={form.startDatetime}
              onChange={(e) => form.setStartDatetime(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="train-arrival">Arrival</Label>
            <Input
              id="train-arrival"
              type="datetime-local"
              value={form.endDatetime}
              onChange={(e) => form.setEndDatetime(e.target.value)}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Booking">
        <div className="space-y-2">
          <Label htmlFor="train-confirmation">Confirmation Number</Label>
          <Input
            id="train-confirmation"
            placeholder="ABC123"
            value={form.confirmationNumber}
            onChange={(e) => form.setConfirmationNumber(e.target.value)}
            maxLength={50}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="train-operator">Operator</Label>
            <Select value={form.trainOperator} onValueChange={form.setTrainOperator}>
              <SelectTrigger id="train-operator">
                <SelectValue placeholder="Select operator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Italo">Italo</SelectItem>
                <SelectItem value="Trenitalia">Trenitalia</SelectItem>
                <SelectItem value="Eurostar">Eurostar</SelectItem>
                <SelectItem value="TGV">TGV</SelectItem>
                <SelectItem value="ICE">ICE</SelectItem>
                <SelectItem value="Amtrak">Amtrak</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="train-class">Class</Label>
            <Input
              id="train-class"
              placeholder="e.g. Prima, Standard"
              value={form.trainClass}
              onChange={(e) => form.setTrainClass(e.target.value)}
              maxLength={50}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="train-coach">Coach</Label>
            <Input
              id="train-coach"
              placeholder="e.g. 5"
              value={form.trainCoach}
              onChange={(e) => form.setTrainCoach(e.target.value)}
              maxLength={10}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="train-seat">Seat</Label>
            <Input
              id="train-seat"
              placeholder="e.g. 12A"
              value={form.trainSeat}
              onChange={(e) => form.setTrainSeat(e.target.value)}
              maxLength={10}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Notes" collapsible defaultOpen={!!form.notes}>
        <Textarea
          id="train-notes"
          placeholder="Additional details..."
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
