"use client";

import { useState, useRef, useEffect } from "react";
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
import { Plus, Pencil, Search, Loader2, MapPin, Paperclip, X, FileText, ImageIcon } from "lucide-react";
import type { TripEvent, EventType, TravelSubType, FlightLookupResult, BenEatsRestaurant, PlaceResult, EventAttachment } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";
import { AirportCombobox } from "@/components/events/airport-combobox";
import { airports } from "@/data/airports";
import { StationCombobox } from "@/components/events/station-combobox";
import { stations } from "@/data/stations";
import { RestaurantSearch } from "@/components/events/restaurant-search";
import { HotelSearch } from "@/components/events/hotel-search";
import { PlaceSearch } from "@/components/events/place-search";
import { TimezoneCombobox } from "@/components/events/timezone-combobox";
import { parseTimezone, buildTimezone, getBrowserTimezone, naiveToUtc, utcToNaive } from "@/lib/timezone";
import { extractCityFromAddress } from "@/lib/address";

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
  const [startDatetime, setStartDatetime] = useState(() => {
    if (!event?.start_datetime) return "";
    if (event.type === "shopping" || event.type === "bars") return ""; // Dateless events use sentinel dates, don't parse
    if (event.timezone) {
      const tz = parseTimezone(event.timezone);
      if (tz.start) {
        const naive = utcToNaive(event.start_datetime, tz.start);
        return event.type === "hotel" ? naive.slice(0, 10) : naive;
      }
    }
    const iso = new Date(event.start_datetime).toISOString();
    return event.type === "hotel" ? iso.slice(0, 10) : iso.slice(0, 16);
  });
  const [endDatetime, setEndDatetime] = useState(() => {
    if (!event?.end_datetime) return "";
    if (event.type === "shopping" || event.type === "bars") return ""; // Dateless events use sentinel dates, don't parse
    if (event.timezone) {
      const tz = parseTimezone(event.timezone);
      if (tz.end) {
        const naive = utcToNaive(event.end_datetime, tz.end);
        return event.type === "hotel" ? naive.slice(0, 10) : naive;
      }
    }
    const iso = new Date(event.end_datetime).toISOString();
    return event.type === "hotel" ? iso.slice(0, 10) : iso.slice(0, 16);
  });
  const [location, setLocation] = useState(event?.location ?? "");
  const [notes, setNotes] = useState(() => {
    if (!event) return "";
    const descriptionIsStructured =
      event.description?.startsWith("https://www.google.com/maps") ||
      event.description?.includes("|||");
    return [
      event.confirmation_number,
      descriptionIsStructured ? null : event.description,
      event.notes,
    ]
      .filter(Boolean)
      .join("\n") || "";
  });
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
  const [driveFromAddress, setDriveFromAddress] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.description?.includes("|||")) {
      return event.description.split("|||")[0]?.trim() || "";
    }
    return "";
  });
  const [driveToAddress, setDriveToAddress] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.description?.includes("|||")) {
      return event.description.split("|||")[1]?.trim() || "";
    }
    return "";
  });
  const [driveDuration, setDriveDuration] = useState<number | null>(null);
  const [driveLoading, setDriveLoading] = useState(false);
  const [flightDuration, setFlightDuration] = useState<number | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState(event?.confirmation_number ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [trainOperator, setTrainOperator] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "train" && event.description?.includes("|||")) {
      return event.description.split("|||")[0] || "";
    }
    return "";
  });
  const [trainClass, setTrainClass] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "train" && event.description?.includes("|||")) {
      return event.description.split("|||")[1] || "";
    }
    return "";
  });
  const [trainCoach, setTrainCoach] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "train" && event.description?.includes("|||")) {
      return event.description.split("|||")[2] || "";
    }
    return "";
  });
  const [trainSeat, setTrainSeat] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "train" && event.description?.includes("|||")) {
      return event.description.split("|||")[3] || "";
    }
    return "";
  });
  const [startTimezone, setStartTimezone] = useState(() => {
    if (event?.timezone) {
      return parseTimezone(event.timezone).start || getBrowserTimezone();
    }
    return getBrowserTimezone();
  });
  const [endTimezone, setEndTimezone] = useState(() => {
    if (event?.timezone) {
      return parseTimezone(event.timezone).end || getBrowserTimezone();
    }
    return getBrowserTimezone();
  });
  const [attachments, setAttachments] = useState<EventAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();
  const [shoppingStore, setShoppingStore] = useState<PlaceResult | null>(null);
  const [shoppingCategory, setShoppingCategory] = useState("");
  const [barVenue, setBarVenue] = useState<PlaceResult | null>(null);
  const [barNote, setBarNote] = useState("");
  const isEditing = !!event;

  // Recalculate drive time when editing a drive event
  useEffect(() => {
    if (isEditing && event.type === "travel" && event.sub_type === "drive" && open && driveFromAddress && driveToAddress) {
      fetchDriveTime(driveFromAddress, driveToAddress, startDatetime || undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Load existing attachments when editing an activity event
  useEffect(() => {
    if (isEditing && (event.type === "activity" || (event.type === "travel" && event.sub_type === "train")) && open) {
      supabase
        .from("event_attachments")
        .select("*")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (data) setAttachments(data as EventAttachment[]);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "application/pdf"];
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const MAX_ATTACHMENTS = 5;

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const totalCount = attachments.length + pendingFiles.length + files.length;
    if (totalCount > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: File type not allowed. Accepted: JPEG, PNG, WebP, HEIC, PDF`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File too large. Maximum size is 10MB`);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
    }
    setPendingFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePendingFile(index: number) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function removeExistingAttachment(attachmentId: string) {
    const res = await fetch(`/api/attachments?id=${attachmentId}`, { method: "DELETE" });
    if (res.ok) {
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success("Attachment removed");
    } else {
      toast.error("Failed to remove attachment");
    }
  }

  async function uploadPendingFiles(eventId: string) {
    if (pendingFiles.length === 0) return;
    for (const file of pendingFiles) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("event_id", eventId);
      formData.append("trip_id", tripId);
      const res = await fetch("/api/attachments", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || `Failed to upload ${file.name}`);
      }
    }
    setPendingFiles([]);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

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
      setTrainOperator("");
      setTrainClass("");
      setTrainCoach("");
      setTrainSeat("");
      setStartTimezone(getBrowserTimezone());
      setEndTimezone(getBrowserTimezone());
      setAttachments([]);
      setPendingFiles([]);
      setShoppingStore(null);
      setShoppingCategory("");
      setBarVenue(null);
      setBarNote("");
    }
    setError(null);
  }

  function computeArrival(departureDatetime: string, durationMin: number): string {
    // Force UTC parsing so naive datetime arithmetic isn't skewed by browser timezone
    const dep = new Date(departureDatetime + "Z");
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

  async function fetchTimezoneFromCoords(lat: number, lng: number): Promise<string | null> {
    try {
      const res = await fetch(`/api/places/timezone?lat=${lat}&lng=${lng}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.timezone || null;
    } catch {
      return null;
    }
  }

  function lookupAirportTimezone(iata: string): string | null {
    const airport = airports.find((a) => a.iata === iata);
    return airport?.tz ?? null;
  }

  function lookupStationTimezone(code: string): string | null {
    const station = stations.find((s) => s.code === code);
    return station?.tz ?? null;
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
        const tz = lookupAirportTimezone(result.departure_airport);
        if (tz) setStartTimezone(tz);
      }
      if (result.arrival_airport) {
        setArrAirport(result.arrival_airport);
        const tz = lookupAirportTimezone(result.arrival_airport);
        if (tz) setEndTimezone(tz);
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

  async function handleShoppingCreate() {
    setLoading(true);
    setError(null);

    if (!shoppingStore) {
      setError("Please search for a store");
      setLoading(false);
      return;
    }

    // Extract city from store address
    const city = shoppingStore.address
      ? extractCityFromAddress(shoppingStore.address)
      : null;
    const cityTitle = city || "Shopping";

    // Find existing shopping event for this city in this trip
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("trip_id", tripId)
      .eq("type", "shopping")
      .ilike("title", cityTitle)
      .limit(1)
      .maybeSingle();

    let parentEventId: string;

    if (existing) {
      parentEventId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("events")
        .insert({
          trip_id: tripId,
          type: "shopping" as EventType,
          sub_type: null,
          title: cityTitle,
          description: null,
          start_datetime: new Date().toISOString(),
          end_datetime: null,
          location: null,
          confirmation_number: null,
          notes: null,
          timezone: null,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        setError(insertError?.message ?? "Failed to create shopping event");
        setLoading(false);
        return;
      }
      parentEventId = inserted.id;
      logActivity("event_added", { trip_id: tripId, type: "shopping", title: cityTitle });
    }

    // Build Google Maps URL
    const googleUrl = shoppingStore.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shoppingStore.name)}&query_place_id=${shoppingStore.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([shoppingStore.name, shoppingStore.address].filter(Boolean).join(", "))}`;

    // Get current store count for sort_order
    const { count } = await supabase
      .from("shopping_stores")
      .select("*", { count: "exact", head: true })
      .eq("event_id", parentEventId);

    const { error: storeError } = await supabase.from("shopping_stores").insert({
      event_id: parentEventId,
      name: shoppingStore.name,
      address: shoppingStore.address || null,
      google_maps_url: googleUrl,
      category: shoppingCategory || null,
      sort_order: count ?? 0,
    });

    if (storeError) {
      setError("Failed to add store");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    resetForm();
    toast.success(`${shoppingStore.name} added${city ? ` to shopping in ${city}` : ""}`);
    router.refresh();
  }

  async function handleBarsCreate() {
    setLoading(true);
    setError(null);

    if (!barVenue) {
      setError("Please search for a venue");
      setLoading(false);
      return;
    }

    // Extract city from venue address
    const city = barVenue.address
      ? extractCityFromAddress(barVenue.address)
      : null;
    const cityTitle = city || "Bars";

    // Find existing bars event for this city in this trip
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("trip_id", tripId)
      .eq("type", "bars")
      .ilike("title", cityTitle)
      .limit(1)
      .maybeSingle();

    let parentEventId: string;

    if (existing) {
      parentEventId = existing.id;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from("events")
        .insert({
          trip_id: tripId,
          type: "bars" as EventType,
          sub_type: null,
          title: cityTitle,
          description: null,
          start_datetime: new Date().toISOString(),
          end_datetime: null,
          location: null,
          confirmation_number: null,
          notes: null,
          timezone: null,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        setError(insertError?.message ?? "Failed to create bars event");
        setLoading(false);
        return;
      }
      parentEventId = inserted.id;
      logActivity("event_added", { trip_id: tripId, type: "bars", title: cityTitle });
    }

    // Build Google Maps URL
    const googleUrl = barVenue.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barVenue.name)}&query_place_id=${barVenue.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([barVenue.name, barVenue.address].filter(Boolean).join(", "))}`;

    // Get current venue count for sort_order
    const { count } = await supabase
      .from("bar_venues")
      .select("*", { count: "exact", head: true })
      .eq("event_id", parentEventId);

    const { error: venueError } = await supabase.from("bar_venues").insert({
      event_id: parentEventId,
      name: barVenue.name,
      address: barVenue.address || null,
      google_maps_url: googleUrl,
      category: barNote || null,
      sort_order: count ?? 0,
    });

    if (venueError) {
      setError("Failed to add venue");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    resetForm();
    toast.success(`${barVenue.name} added${city ? ` to bars in ${city}` : ""}`);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (type === "shopping" && !isEditing) {
      return handleShoppingCreate();
    }

    if (type === "bars" && !isEditing) {
      return handleBarsCreate();
    }

    setLoading(true);
    setError(null);

    const finalTitle =
      type === "travel" && subType === "drive" && driveFrom && driveTo
        ? `${driveFrom} → ${driveTo}`
        : type === "shopping" && !title.trim()
        ? "Shopping"
        : type === "bars" && !title.trim()
        ? "Bars"
        : title;

    let finalDescription = description || null;
    if (type === "travel" && subType === "drive" && driveFromAddress && driveToAddress) {
      finalDescription = `${driveFromAddress}|||${driveToAddress}`;
    }
    if (type === "travel" && subType === "train") {
      const parts = [trainOperator, trainClass, trainCoach, trainSeat];
      if (parts.some((p) => p.trim())) {
        finalDescription = parts.join("|||");
      }
    }

    const isDualTz = type === "travel";
    const isDateless = type === "shopping" || type === "bars";
    const tzValue = isDateless
      ? null
      : isDualTz
        ? buildTimezone(startTimezone, endTimezone)
        : buildTimezone(startTimezone);

    const eventData = {
      trip_id: tripId,
      type,
      sub_type: type === "travel" ? subType : null,
      title: finalTitle,
      description: finalDescription,
      start_datetime: isDateless
        ? new Date().toISOString()
        : naiveToUtc(startDatetime, startTimezone),
      end_datetime: isDateless
        ? null
        : endDatetime
          ? naiveToUtc(endDatetime, isDualTz ? endTimezone : startTimezone)
          : null,
      location: type === "travel" ? getTravelLocation() : (location || null),
      confirmation_number: confirmationNumber || null,
      notes: notes || null,
      timezone: tzValue,
    };

    let savedEventId: string;

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
      savedEventId = event.id;
    } else {
      const { data: inserted, error } = await supabase
        .from("events")
        .insert(eventData)
        .select("id")
        .single();

      if (error || !inserted) {
        setError(error?.message ?? "Failed to create event");
        setLoading(false);
        return;
      }
      savedEventId = inserted.id;
    }

    // Upload pending attachments
    if ((type === "activity" || (type === "travel" && subType === "train")) && pendingFiles.length > 0) {
      await uploadPendingFiles(savedEventId);
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

    if (restaurant.google_place_id) {
      setDescription(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.google_place_id}`);
    } else {
      const queryParts = [restaurant.name, restaurant.address, restaurant.city, restaurant.state].filter(Boolean);
      setDescription(queryParts.length > 0
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(", "))}`
        : "");
    }

    if (restaurant.latitude && restaurant.longitude) {
      fetchTimezoneFromCoords(restaurant.latitude, restaurant.longitude).then((tz) => {
        if (tz) { setStartTimezone(tz); setEndTimezone(tz); }
      });
    }
  }

  function handleHotelSelect(place: PlaceResult) {
    setTitle(place.name);
    setLocation(place.address || "");
    if (place.id) {
      setDescription(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`);
    } else {
      const query = [place.name, place.address].filter(Boolean).join(", ");
      setDescription(query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "");
    }

    if (place.lat && place.lng) {
      fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => {
        if (tz) { setStartTimezone(tz); setEndTimezone(tz); }
      });
    }
  }

  const typeLabels: Record<EventType, string> = {
    travel: "Travel",
    hotel: "Hotel",
    restaurant: "Restaurant",
    activity: "Activity",
    shopping: "Shopping",
    bars: "Bars",
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
    if (type === "shopping") return isEditing ? "City" : "Store";
    if (type === "bars") return isEditing ? "City" : "Venue";
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
    if (type === "shopping") return "Florence";
    if (type === "bars") return "London";
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
            {isEditing ? "Edit Event" : type === "shopping" ? "Add Store" : type === "bars" ? "Add Venue" : "Add Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                ) : type === "hotel" ? (
                  <HotelSearch
                    id="event-title"
                    value={title}
                    onSelect={handleHotelSelect}
                    onManualEntry={(name) => setTitle(name)}
                    placeholder="Search hotels..."
                  />
                ) : type === "shopping" && !isEditing ? (
                  <PlaceSearch
                    id="event-title"
                    value={shoppingStore?.name ?? ""}
                    onSelect={(place: PlaceResult) => setShoppingStore(place)}
                    onManualEntry={(name: string) => setShoppingStore({ id: "", name, address: "" })}
                    placeholder="Search for a store..."
                  />
                ) : type === "bars" && !isEditing ? (
                  <PlaceSearch
                    id="event-title"
                    value={barVenue?.name ?? ""}
                    onSelect={(place: PlaceResult) => setBarVenue(place)}
                    onManualEntry={(name: string) => setBarVenue({ id: "", name, address: "" })}
                    placeholder="Search for a bar..."
                  />
                ) : (
                  <Input
                    id="event-title"
                    placeholder={getTitlePlaceholder()}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required={type !== "shopping" && type !== "bars"}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dep-airport">Departure Airport</Label>
                  <AirportCombobox
                    id="dep-airport"
                    value={depAirport}
                    onSelect={(iata) => { setDepAirport(iata); const tz = lookupAirportTimezone(iata); if (tz) setStartTimezone(tz); }}
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

              {type === "travel" && subType === "train" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <StationCombobox
                        value={depStation}
                        onSelect={(code) => { setDepStation(code); const tz = lookupStationTimezone(code); if (tz) setStartTimezone(tz); }}
                        placeholder="Departure station"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <StationCombobox
                        value={arrStation}
                        onSelect={(code) => { setArrStation(code); const tz = lookupStationTimezone(code); if (tz) setEndTimezone(tz); }}
                        placeholder="Arrival station"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departure Timezone</Label>
                      <TimezoneCombobox
                        value={startTimezone}
                        onSelect={setStartTimezone}
                        placeholder="Departure timezone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Timezone</Label>
                      <TimezoneCombobox
                        value={endTimezone}
                        onSelect={setEndTimezone}
                        placeholder="Arrival timezone"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="train-departure">Departure</Label>
                      <Input
                        id="train-departure"
                        type="datetime-local"
                        value={startDatetime}
                        onChange={(e) => setStartDatetime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="train-arrival">Arrival</Label>
                      <Input
                        id="train-arrival"
                        type="datetime-local"
                        value={endDatetime}
                        onChange={(e) => setEndDatetime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="train-confirmation">Confirmation Number</Label>
                    <Input
                      id="train-confirmation"
                      placeholder="ABC123"
                      value={confirmationNumber}
                      onChange={(e) => setConfirmationNumber(e.target.value)}
                      maxLength={50}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="train-operator">Operator</Label>
                      <Select value={trainOperator} onValueChange={setTrainOperator}>
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
                        value={trainClass}
                        onChange={(e) => setTrainClass(e.target.value)}
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
                        value={trainCoach}
                        onChange={(e) => setTrainCoach(e.target.value)}
                        maxLength={10}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="train-seat">Seat</Label>
                      <Input
                        id="train-seat"
                        placeholder="e.g. 12A"
                        value={trainSeat}
                        onChange={(e) => setTrainSeat(e.target.value)}
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="train-notes">Notes</Label>
                    <Textarea
                      id="train-notes"
                      placeholder="Additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      maxLength={1000}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Attachments</Label>
                    {attachments.length > 0 && (
                      <div className="space-y-1.5">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
                          >
                            {att.content_type.startsWith("image/") ? (
                              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{att.file_name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatFileSize(att.file_size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeExistingAttachment(att.id)}
                              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {pendingFiles.length > 0 && (
                      <div className="space-y-1.5">
                        {pendingFiles.map((file, i) => (
                          <div
                            key={`pending-${i}`}
                            className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/10 px-3 py-1.5 text-sm"
                          >
                            {file.type.startsWith("image/") ? (
                              <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            ) : (
                              <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            )}
                            <span className="min-w-0 flex-1 truncate">{file.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              type="button"
                              onClick={() => removePendingFile(i)}
                              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {attachments.length + pendingFiles.length < MAX_ATTACHMENTS && (
                      <>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Paperclip className="mr-2 h-4 w-4" />
                          Add files
                        </Button>
                      </>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Up to {MAX_ATTACHMENTS} files. Images or PDFs, 10MB max each.
                    </p>
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
              ) : type === "travel" && subType === "drive" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          if (place.lat && place.lng) {
                            fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => { if (tz) setStartTimezone(tz); });
                          }
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
                          if (place.lat && place.lng) {
                            fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => { if (tz) setEndTimezone(tz); });
                          }
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departure Timezone</Label>
                      <TimezoneCombobox
                        value={startTimezone}
                        onSelect={setStartTimezone}
                        placeholder="Departure timezone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Timezone</Label>
                      <TimezoneCombobox
                        value={endTimezone}
                        onSelect={setEndTimezone}
                        placeholder="Arrival timezone"
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
              ) : type !== "shopping" && type !== "bars" ? (
                <>
                  <div className={type === "restaurant" ? "" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                    <div className="space-y-2">
                      <Label htmlFor="event-start">
                        {type === "travel" && (subType === "flight" || subType === "ferry")
                          ? "Departure"
                          : type === "hotel"
                          ? "Check-in"
                          : type === "restaurant"
                          ? "Reservation Time"
                          : "Start"}
                      </Label>
                      <Input
                        id="event-start"
                        type={type === "hotel" ? "date" : "datetime-local"}
                        value={type === "hotel" ? startDatetime.slice(0, 10) : startDatetime}
                        onChange={(e) => handleDepartureChange(e.target.value)}
                        required
                      />
                    </div>
                    {type !== "restaurant" && type !== "activity" && (
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
                          type={type === "hotel" ? "date" : "datetime-local"}
                          value={type === "hotel" ? endDatetime.slice(0, 10) : endDatetime}
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
              ) : null}

              {type === "shopping" && !isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="shopping-category">Category (optional)</Label>
                    <Input
                      id="shopping-category"
                      placeholder="Fashion, Souvenirs, Gifts..."
                      value={shoppingCategory}
                      onChange={(e) => setShoppingCategory(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading || !shoppingStore}>
                      {loading ? "Adding..." : "Add Store"}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {type === "bars" && !isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="bar-note">Note (optional)</Label>
                    <Input
                      id="bar-note"
                      placeholder="Cocktails, Wine bar, Pub..."
                      value={barNote}
                      onChange={(e) => setBarNote(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={loading || !barVenue}>
                      {loading ? "Adding..." : "Add Venue"}
                    </Button>
                  </DialogFooter>
                </>
              )}

              {type === "travel" && subType === "flight" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <AirportCombobox
                        value={depAirport}
                        onSelect={(iata) => { setDepAirport(iata); const tz = lookupAirportTimezone(iata); if (tz) setStartTimezone(tz); }}
                        placeholder="Departure"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <AirportCombobox
                        value={arrAirport}
                        onSelect={(iata) => { setArrAirport(iata); const tz = lookupAirportTimezone(iata); if (tz) setEndTimezone(tz); }}
                        placeholder="Arrival"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departure Timezone</Label>
                      <TimezoneCombobox
                        value={startTimezone}
                        onSelect={setStartTimezone}
                        placeholder="Departure timezone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Timezone</Label>
                      <TimezoneCombobox
                        value={endTimezone}
                        onSelect={setEndTimezone}
                        placeholder="Arrival timezone"
                      />
                    </div>
                  </div>
                </>
              ) : type === "travel" && subType === "ferry" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <StationCombobox
                        value={depStation}
                        onSelect={(code) => { setDepStation(code); const tz = lookupStationTimezone(code); if (tz) setStartTimezone(tz); }}
                        placeholder="Departure"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>To</Label>
                      <StationCombobox
                        value={arrStation}
                        onSelect={(code) => { setArrStation(code); const tz = lookupStationTimezone(code); if (tz) setEndTimezone(tz); }}
                        placeholder="Arrival"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Departure Timezone</Label>
                      <TimezoneCombobox
                        value={startTimezone}
                        onSelect={setStartTimezone}
                        placeholder="Departure timezone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Timezone</Label>
                      <TimezoneCombobox
                        value={endTimezone}
                        onSelect={setEndTimezone}
                        placeholder="Arrival timezone"
                      />
                    </div>
                  </div>
                </>
              ) : type !== "travel" && type !== "shopping" && type !== "bars" ? (
                <div className="space-y-2">
                  <Label htmlFor="event-location">Location</Label>
                  {type === "activity" ? (
                    <PlaceSearch
                      id="event-location"
                      value={location}
                      onSelect={(place: PlaceResult) => {
                        setLocation(place.address || place.name);
                        if (place.id) {
                          setDescription(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.id}`);
                        } else {
                          const query = [place.name, place.address].filter(Boolean).join(", ");
                          setDescription(query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : "");
                        }
                        if (place.lat && place.lng) {
                          fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => { if (tz) { setStartTimezone(tz); setEndTimezone(tz); } });
                        }
                      }}
                      onManualEntry={(name: string) => {
                        setLocation(name);
                        setDescription("");
                      }}
                      placeholder="Search places or addresses..."
                    />
                  ) : (
                    <Input
                      id="event-location"
                      placeholder="123 Main St"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      maxLength={200}
                    />
                  )}
                  {(type === "restaurant" || type === "hotel" || type === "activity") && description && description.startsWith("https://www.google.com/maps") && (
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

              {type !== "travel" && type !== "shopping" && type !== "bars" && (
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <TimezoneCombobox
                    value={startTimezone}
                    onSelect={(iana) => {
                      setStartTimezone(iana);
                      setEndTimezone(iana);
                    }}
                    placeholder="Select timezone"
                  />
                </div>
              )}

              {!(type === "travel" && subType === "train") && !(type === "shopping" && !isEditing) && !(type === "bars" && !isEditing) && (
                <>
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

                  {type === "activity" && (
                    <div className="space-y-2">
                      <Label>Attachments</Label>
                      {/* Existing attachments */}
                      {attachments.length > 0 && (
                        <div className="space-y-1.5">
                          {attachments.map((att) => (
                            <div
                              key={att.id}
                              className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-1.5 text-sm"
                            >
                              {att.content_type.startsWith("image/") ? (
                                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <span className="min-w-0 flex-1 truncate">{att.file_name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {formatFileSize(att.file_size)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExistingAttachment(att.id)}
                                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Pending files */}
                      {pendingFiles.length > 0 && (
                        <div className="space-y-1.5">
                          {pendingFiles.map((file, i) => (
                            <div
                              key={`pending-${i}`}
                              className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/10 px-3 py-1.5 text-sm"
                            >
                              {file.type.startsWith("image/") ? (
                                <ImageIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              ) : (
                                <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              )}
                              <span className="min-w-0 flex-1 truncate">{file.name}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {formatFileSize(file.size)}
                              </span>
                              <button
                                type="button"
                                onClick={() => removePendingFile(i)}
                                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {attachments.length + pendingFiles.length < MAX_ATTACHMENTS && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,.pdf"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                          >
                            <Paperclip className="mr-2 h-4 w-4" />
                            Add files
                          </Button>
                        </>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Up to {MAX_ATTACHMENTS} files. Images or PDFs, 10MB max each.
                      </p>
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
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
