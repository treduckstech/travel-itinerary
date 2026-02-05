import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch attachment (RLS ensures user has access)
  const { data: attachment } = await supabase
    .from("event_attachments")
    .select("storage_path, file_name, content_type")
    .eq("id", id)
    .single();

  if (!attachment) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  // Create signed URL (valid for 1 hour)
  const { data: signedUrlData, error } = await supabase.storage
    .from("event-attachments")
    .createSignedUrl(attachment.storage_path, 3600);

  if (error || !signedUrlData?.signedUrl) {
    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: signedUrlData.signedUrl });
}
