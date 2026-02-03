"use client";

import { useState, useRef, useCallback } from "react";
import { ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import type { PlaceResult } from "@/lib/types";

interface PlaceSearchProps {
  value: string;
  onSelect: (place: PlaceResult) => void;
  onManualEntry: (name: string) => void;
  placeholder?: string;
  id?: string;
}

export function PlaceSearch({
  value,
  onSelect,
  onManualEntry,
  placeholder = "Search places...",
  id,
}: PlaceSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearchError(null);
      return;
    }

    setLoading(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/places/search?q=${encodeURIComponent(q.trim())}`);
      if (res.status === 503) {
        setApiAvailable(false);
        setResults([]);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Search failed" }));
        setSearchError(data.error || "Search failed");
        setResults([]);
        return;
      }
      const data: PlaceResult[] = await res.json();
      setResults(data);
    } catch {
      setSearchError("Failed to search");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleQueryChange(q: string) {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!apiAvailable) return;
    debounceRef.current = setTimeout(() => search(q), 300);
  }

  if (!apiAvailable) {
    return (
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onManualEntry(e.target.value)}
        maxLength={200}
      />
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a place name..."
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && searchError && (
              <div className="px-3 py-4 text-sm text-destructive">
                {searchError}
              </div>
            )}
            {!loading && !searchError && query.trim() && results.length === 0 && (
              <CommandEmpty>No places found.</CommandEmpty>
            )}
            {query.trim() && (
              <CommandGroup>
                {results.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.id}
                    onSelect={() => {
                      onSelect(p);
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    <div className="min-w-0">
                      <span className="font-semibold">{p.name}</span>
                      {p.address && (
                        <span className="ml-1.5 text-muted-foreground">
                          -- {p.address}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
                <CommandItem
                  value="__manual__"
                  onSelect={() => {
                    onManualEntry(query.trim());
                    setOpen(false);
                    setQuery("");
                    setResults([]);
                  }}
                >
                  <span className="text-muted-foreground">
                    Enter &ldquo;{query.trim()}&rdquo; manually
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
