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
import type { BenEatsRestaurant } from "@/lib/types";

interface RestaurantSearchProps {
  value: string;
  onSelect: (restaurant: BenEatsRestaurant) => void;
  onManualEntry: (name: string) => void;
  placeholder?: string;
  id?: string;
}

export function RestaurantSearch({
  value,
  onSelect,
  onManualEntry,
  placeholder = "Search restaurants...",
  id,
}: RestaurantSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BenEatsRestaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/restaurants/search?q=${encodeURIComponent(q.trim())}`);
      if (res.status === 503) {
        setApiAvailable(false);
        setResults([]);
        return;
      }
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data: BenEatsRestaurant[] = await res.json();
      setResults(data);
    } catch {
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

  function formatSubline(r: BenEatsRestaurant) {
    const parts: string[] = [];
    if (r.cuisine_type) parts.push(r.cuisine_type);
    if (r.city) parts.push(r.city);
    return parts.join(" · ");
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
            placeholder="Type a restaurant name..."
            value={query}
            onValueChange={handleQueryChange}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!loading && query.trim() && results.length === 0 && apiAvailable && (
              <CommandEmpty>No restaurants found.</CommandEmpty>
            )}
            {query.trim() && (
              <CommandGroup>
                {results.map((r) => (
                  <CommandItem
                    key={r.id}
                    value={String(r.id)}
                    onSelect={() => {
                      onSelect(r);
                      setOpen(false);
                      setQuery("");
                      setResults([]);
                    }}
                  >
                    <div className="min-w-0">
                      <span className="font-semibold">{r.name}</span>
                      {formatSubline(r) && (
                        <span className="ml-1.5 text-muted-foreground">
                          — {formatSubline(r)}
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
