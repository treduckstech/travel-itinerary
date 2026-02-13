"use client";

import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, ImageIcon } from "lucide-react";
import type { EventAttachment } from "@/lib/types";
import type { EventFormState } from "../use-event-form";

interface AttachmentFieldProps {
  attachments: EventAttachment[];
  pendingFiles: File[];
  maxAttachments: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelect: EventFormState["handleFileSelect"];
  onRemovePending: EventFormState["removePendingFile"];
  onRemoveExisting: EventFormState["removeExistingAttachment"];
  formatFileSize: EventFormState["formatFileSize"];
}

export function AttachmentField({
  attachments,
  pendingFiles,
  maxAttachments,
  fileInputRef,
  onFileSelect,
  onRemovePending,
  onRemoveExisting,
  formatFileSize,
}: AttachmentFieldProps) {
  return (
    <div className="space-y-2">
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
                onClick={() => onRemoveExisting(att.id)}
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
                onClick={() => onRemovePending(i)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      {attachments.length + pendingFiles.length < maxAttachments && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            onChange={onFileSelect}
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
        Up to {maxAttachments} files. Images or PDFs, 10MB max each.
      </p>
    </div>
  );
}
