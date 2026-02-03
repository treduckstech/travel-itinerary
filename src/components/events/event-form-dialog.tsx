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
import { Plus, Pencil, Search, Loader2 } from "lucide-react";
import type { TripEvent, EventType, FlightLookupResult } from "@/lib/types";

interface EventFormDialogProps {
  tripId: string;
  event?: TripEvent;
}

export function EventFormDialog({ tripId, event }: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventType>(event?.type ?? "activity");
  const [title, setTitle] = useState(event?.title ?? "");
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
  const [notes, setNotes] = useState(
    [event?.confirmation_number, event?.description, event?.notes]
      .filter(Boolean)
      .join("\n") || ""
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [manualEntry, setManualEntry] = useState(!!event);
  const [flightDate, setFlightDate] = useState("");
  const [depAirport, setDepAirport] = useState("");
  const [flightDuration, setFlightDuration] = useState<number | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!event;

  const isFlightLookupMode = type === "flight" && !manualEntry;

  function resetForm() {
    if (!isEditing) {
      setType("activity");
      setTitle("");
      setStartDatetime("");
      setEndDatetime("");
      setLocation("");
      setNotes("");
      setManualEntry(false);
      setFlightDate("");
      setDepAirport("");
      setFlightDuration(null);
    }
    setError(null);
  }

  function computeArrival(departureDatetime: string, durationMin: number): string {
    const dep = new Date(departureDatetime);
    const arr = new Date(dep.getTime() + durationMin * 60000);
    return arr.toISOString().slice(0, 16);
  }

  function handleDepartureChange(value: string) {
    setStartDatetime(value);
    if (flightDuration && value) {
      setEndDatetime(computeArrival(value, flightDuration));
    }
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
      if (depAirport.trim()) {
        url += `&dep_iata=${encodeURIComponent(depAirport.trim())}`;
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
      if (result.duration_minutes) {
        setFlightDuration(result.duration_minutes);
      }

      if (flightDate && result.departure_time) {
        const apiTime = new Date(result.departure_time);
        const timeStr = apiTime.toISOString().slice(11, 16);
        const departure = `${flightDate}T${timeStr}`;
        setStartDatetime(departure);

        if (result.duration_minutes) {
          setEndDatetime(computeArrival(departure, result.duration_minutes));
        }
      }

      setManualEntry(true);
      toast.success(flightDate ? "Flight found" : "Flight found — enter your departure date and time");
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
      description: null as string | null,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: endDatetime
        ? new Date(endDatetime).toISOString()
        : null,
      location: location || null,
      confirmation_number: null as string | null,
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
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Event" : "Add Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => {
                  setType(v as EventType);
                  if (v !== "flight") {
                    setManualEntry(false);
                    setFlightDuration(null);
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
                maxLength={100}
              />
            </div>
          </div>

          {isFlightLookupMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dep-airport">Departure Airport</Label>
                  <Input
                    id="dep-airport"
                    placeholder="ATL"
                    value={depAirport}
                    onChange={(e) => setDepAirport(e.target.value.toUpperCase())}
                    maxLength={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight-date">Departure Date</Label>
                  <Input
                    id="flight-date"
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                  />
                </div>
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
                    onChange={(e) =>
                      type === "flight" && flightDuration
                        ? handleDepartureChange(e.target.value)
                        : setStartDatetime(e.target.value)
                    }
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
                  {type === "flight" && flightDuration && (
                    <p className="text-xs text-muted-foreground">
                      Auto-calculated from {Math.floor(flightDuration / 60)}h {flightDuration % 60}m flight
                    </p>
                  )}
                </div>
              </div>

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
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-notes">Notes</Label>
                <Textarea
                  id="event-notes"
                  placeholder="Confirmation number, details, reminders..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  maxLength={1000}
                />
              </div>

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
