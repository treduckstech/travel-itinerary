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
import { searchAirports, airports, type Airport } from "@/data/airports";

interface AirportComboboxProps {
  value: string;
  onSelect: (iata: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export function AirportCombobox({
  value,
  onSelect,
  placeholder = "Select airport",
  id,
  disabled,
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim() ? searchAirports(query) : [];
  const selected = value
    ? airports.find((a) => a.iata === value)
    : undefined;

  function displayLabel(airport: Airport) {
    return `${airport.iata} — ${airport.city}`;
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
              <CommandEmpty>No airports found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((airport) => (
                  <CommandItem
                    key={airport.iata}
                    value={airport.iata}
                    onSelect={() => {
                      onSelect(airport.iata);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === airport.iata ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-semibold">{airport.iata}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      — {airport.name}, {airport.city}
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
