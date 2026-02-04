"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface UserDetail {
  id: string;
  email: string;
  created_at: string;
  provider: string;
  trips: { id: string; name: string; destination: string; start_date: string }[];
  events_count: number;
  shares: { id: string; trip_id: string; shared_with_email: string; trip_name?: string }[];
  todos_count: number;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [tripsExpanded, setTripsExpanded] = useState(false);
  const [sharesExpanded, setSharesExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/admin/users/${id}`)
      .then((res) => res.json())
      .then(setUser)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDeleteUser() {
    setDeleteLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("User deleted");
      router.push("/admin/users");
    } else {
      toast.error("Failed to delete user");
    }
    setDeleteLoading(false);
  }

  async function handleDeleteTrip(tripId: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_trip", trip_id: tripId }),
    });
    if (res.ok) {
      setUser((prev) =>
        prev
          ? { ...prev, trips: prev.trips.filter((t) => t.id !== tripId) }
          : prev
      );
      toast.success("Trip deleted");
    } else {
      toast.error("Failed to delete trip");
    }
  }

  async function handleRemoveShare(shareId: string) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove_share", share_id: shareId }),
    });
    if (res.ok) {
      setUser((prev) =>
        prev
          ? { ...prev, shares: prev.shares.filter((s) => s.id !== shareId) }
          : prev
      );
      toast.success("Share removed");
    } else {
      toast.error("Failed to remove share");
    }
  }

  if (loading) {
    return (
      <div>
        <div className="h-8 w-48 animate-pulse rounded bg-muted mb-6" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCard key={i} label="" value={null} loading />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return <p className="text-muted-foreground">User not found.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary">
          {user.email?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <h1 className="font-display text-2xl">{user.email}</h1>
          <p className="text-sm text-muted-foreground">
            {user.provider} &middot; Joined{" "}
            {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Trips" value={user.trips.length} />
        <StatCard label="Events" value={user.events_count} />
        <StatCard label="Shares" value={user.shares.length} />
        <StatCard label="Todos" value={user.todos_count} />
      </div>

      {/* Trips */}
      <div className="mb-6 rounded-xl border bg-card">
        <button
          onClick={() => setTripsExpanded(!tripsExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          Trips ({user.trips.length})
          {tripsExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {tripsExpanded && (
          <div className="border-t">
            {user.trips.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No trips</p>
            ) : (
              user.trips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between border-b px-4 py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{trip.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {trip.destination} &middot; {trip.start_date}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTrip(trip.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Shares */}
      <div className="mb-8 rounded-xl border bg-card">
        <button
          onClick={() => setSharesExpanded(!sharesExpanded)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium"
        >
          Shares ({user.shares.length})
          {sharesExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        {sharesExpanded && (
          <div className="border-t">
            {user.shares.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">No shares</p>
            ) : (
              user.shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between border-b px-4 py-3 last:border-0"
                >
                  <div>
                    <p className="text-sm">{share.shared_with_email}</p>
                    {share.trip_name && (
                      <p className="text-xs text-muted-foreground">
                        {share.trip_name}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveShare(share.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl border border-destructive/30 bg-card p-6">
        <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete this user and all their data.
        </p>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Delete User</DialogTitle>
              <DialogDescription>
                This will permanently delete {user.email} and all their trips,
                events, shares, and todos. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
