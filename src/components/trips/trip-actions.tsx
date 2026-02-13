"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareDialog } from "@/components/trips/share-dialog";
import { DeleteTripButton } from "@/components/trips/delete-trip-button";
import { MoreHorizontal, Share2, Pencil, Trash2 } from "lucide-react";

interface TripActionsProps {
  tripId: string;
  shareToken: string | null;
  eventCount: number;
  todoCount: number;
}

export function TripActions({ tripId, shareToken, eventCount, todoCount }: TripActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Trip actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setShareOpen(true)}>
            <Share2 />
            Share
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/trips/${tripId}/edit`}>
              <Pencil />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ShareDialog
        tripId={tripId}
        shareToken={shareToken}
        open={shareOpen}
        onOpenChange={setShareOpen}
      />
      <DeleteTripButton
        tripId={tripId}
        eventCount={eventCount}
        todoCount={todoCount}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
