"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { logActivity } from "@/lib/activity-log";

interface DeleteTripButtonProps {
  tripId: string;
  eventCount?: number;
  todoCount?: number;
}

export function DeleteTripButton({ tripId, eventCount = 0, todoCount = 0 }: DeleteTripButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleDelete() {
    setLoading(true);
    const { error } = await supabase.from("trips").delete().eq("id", tripId);
    if (error) {
      toast.error("Failed to delete trip");
      setLoading(false);
      return;
    }
    toast.success("Trip deleted");
    logActivity("trip_deleted", { trip_id: tripId });
    router.push("/");
    router.refresh();
  }

  const details: string[] = [];
  if (eventCount > 0) details.push(`${eventCount} event${eventCount === 1 ? "" : "s"}`);
  if (todoCount > 0) details.push(`${todoCount} todo${todoCount === 1 ? "" : "s"}`);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Trip
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Delete Trip</DialogTitle>
          <DialogDescription>
            This will permanently delete this trip
            {details.length > 0
              ? ` along with ${details.join(" and ")}`
              : ""
            }. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
