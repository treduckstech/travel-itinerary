"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Check, X, Trash2, Loader2, Clock, Users } from "lucide-react";
import { logActivity } from "@/lib/activity-log";
import type { Friendship } from "@/lib/types";

export default function FriendsPage() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchFriendships = useCallback(async () => {
    try {
      const res = await fetch("/api/friends");
      if (res.ok) {
        const data = await res.json();
        setFriendships(data);
      }
    } catch {
      // Ignore
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchFriendships();
    // Get current user ID from Supabase
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setCurrentUserId(user.id);
      });
    });
  }, [fetchFriendships]);

  async function handleSendRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setEmail("");
        toast.success("Friend request sent");
        logActivity("friend_request_sent", { email: email.trim() });
        fetchFriendships();
      } else {
        toast.error(data.error || "Failed to send request");
      }
    } catch {
      toast.error("Failed to send request");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(id: string) {
    const res = await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "accepted" }),
    });

    if (res.ok) {
      toast.success("Friend request accepted");
      logActivity("friend_request_accepted", { friendship_id: id });
      fetchFriendships();
    } else {
      toast.error("Failed to accept request");
    }
  }

  async function handleDecline(id: string) {
    const res = await fetch(`/api/friends/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "declined" }),
    });

    if (res.ok) {
      toast.success("Friend request declined");
      fetchFriendships();
    } else {
      toast.error("Failed to decline request");
    }
  }

  async function handleRemove(id: string) {
    const res = await fetch(`/api/friends/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Friend removed");
      logActivity("friend_removed", { friendship_id: id });
      fetchFriendships();
    } else {
      toast.error("Failed to remove friend");
    }
  }

  const incoming = friendships.filter(
    (f) => f.status === "pending" && f.addressee_id === currentUserId
  );
  const outgoing = friendships.filter(
    (f) => f.status === "pending" && f.requester_id === currentUserId
  );
  const accepted = friendships.filter((f) => f.status === "accepted");

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Users className="h-5 w-5" />
        </div>
        <h1 className="font-display text-2xl font-bold">Friends</h1>
      </div>

      {/* Send request */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-medium">Add a friend</h2>
        <form onSubmit={handleSendRequest} className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={loading || !email.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>

      {fetching ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Incoming requests */}
          {incoming.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-sm font-medium">Incoming requests</h2>
              <div className="space-y-2">
                {incoming.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{f.email}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAccept(f.id)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDecline(f.id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing requests */}
          {outgoing.length > 0 && (
            <div className="space-y-3 mb-8">
              <h2 className="text-sm font-medium">Pending requests</h2>
              <div className="space-y-2">
                {outgoing.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      {f.email}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(f.id)}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted friends */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium">
              Friends{accepted.length > 0 && ` (${accepted.length})`}
            </h2>
            {accepted.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No friends yet. Send a request to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {accepted.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{f.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(f.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
