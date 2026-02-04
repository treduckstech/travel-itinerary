"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { UserPlus, Check, X, Trash2, Loader2, Clock, Users, Search, Mail } from "lucide-react";
import { logActivity } from "@/lib/activity-log";
import type { Friendship } from "@/lib/types";

interface SearchResult {
  id: string;
  name: string;
}

export default function FriendsPage() {
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);

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
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) setCurrentUserId(user.id);
      });
    });
  }, [fetchFriendships]);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch {
        // Ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery]);

  async function handleSendRequest(userId: string, name: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`Friend request sent to ${name}`);
        logActivity("friend_request_sent", { user_id: userId });
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
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

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);

    try {
      const res = await fetch("/api/friends/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });

      if (res.ok) {
        toast.success("Invite sent");
        setInviteEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send invite");
      }
    } catch {
      toast.error("Failed to send invite");
    } finally {
      setInviting(false);
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

      {/* Add a friend by name search */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-medium">Add a friend</h2>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={searchOpen}
              className="w-full justify-start text-muted-foreground font-normal"
            >
              <Search className="mr-2 h-4 w-4 shrink-0" />
              Search by name...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Type a name..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList>
                {searching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                  <CommandEmpty>No users found.</CommandEmpty>
                )}
                {searchResults.length > 0 && (
                  <CommandGroup>
                    {searchResults.map((result) => (
                      <CommandItem
                        key={result.id}
                        onSelect={() => handleSendRequest(result.id, result.name)}
                        disabled={loading}
                      >
                        <UserPlus className="mr-2 h-4 w-4 shrink-0" />
                        {result.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Invite section */}
      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-medium flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Invite a friend
        </h2>
        <p className="text-xs text-muted-foreground">
          Know someone who should join? Invite them by email.
        </p>
        <form onSubmit={handleInvite} className="flex gap-2">
          <Input
            type="email"
            placeholder="friend@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={inviting || !inviteEmail.trim()}>
            {inviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Invite"
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
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{f.name ?? "Unknown"}</span>
                      <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                    </div>
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
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium">{f.name ?? "Unknown"}</span>
                        <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                      </div>
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
                No friends yet. Search for someone to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {accepted.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{f.name ?? "Unknown"}</span>
                      <p className="text-xs text-muted-foreground truncate">{f.email}</p>
                    </div>
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
