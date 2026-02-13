"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Share2, Copy, Link2, Link2Off, Trash2, UserPlus, Users, Loader2 } from "lucide-react";
import type { TripShare, Friendship } from "@/lib/types";
import { logActivity } from "@/lib/activity-log";

interface ShareDialogProps {
  tripId: string;
  shareToken: string | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ShareDialog({ tripId, shareToken, open: controlledOpen, onOpenChange }: ShareDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [shares, setShares] = useState<TripShare[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState(shareToken);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [sharingFriendId, setSharingFriendId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetch(`/api/trips/${tripId}/shares`)
        .then((res) => (res.ok ? res.json() : []))
        .then(setShares);

      setFriendsLoading(true);
      fetch("/api/friends")
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Friendship[]) => {
          setFriends(data.filter((f) => f.status === "accepted"));
        })
        .finally(() => setFriendsLoading(false));

      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setCurrentUserId(user.id);
      });
    }
  }, [open, tripId, supabase.auth]);

  async function fetchShares() {
    const res = await fetch(`/api/trips/${tripId}/shares`);
    if (res.ok) {
      setShares(await res.json());
    }
  }

  async function handleAddShare(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const res = await fetch(`/api/trips/${tripId}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    if (res.ok) {
      setEmail("");
      toast.success("Trip shared");
      logActivity("share_created", { trip_id: tripId, shared_with: email.trim() });
      fetchShares();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to share");
    }
    setLoading(false);
  }

  async function handleRemoveShare(shareId: string) {
    const res = await fetch(
      `/api/trips/${tripId}/shares?shareId=${shareId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setShares((prev) => prev.filter((s) => s.id !== shareId));
      toast.success("Share removed");
      logActivity("share_revoked", { trip_id: tripId, share_id: shareId });
    } else {
      toast.error("Failed to remove share");
    }
  }

  async function handleGenerateToken() {
    setTokenLoading(true);
    const token = crypto.randomUUID();
    const { error } = await supabase
      .from("trips")
      .update({ share_token: token })
      .eq("id", tripId);

    if (error) {
      toast.error("Failed to generate link");
    } else {
      setCurrentToken(token);
      toast.success("Public link created");
      logActivity("public_link_generated", { trip_id: tripId });
      router.refresh();
    }
    setTokenLoading(false);
  }

  async function handleRevokeToken() {
    setTokenLoading(true);
    const { error } = await supabase
      .from("trips")
      .update({ share_token: null })
      .eq("id", tripId);

    if (error) {
      toast.error("Failed to revoke link");
    } else {
      setCurrentToken(null);
      toast.success("Public link revoked");
      logActivity("public_link_revoked", { trip_id: tripId });
      router.refresh();
    }
    setTokenLoading(false);
  }

  async function handleShareWithFriend(friendId: string, friendName: string, friendshipId: string) {
    setSharingFriendId(friendshipId);
    const res = await fetch(`/api/trips/${tripId}/shares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: friendId }),
    });

    if (res.ok) {
      toast.success(`Shared with ${friendName}`);
      logActivity("share_created", { trip_id: tripId, shared_with: friendId });
      fetchShares();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to share");
    }
    setSharingFriendId(null);
  }

  function copyPublicLink() {
    if (!currentToken) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/share/${currentToken}`
    );
    toast.success("Link copied to clipboard");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Share Trip</DialogTitle>
          <DialogDescription>
            Invite others to view and edit this trip, or create a public read-only link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick share with friends */}
          {(friendsLoading || friends.length > 0) && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5" />
                Share with friends
              </h4>
              {friendsLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Loading friends...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {friends.map((friend) => {
                    const friendUserId =
                      friend.requester_id === currentUserId
                        ? friend.addressee_id
                        : friend.requester_id;
                    const alreadyShared = shares.some(
                      (s) => s.shared_with_user_id === friendUserId
                    );
                    return (
                      <Button
                        key={friend.id}
                        variant={alreadyShared ? "secondary" : "outline"}
                        size="sm"
                        disabled={alreadyShared || sharingFriendId === friend.id}
                        onClick={() =>
                          handleShareWithFriend(friendUserId, friend.name ?? "Friend", friend.id)
                        }
                      >
                        {sharingFriendId === friend.id ? (
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        ) : null}
                        {friend.name ?? friend.email}
                        {alreadyShared && " (shared)"}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Invite by email */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Invite by email</h4>
            <form onSubmit={handleAddShare} className="flex gap-2">
              <Input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={loading || !email.trim()}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </form>

            {shares.length > 0 && (
              <div className="space-y-2">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <span className="text-sm">{share.shared_with_email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Public link */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Public link</h4>
            {currentToken ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={`${typeof window !== "undefined" ? window.location.origin : ""}/share/${currentToken}`}
                    className="text-xs"
                  />
                  <Button variant="outline" size="sm" onClick={copyPublicLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRevokeToken}
                  disabled={tokenLoading}
                  className="text-destructive hover:text-destructive"
                >
                  <Link2Off className="mr-2 h-4 w-4" />
                  Revoke link
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateToken}
                disabled={tokenLoading}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Generate public link
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              Anyone with the link can view this trip (read-only).
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
