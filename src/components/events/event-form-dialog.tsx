"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, ChevronDown, Search, Loader2 } from "lucide-react";
import type { TripEvent, EventType, FlightLookupResult } from "@/lib/types";

interface EventFormDialogProps {
  tripId: string;
  event?: TripEvent;
}

export function EventFormDialog({ tripId, event }: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventType>(event?.type ?? "activity");
  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [startDatetime, setStartDatetime] = useState(
    event?.start_datetime
      ? new Date(event.start_datetime).toISOString().slice(0, 16)
      : ""
  );
  const [endDatetime, setEndDatetime] = useState(
    event?.end_datetime
      ? new Date(event.end_datetime).toISOString().slice(0, 16)
      : ""
  );
  const [location, setLocation] = useState(event?.location ?? "");
  const [confirmationNumber, setConfirmationNumber] = useState(
    event?.confirmation_number ?? ""
  );
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(
    !!(event && (event.description || event.location || event.confirmation_number || event.notes))
  );
  const [flightDate, setFlightDate] = useState("");
  const [manualEntry, setManualEntry] = useState(!!event);
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!event;

  const isFlightLookupMode = type === "flight" && !manualEntry;

  function resetForm() {
    if (!isEditing) {
      setType("activity");
      setTitle("");
      setDescription("");
      setStartDatetime("");
      setEndDatetime("");
      setLocation("");
      setConfirmationNumber("");
      setNotes("");
      setShowDetails(false);
      setFlightDate("");
      setManualEntry(false);
    }
    setError(null);
  }

  function mergeDateWithTime(userDate: string, apiDatetime: string): string {
    const timePart = apiDatetime.includes("T")
      ? apiDatetime.split("T")[1]
      : apiDatetime.slice(11);
    return `${userDate}T${timePart.slice(0, 5)}`;
  }

  async function handleFlightLookup() {
    if (!title.trim()) return;
    setLookupLoading(true);
    setError(null);

    try {
      let url = `/api/flights/lookup?flight_iata=${encodeURIComponent(title.trim())}`;
      if (flightDate) {
        url += `&flight_date=${encodeURIComponent(flightDate)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Flight lookup failed");
        setManualEntry(true);
        setLookupLoading(false);
        return;
      }

      const result = data as FlightLookupResult;
      setTitle(result.title);
      if (result.route) {
        setLocation(result.route);
      }
      if (result.departure_time) {
        if (flightDate) {
          setStartDatetime(mergeDateWithTime(flightDate, result.departure_time));
        } else {
          setStartDatetime(
            new Date(result.departure_time).toISOString().slice(0, 16)
          );
        }
      }
      if (result.arrival_time) {
        if (flightDate) {
          setEndDatetime(mergeDateWithTime(flightDate, result.arrival_time));
        } else {
          setEndDatetime(
            new Date(result.arrival_time).toISOString().slice(0, 16)
          );
        }
      }
      setManualEntry(true);
      setShowDetails(true);
      toast.success("Flight details filled in");
    } catch {
      setError("Failed to look up flight");
      setManualEntry(true);
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const eventData = {
      trip_id: tripId,
      type,
      title,
      description: description || null,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: endDatetime
        ? new Date(endDatetime).toISOString()
        : null,
      location: location || null,
      confirmation_number: confirmationNumber || null,
      notes: notes || null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", event.id);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("events").insert(eventData);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setOpen(false);
    resetForm();
    toast.success(isEditing ? "Event updated" : "Event added");
    router.refresh();
  }

  const typeLabels: Record<EventType, string> = {
    flight: "Flight",
    hotel: "Hotel",
    restaurant: "Restaurant",
    activity: "Activity",
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {isEditing ? (
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Event" : "Add Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Type + Title — always shown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as EventType);
                  if (v !== "flight") {
                    setManualEntry(false);
                    setFlightDate("");
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-title">
                {type === "flight"
                  ? "Flight #"
                  : type === "hotel"
                  ? "Hotel Name"
                  : type === "restaurant"
                  ? "Restaurant"
                  : "Activity"}
              </Label>
              <Input
                id="event-title"
                placeholder={
                  type === "flight"
                    ? "UA123"
                    : type === "hotel"
                    ? "Grand Hotel"
                    : type === "restaurant"
                    ? "Le Petit Bistro"
                    : "City Walking Tour"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Flight lookup mode: date picker + lookup button */}
          {isFlightLookupMode && (
            <>
              <div className="space-y-2">
                <Label htmlFor="flight-date">Departure Date</Label>
                <Input
                  id="flight-date"
                  type="date"
                  value={flightDate}
                  onChange={(e) => setFlightDate(e.target.value)}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFlightLookup}
                disabled={lookupLoading || !title.trim()}
                className="w-full"
              >
                {lookupLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                {lookupLoading ? "Looking up flight..." : "Look up flight"}
              </Button>

              <button
                type="button"
                onClick={() => setManualEntry(true)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Enter details manually
              </button>
            </>
          )}

          {/* Full form fields — shown for non-flight types or after lookup/manual entry */}
          {!isFlightLookupMode && (
            <>
              {type === "flight" && title.trim() && !startDatetime && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setManualEntry(false);
                    setError(null);
                  }}
                  className="w-full"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Look up flight
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event-start">
                    {type === "flight"
                      ? "Departure"
                      : type === "hotel"
                      ? "Check-in"
                      : "Start"}
                  </Label>
                  <Input
                    id="event-start"
                    type="datetime-local"
                    value={startDatetime}
                    onChange={(e) => setStartDatetime(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-end">
                    {type === "flight"
                      ? "Arrival"
                      : type === "hotel"
                      ? "Check-out"
                      : "End"}
                  </Label>
                  <Input
                    id="event-end"
                    type="datetime-local"
                    value={endDatetime}
                    onChange={(e) => setEndDatetime(e.target.value)}
                  />
                </div>
              </div>

              {/* Collapsible optional fields */}
              {!showDetails ? (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="flex w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  More details (location, confirmation #, notes)
                </button>
              ) : (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-location">Location</Label>
                    <Input
                      id="event-location"
                      placeholder={
                        type === "flight"
                          ? "SFO → CDG"
                          : "123 Main St"
                      }
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-confirmation">Confirmation Number</Label>
                    <Input
                      id="event-confirmation"
                      placeholder="ABC123"
                      value={confirmationNumber}
                      onChange={(e) => setConfirmationNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Optional description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-notes">Notes</Label>
                    <Textarea
                      id="event-notes"
                      placeholder="Additional notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : isEditing
                    ? "Save Changes"
                    : "Add Event"}
                </Button>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
