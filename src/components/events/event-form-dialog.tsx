"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import type { TripEvent } from "@/lib/types";
import { useEventForm } from "./use-event-form";
import { EventTypePicker } from "./event-type-picker";
import { FlightForm } from "./forms/flight-form";
import { TrainForm } from "./forms/train-form";
import { FerryForm } from "./forms/ferry-form";
import { DriveForm } from "./forms/drive-form";
import { RestaurantForm } from "./forms/restaurant-form";
import { HotelForm } from "./forms/hotel-form";
import { ActivityForm } from "./forms/activity-form";
import { ShoppingForm } from "./forms/shopping-form";
import { BarsForm } from "./forms/bars-form";

interface EventFormDialogProps {
  tripId: string;
  event?: TripEvent;
  /** Controlled mode: externally manage open state */
  open?: boolean;
  /** Controlled mode: callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

function getDialogTitle(form: ReturnType<typeof useEventForm>): string {
  if (form.isEditing) return "Edit Event";
  if (form.type === "shopping") return "Add Store";
  if (form.type === "bars") return "Add Venue";
  return "Add Event";
}

function getSubmitLabel(form: ReturnType<typeof useEventForm>): string {
  if (form.loading) return "Saving...";
  if (form.isEditing) return "Save Changes";

  switch (form.type) {
    case "travel":
      switch (form.subType) {
        case "flight": return "Add Flight";
        case "train": return "Add Train";
        case "ferry": return "Add Ferry";
        case "drive": return "Add Drive";
      }
      break;
    case "hotel": return "Add Hotel";
    case "restaurant": return "Add Restaurant";
    case "activity": return "Add Activity";
    case "shopping": return "Add Store";
    case "bars": return "Add Venue";
  }
  return "Add Event";
}

function isSubmitDisabled(form: ReturnType<typeof useEventForm>): boolean {
  if (form.loading) return true;
  if (form.type === "shopping" && !form.isEditing && !form.shoppingStore) return true;
  if (form.type === "bars" && !form.isEditing && !form.barVenue) return true;
  return false;
}

function renderForm(form: ReturnType<typeof useEventForm>) {
  if (form.type === "travel") {
    switch (form.subType) {
      case "flight": return <FlightForm form={form} />;
      case "train": return <TrainForm form={form} />;
      case "ferry": return <FerryForm form={form} />;
      case "drive": return <DriveForm form={form} />;
    }
  }
  switch (form.type) {
    case "restaurant": return <RestaurantForm form={form} />;
    case "hotel": return <HotelForm form={form} />;
    case "activity": return <ActivityForm form={form} />;
    case "shopping": return <ShoppingForm form={form} />;
    case "bars": return <BarsForm form={form} />;
  }
  return null;
}

export function EventFormDialog({ tripId, event, open: controlledOpen, onOpenChange }: EventFormDialogProps) {
  const isControlled = controlledOpen !== undefined;
  const form = useEventForm(tripId, event, isControlled ? () => onOpenChange?.(false) : undefined);
  const dialogOpen = isControlled ? controlledOpen : form.open;

  function handleOpenChange(o: boolean) {
    if (isControlled) {
      onOpenChange?.(o);
    } else {
      form.setOpen(o);
    }
    if (!o) form.resetForm();
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {form.isEditing ? (
            <Button variant="ghost" size="sm">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {getDialogTitle(form)}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit} className="space-y-6">
          {!form.isEditing && (
            <EventTypePicker
              type={form.type}
              subType={form.subType}
              onTypeChange={form.setType}
              onSubTypeChange={form.setSubType}
            />
          )}

          {form.isEditing && (
            <p className="text-sm text-muted-foreground">
              Type: <span className="font-medium text-foreground capitalize">
                {form.type === "travel" ? form.subType : form.type}
              </span>
            </p>
          )}

          {renderForm(form)}

          {form.error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {form.error}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitDisabled(form)}>
              {getSubmitLabel(form)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
