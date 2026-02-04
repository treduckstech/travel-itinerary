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
import { searchTimezones, findTimezone, type TimezoneEntry } from "@/data/timezones";

interface TimezoneComboboxProps {
  value: string;
  onSelect: (iana: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export function TimezoneCombobox({
  value,
  onSelect,
  placeholder = "Select timezone",
  id,
  disabled,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = query.trim() ? searchTimezones(query) : [];
  const selected = value ? findTimezone(value) : undefined;

  function displayLabel(tz: TimezoneEntry) {
    return tz.label;
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
            placeholder="Search by city or abbreviation..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() && results.length === 0 && (
              <CommandEmpty>No timezones found.</CommandEmpty>
            )}
            {results.length > 0 && (
              <CommandGroup>
                {results.map((tz) => (
                  <CommandItem
                    key={tz.iana}
                    value={tz.iana}
                    onSelect={() => {
                      onSelect(tz.iana);
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === tz.iana ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span className="font-semibold">{tz.label}</span>
                    <span className="ml-1.5 text-muted-foreground">
                      {tz.iana}
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
