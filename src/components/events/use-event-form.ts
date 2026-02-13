"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { airports } from "@/data/airports";
import { stations } from "@/data/stations";
import { parseTimezone, buildTimezone, getBrowserTimezone, naiveToUtc, utcToNaive } from "@/lib/timezone";
import { extractCityFromAddress } from "@/lib/address";
import { logActivity } from "@/lib/activity-log";
import type { TripEvent, EventType, TravelSubType, FlightLookupResult, BenEatsRestaurant, PlaceResult, EventAttachment } from "@/lib/types";

export function useEventForm(tripId: string, event?: TripEvent, onClose?: () => void) {
  const [open, setOpen] = useState(false);

  function closeDialog() {
    setOpen(false);
    onClose?.();
  }
  const [type, setType] = useState<EventType>(event?.type ?? "activity");
  const [subType, setSubType] = useState<TravelSubType>(
    (event?.sub_type as TravelSubType) ?? "flight"
  );
  const [title, setTitle] = useState(event?.title ?? "");
  const [startDatetime, setStartDatetime] = useState(() => {
    if (!event?.start_datetime) return "";
    if (event.type === "shopping" || event.type === "bars") return "";
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
    if (event.type === "shopping" || event.type === "bars") return "";
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
  const [flightDate, setFlightDate] = useState("");
  const [depAirport, setDepAirport] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "flight" && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [arrAirport, setArrAirport] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "flight" && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
      return parts[1] || "";
    }
    return "";
  });
  const [depStation, setDepStation] = useState(() => {
    if (event?.type === "travel" && (event.sub_type === "train" || event.sub_type === "ferry") && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [arrStation, setArrStation] = useState(() => {
    if (event?.type === "travel" && (event.sub_type === "train" || event.sub_type === "ferry") && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
      return parts[1] || "";
    }
    return "";
  });
  const [driveFrom, setDriveFrom] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
      return parts[0] || "";
    }
    return "";
  });
  const [driveTo, setDriveTo] = useState(() => {
    if (event?.type === "travel" && event.sub_type === "drive" && event.location) {
      const parts = event.location.split("\u2192").map((s) => s.trim());
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

  // Load existing attachments when editing an activity/train event
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

  function resetForm() {
    if (!isEditing) {
      setType("activity");
      setSubType("flight");
      setTitle("");
      setStartDatetime("");
      setEndDatetime("");
      setLocation("");
      setNotes("");
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

      toast.success(flightDate ? "Flight found" : "Flight found \u2014 enter your departure date and time");
    } catch {
      setError("Failed to look up flight");
    } finally {
      setLookupLoading(false);
    }
  }

  function getTravelLocation(): string | null {
    if (subType === "flight") {
      return [depAirport, arrAirport].filter(Boolean).join(" \u2192 ") || null;
    }
    if (subType === "train" || subType === "ferry") {
      return [depStation, arrStation].filter(Boolean).join(" \u2192 ") || null;
    }
    if (subType === "drive") {
      return [driveFrom, driveTo].filter(Boolean).join(" \u2192 ") || null;
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

    const city = shoppingStore.address
      ? extractCityFromAddress(shoppingStore.address)
      : null;
    const cityTitle = city || "Shopping";

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

    const googleUrl = shoppingStore.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shoppingStore.name)}&query_place_id=${shoppingStore.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([shoppingStore.name, shoppingStore.address].filter(Boolean).join(", "))}`;

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
    closeDialog();
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

    const city = barVenue.address
      ? extractCityFromAddress(barVenue.address)
      : null;
    const cityTitle = city || "Bars";

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

    const googleUrl = barVenue.id
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barVenue.name)}&query_place_id=${barVenue.id}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([barVenue.name, barVenue.address].filter(Boolean).join(", "))}`;

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
    closeDialog();
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
        ? `${driveFrom} \u2192 ${driveTo}`
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

    if ((type === "activity" || (type === "travel" && subType === "train")) && pendingFiles.length > 0) {
      await uploadPendingFiles(savedEventId);
    }

    if (!isEditing) {
      logActivity("event_added", { trip_id: tripId, type, title: finalTitle });
    }

    setLoading(false);
    closeDialog();
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

  function handleActivityPlaceSelect(place: PlaceResult) {
    setLocation(place.address || place.name);
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

  function handleDriveOriginSelect(place: PlaceResult) {
    setDriveFrom(place.name);
    setDriveFromAddress(place.address || place.name);
    const destAddr = driveToAddress || driveTo;
    if (destAddr) fetchDriveTime(place.address || place.name, destAddr);
    if (place.lat && place.lng) {
      fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => { if (tz) setStartTimezone(tz); });
    }
  }

  function handleDriveDestSelect(place: PlaceResult) {
    setDriveTo(place.name);
    setDriveToAddress(place.address || place.name);
    const origAddr = driveFromAddress || driveFrom;
    if (origAddr) fetchDriveTime(origAddr, place.address || place.name);
    if (place.lat && place.lng) {
      fetchTimezoneFromCoords(place.lat, place.lng).then((tz) => { if (tz) setEndTimezone(tz); });
    }
  }

  function handleDriveOriginManual(name: string) {
    setDriveFrom(name);
    setDriveFromAddress(name);
    const destAddr = driveToAddress || driveTo;
    if (destAddr) fetchDriveTime(name, destAddr);
  }

  function handleDriveDestManual(name: string) {
    setDriveTo(name);
    setDriveToAddress(name);
    const origAddr = driveFromAddress || driveFrom;
    if (origAddr) fetchDriveTime(origAddr, name);
  }

  function handleDepAirportSelect(iata: string) {
    setDepAirport(iata);
    const tz = lookupAirportTimezone(iata);
    if (tz) setStartTimezone(tz);
  }

  function handleArrAirportSelect(iata: string) {
    setArrAirport(iata);
    const tz = lookupAirportTimezone(iata);
    if (tz) setEndTimezone(tz);
  }

  function handleDepStationSelect(code: string) {
    setDepStation(code);
    const tz = lookupStationTimezone(code);
    if (tz) setStartTimezone(tz);
  }

  function handleArrStationSelect(code: string) {
    setArrStation(code);
    const tz = lookupStationTimezone(code);
    if (tz) setEndTimezone(tz);
  }

  return {
    // Dialog state
    open, setOpen,

    // Type state
    type, setType, subType, setSubType,

    // Core fields
    title, setTitle,
    startDatetime, setStartDatetime,
    endDatetime, setEndDatetime,
    location, setLocation,
    notes, setNotes,
    confirmationNumber, setConfirmationNumber,
    description, setDescription,

    // Flight state
    flightDate, setFlightDate,
    depAirport, arrAirport,
    lookupLoading, flightDuration,

    // Station state
    depStation, arrStation,

    // Drive state
    driveFrom, driveTo,
    driveFromAddress, driveToAddress,
    driveDuration, driveLoading,

    // Train state
    trainOperator, setTrainOperator,
    trainClass, setTrainClass,
    trainCoach, setTrainCoach,
    trainSeat, setTrainSeat,

    // Timezone
    startTimezone, setStartTimezone,
    endTimezone, setEndTimezone,

    // Attachments
    attachments, pendingFiles, fileInputRef,
    MAX_ATTACHMENTS,

    // Shopping / bars
    shoppingStore, setShoppingStore,
    shoppingCategory, setShoppingCategory,
    barVenue, setBarVenue,
    barNote, setBarNote,

    // Status
    error, setError, loading, isEditing,

    // Handlers
    handleSubmit,
    handleFlightLookup,
    handleDepartureChange,
    handleRestaurantSelect,
    handleHotelSelect,
    handleActivityPlaceSelect,
    handleDriveOriginSelect,
    handleDriveDestSelect,
    handleDriveOriginManual,
    handleDriveDestManual,
    handleDepAirportSelect,
    handleArrAirportSelect,
    handleDepStationSelect,
    handleArrStationSelect,
    handleFileSelect,
    removePendingFile,
    removeExistingAttachment,
    formatFileSize,
    resetForm,
    fetchDriveTime,
  };
}

export type EventFormState = ReturnType<typeof useEventForm>;
