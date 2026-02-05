"use client";

import { useState } from "react";
import { FileText, ImageIcon, ExternalLink, Loader2 } from "lucide-react";
import type { TripEvent, EventAttachment } from "@/lib/types";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ActivityDetailCard({
  event,
  attachments,
}: {
  event: TripEvent;
  attachments?: EventAttachment[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAttachmentClick(attachment: EventAttachment) {
    setLoadingId(attachment.id);
    try {
      const res = await fetch(`/api/attachments/${attachment.id}`);
      if (!res.ok) return;
      const { url } = await res.json();
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setLoadingId(null);
    }
  }

  const hasNotes = !!event.notes;
  const hasAttachments = attachments && attachments.length > 0;

  if (!hasNotes && !hasAttachments) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/50">
      {hasNotes && (
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {event.notes}
        </p>
      )}

      {hasAttachments && (
        <div className="space-y-1.5">
          {attachments.map((att) => (
            <button
              key={att.id}
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(att);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors text-left"
            >
              {loadingId === att.id ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
              ) : att.content_type.startsWith("image/") ? (
                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="min-w-0 flex-1 truncate">{att.file_name}</span>
              <span className="shrink-0 text-xs">{formatFileSize(att.file_size)}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
