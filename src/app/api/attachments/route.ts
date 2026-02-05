import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_ATTACHMENTS = 5;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const eventId = formData.get("event_id") as string | null;
  const tripId = formData.get("trip_id") as string | null;

  if (!file || !eventId || !tripId) {
    return NextResponse.json(
      { error: "file, event_id, and trip_id are required" },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "File type not allowed. Accepted: JPEG, PNG, WebP, HEIC, PDF" },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB" },
      { status: 400 }
    );
  }

  // Verify user has access to the trip (owner or shared editor)
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", tripId)
    .single();

  if (!trip) {
    return NextResponse.json({ error: "Trip not found or access denied" }, { status: 403 });
  }

  // Verify event belongs to this trip
  const { data: event } = await supabase
    .from("events")
    .select("id, trip_id")
    .eq("id", eventId)
    .eq("trip_id", tripId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Check attachment count limit
  const { count } = await supabase
    .from("event_attachments")
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId);

  if ((count ?? 0) >= MAX_ATTACHMENTS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ATTACHMENTS} attachments per event` },
      { status: 400 }
    );
  }

  // Upload to Supabase Storage
  const fileId = crypto.randomUUID();
  const storagePath = `${tripId}/${eventId}/${fileId}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("event-attachments")
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }

  // Insert DB record
  const { data: attachment, error: dbError } = await supabase
    .from("event_attachments")
    .insert({
      event_id: eventId,
      file_name: file.name,
      storage_path: storagePath,
      content_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  if (dbError) {
    // Clean up uploaded file
    await supabase.storage.from("event-attachments").remove([storagePath]);
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json(attachment, { status: 201 });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const attachmentId = searchParams.get("id");

  if (!attachmentId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Fetch attachment (RLS ensures user has access)
  const { data: attachment } = await supabase
    .from("event_attachments")
    .select("id, storage_path")
    .eq("id", attachmentId)
    .single();

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  // Delete from storage
  await supabase.storage
    .from("event-attachments")
    .remove([attachment.storage_path]);

  // Delete DB record
  const { error } = await supabase
    .from("event_attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
