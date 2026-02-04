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
import { Plus, Pencil, Search, Loader2, MapPin } from "lucide-react";
import type { TripEvent, EventType, TravelSubType, FlightLookupResult, BenEatsRestaurant, PlaceResult } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";
import { AirportCombobox } from "@/components/events/airport-combobox";
import { StationCombobox } from "@/components/events/station-combobox";
import { RestaurantSearch } from "@/components/events/restaurant-search";
import { PlaceSearch } from "@/components/events/place-search";

interface EventFormDialogProps {
  tripId: string;
  event?: TripEvent;
}

export function EventFormDialog({ tripId, event }: EventFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<EventType>(event?.type ?? "activity");
  const [subType, setSubType] = useState<TravelSubType>(
    (event?.sub_type as TravelSubType) ?? "flight"
  );
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
  const [depAirport, setDepAirport] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "flight" && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [arrAirport, setArrAirport] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "flight" && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[1] || "";
    }
    return "";
  });
  const [depStation, setDepStation] = useState(() => {
    if (event?.type === "travel" && (event.sub_type === "train" || event.sub_type === "ferry") && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [arrStation, setArrStation] = useState(() => {
    if (event?.type === "travel" && (event.sub_type === "train" || event.sub_type === "ferry") && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[1] || "";
    }
    return "";
  });
  const [driveFrom, setDriveFrom] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [driveTo, setDriveTo] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.location) {
      const parts = event.location.split("→").map((s) => s.trim());
      return parts[1] || "";
    }
    return "";
  });
  const [driveFromAddress, setDriveFromAddress] = useState("");
  const [driveToAddress, setDriveToAddress] = useState("");
  const [driveDuration, setDriveDuration] = useState<number | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [flightDuration, setFlightDuration] = useState<number | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState(event?.confirmation_number ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!event;

  const isFlightLookupMode = type === "travel" && subType === "flight" && !manualEntry;

  function resetForm() {
    if (!isEditing) {
      setType("activity");
      setSubType("flight");
      setTitle("");
      setStartDatetime("");
      setEndDatetime("");
      setLocation("");
      setNotes("");
      setManualEntry(false);
      setFlightDate("");
      setDepAirport("");
      setArrAirport("");
      setDepStation("");
      setArrStation("");
      setDriveFrom("");
      setDriveTo("");
      setDriveFromAddress("");
      setDriveToAddress("");
      setDriveDuration(null);
      setDriveLoading(false);
      setFlightDuration(null);
      setConfirmationNumber("");
      setDescription("");
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
    if (type === "travel" && subType === "flight" && flightDuration && value) {
      setEndDatetime(computeArrival(value, flightDuration));
    }
    if (type === "travel" && subType === "drive" && value) {
      if (driveDuration) {
        setEndDatetime(computeArrival(value, driveDuration));
      } else if (driveFromAddress && driveToAddress) {
        fetchDriveTime(driveFromAddress, driveToAddress, value);
      }
    }
  }

  async function fetchDriveTime(originAddr: string, destAddr: string, departure?: string) {
    if (!originAddr.trim() || !destAddr.trim()) return;
    setDriveLoading(true);
    try {
      const res = await fetch(
        `/api/places/distance?origin=${encodeURIComponent(originAddr)}&destination=${encodeURIComponent(destAddr)}`
      );
      if (!res.ok) {
        setDriveDuration(null);
        return;
      }
      const data = await res.json();
      const minutes = data.duration_minutes as number;
      setDriveDuration(minutes);
      const dep = departure ?? startDatetime;
      if (dep && minutes > 0) {
        setEndDatetime(computeArrival(dep, minutes));
      }
    } catch {
      setDriveDuration(null);
    } finally {
      setDriveLoading(false);
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
      if (result.departure_airport) {
        setDepAirport(result.departure_airport);
      }
      if (result.arrival_airport) {
        setArrAirport(result.arrival_airport);
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

  function getTravelLocation(): string | null {
    if (subType === "flight") {
      return [depAirport, arrAirport].filter(Boolean).join(" → ") || null;
    }
    if (subType === "train" || subType === "ferry") {
      return [depStation, arrStation].filter(Boolean).join(" → ") || null;
    }
    if (subType === "drive") {
      return [driveFrom, driveTo].filter(Boolean).join(" → ") || null;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalTitle =
      type === "travel" && subType === "drive" && driveFrom && driveTo
        ? `${driveFrom} → ${driveTo}`
        : title;

    let finalDescription = description || null;
    if (type === "travel" && subType === "drive" && driveFromAddress && driveToAddress) {
      finalDescription = `${driveFromAddress}|||${driveToAddress}`;
    }

    const eventData = {
      trip_id: tripId,
      type,
      sub_type: type === "travel" ? subType : null,
      title: finalTitle,
      description: finalDescription,
      start_datetime: new Date(startDatetime).toISOString(),
      end_datetime: endDatetime
        ? new Date(endDatetime).toISOString()
        : null,
      location: type === "travel" ? getTravelLocation() : (location || null),
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

    if (!isEditing) {
      logActivity("event_added", { trip_id: tripId, type, title: finalTitle });
    }

    setLoading(false);
    setOpen(false);
    resetForm();
    toast.success(isEditing ? "Event updated" : "Event added");
    router.refresh();
  }

  function handleRestaurantSelect(restaurant: BenEatsRestaurant) {
    setTitle(restaurant.name);
    const addressParts = [restaurant.address, restaurant.city, restaurant.state].filter(Boolean);
    setLocation(addressParts.join(", "));

    const noteParts: string[] = [];
    if (restaurant.cuisine_type) noteParts.push(`Cuisine: ${restaurant.cuisine_type}`);
    if (restaurant.price_range) noteParts.push(`Price: ${restaurant.price_range}`);
    if (restaurant.rating) noteParts.push(`Rating: ${restaurant.rating}/5`);
    if (noteParts.length) setNotes(noteParts.join("\n"));

    if (restaurant.id) {
      setConfirmationNumber(`beneats:${restaurant.id}`);
    }

    if (restaurant.latitude && restaurant.longitude) {
      setDescription(`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`);
    } else if (restaurant.google_place_id) {
      setDescription(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.google_place_id}`);
    } else {
      setDescription("");
    }
  }

  const typeLabels: Record<EventType, string> = {
    travel: "Travel",
    hotel: "Hotel",
    restaurant: "Restaurant",
    activity: "Activity",
  };

  const subTypeLabels: Record<TravelSubType, string> = {
    flight: "Flight",
    train: "Train",
    ferry: "Ferry",
    drive: "Drive",
  };

  function getTitleLabel(): string {
    if (type === "travel") {
      if (subType === "flight") return "Flight #";
      if (subType === "train") return "Train / Route";
      if (subType === "ferry") return "Ferry / Route";
      if (subType === "drive") return "Trip Name";
    }
    if (type === "hotel") return "Hotel Name";
    if (type === "restaurant") return "Restaurant";
    return "Activity";
  }

  function getTitlePlaceholder(): string {
    if (type === "travel") {
      if (subType === "flight") return "UA123";
      if (subType === "train") return "Eurostar 9014";
      if (subType === "ferry") return "Blue Star Ferries";
      if (subType === "drive") return "Drive to coast";
    }
    if (type === "hotel") return "Grand Hotel";
    return "City Walking Tour";
  }

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
                  if (v !== "travel") {
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

            {type === "travel" ? (
              <div className="space-y-2">
                <Label>Sub-type</Label>
                <Select
                  value={subType}
                  onValueChange={(v) => {
                    setSubType(v as TravelSubType);
                    setManualEntry(v !== "flight" ? true : !!event);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(subTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="event-title">
                  {getTitleLabel()}
                </Label>
                {type === "restaurant" ? (
                  <RestaurantSearch
                    id="event-title"
                    value={title}
                    onSelect={handleRestaurantSelect}
                    onManualEntry={(name) => setTitle(name)}
                    placeholder="Search restaurants..."
                  />
                ) : (
                  <Input
                    id="event-title"
                    placeholder={getTitlePlaceholder()}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    maxLength={100}
                  />
                )}
              </div>
            )}
          </div>

          {type === "travel" && subType !== "drive" && (
            <div className="space-y-2">
              <Label htmlFor="event-title">
                {getTitleLabel()}
              </Label>
              <Input
                id="event-title"
                placeholder={getTitlePlaceholder()}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
              />
            </div>
          )}

          {isFlightLookupMode && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dep-airport">Departure Airport</Label>
                  <AirportCombobox
                    id="dep-airport"
                    value={depAirport}
                    onSelect={setDepAirport}
                    placeholder="Search airports..."
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
              {type === "travel" && subType === "flight" && title.trim() && !startDatetime && (
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

              {type === "travel" && subType === "drive" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Origin</Label>
                      <PlaceSearch
                        id="drive-from"
                        value={driveFrom}
                        onSelect={(place: PlaceResult) => {
                          setDriveFrom(place.name);
                          setDriveFromAddress(place.address || place.name);
                          const destAddr = driveToAddress || driveTo;
                          if (destAddr) fetchDriveTime(place.address || place.name, destAddr);
                        }}
                        onManualEntry={(name: string) => {
                          setDriveFrom(name);
                          setDriveFromAddress(name);
                          const destAddr = driveToAddress || driveTo;
                          if (destAddr) fetchDriveTime(name, destAddr);
                        }}
                        placeholder="Search origin..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Destination</Label>
                      <PlaceSearch
                        id="drive-to"
                        value={driveTo}
                        onSelect={(place: PlaceResult) => {
                          setDriveTo(place.name);
                          setDriveToAddress(place.address || place.name);
                          const origAddr = driveFromAddress || driveFrom;
                          if (origAddr) fetchDriveTime(origAddr, place.address || place.name);
                        }}
                        onManualEntry={(name: string) => {
                          setDriveTo(name);
                          setDriveToAddress(name);
                          const origAddr = driveFromAddress || driveFrom;
                          if (origAddr) fetchDriveTime(origAddr, name);
                        }}
                        placeholder="Search destination..."
                      />
                    </div>
                  </div>

                  {driveLoading && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Calculating drive time...
                    </p>
                  )}
                  {!driveLoading && driveDuration != null && (
                    <p className="text-xs text-muted-foreground">
                      Drive time: {Math.floor(driveDuration / 60)}h {driveDuration % 60}m
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="event-start">Departure</Label>
                    <Input
                      id="event-start"
                      type="datetime-local"
                      value={startDatetime}
                      onChange={(e) => handleDepartureChange(e.target.value)}
                      required
                    />
                  </div>

                  {endDatetime && (
                    <p className="text-sm text-muted-foreground">
                      Arrival: {new Date(endDatetime).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className={type === "restaurant" ? "" : "grid grid-cols-2 gap-4"}>
                    <div className="space-y-2">
                      <Label htmlFor="event-start">
                        {type === "travel" && (subType === "flight" || subType === "train" || subType === "ferry")
                          ? "Departure"
                          : type === "hotel"
                          ? "Check-in"
                          : type === "restaurant"
                          ? "Reservation Time"
                          : "Start"}
                      </Label>
                      <Input
                        id="event-start"
                        type="datetime-local"
                        value={startDatetime}
                        onChange={(e) => handleDepartureChange(e.target.value)}
                        required
                      />
                    </div>
                    {type !== "restaurant" && (
                      <div className="space-y-2">
                        <Label htmlFor="event-end">
                          {type === "travel"
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
                        {type === "travel" && subType === "flight" && flightDuration && (
                          <p className="text-xs text-muted-foreground">
                            Auto-calculated from {Math.floor(flightDuration / 60)}h {flightDuration % 60}m flight
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {type === "travel" && subType === "flight" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <AirportCombobox
                      value={depAirport}
                      onSelect={setDepAirport}
                      placeholder="Departure"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <AirportCombobox
                      value={arrAirport}
                      onSelect={setArrAirport}
                      placeholder="Arrival"
                    />
                  </div>
                </div>
              ) : type === "travel" && (subType === "train" || subType === "ferry") ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>From</Label>
                    <StationCombobox
                      value={depStation}
                      onSelect={setDepStation}
                      placeholder="Departure"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>To</Label>
                    <StationCombobox
                      value={arrStation}
                      onSelect={setArrStation}
                      placeholder="Arrival"
                    />
                  </div>
                </div>
              ) : type !== "travel" ? (
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  <Input
                    id="event-location"
                    placeholder="123 Main St"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    maxLength={200}
                  />
                  {type === "restaurant" && description && description.startsWith("https://www.google.com/maps") && (
                    <a
                      href={description}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MapPin className="h-3 w-3" />
                      View on Google Maps
                    </a>
                  )}
                </div>
              ) : null}

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
