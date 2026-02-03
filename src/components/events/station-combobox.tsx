"use client";

import { useState } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { searchStations, stations, type Station } from "@/data/stations";

interface StationComboboxProps {
  value: string;
  onSelect: (code: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export function StationCombobox({
  value,
  onSelect,
  placeholder = "Select station",
  id,
  disabled,
}: StationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim() ? searchStations(query) : [];
  const selected = value
    ? stations.find((s) => s.code === value)
    : undefined;

  function displayLabel(station: Station) {
    return `${station.code} — ${station.city}`;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? displayLabel(selected) : value ? value : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by code or city..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() && results.length === 0 && (
              <CommandEmpty>No stations found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((station) => (
                  <CommandItem
                    key={station.code}
                    value={station.code}
                    onSelect={() => {
                      onSelect(station.code);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === station.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-semibold">{station.code}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      — {station.name}, {station.city}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
