"use client";

import {
  Plane,
  Hotel,
  UtensilsCrossed,
  MapPin,
  ShoppingBag,
  Wine,
  TrainFront,
  Ship,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { EventType, TravelSubType } from "@/lib/types";

const eventTypes: { value: EventType; label: string; icon: React.ElementType }[] = [
  { value: "travel", label: "Travel", icon: Plane },
  { value: "hotel", label: "Hotel", icon: Hotel },
  { value: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { value: "activity", label: "Activity", icon: MapPin },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "bars", label: "Bars", icon: Wine },
];

const travelSubTypes: { value: TravelSubType; label: string; icon: React.ElementType }[] = [
  { value: "flight", label: "Flight", icon: Plane },
  { value: "train", label: "Train", icon: TrainFront },
  { value: "ferry", label: "Ferry", icon: Ship },
  { value: "drive", label: "Drive", icon: Car },
];

interface EventTypePickerProps {
  type: EventType;
  subType: TravelSubType;
  onTypeChange: (type: EventType) => void;
  onSubTypeChange: (subType: TravelSubType) => void;
  disabled?: boolean;
}

export function EventTypePicker({
  type,
  subType,
  onTypeChange,
  onSubTypeChange,
  disabled,
}: EventTypePickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {eventTypes.map((et) => {
          const Icon = et.icon;
          const selected = type === et.value;
          return (
            <button
              key={et.value}
              type="button"
              disabled={disabled}
              onClick={() => onTypeChange(et.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                "border",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {et.label}
            </button>
          );
        })}
      </div>

      <Collapsible open={type === "travel"}>
        <CollapsibleContent>
          <div className="flex flex-wrap gap-2 pt-1">
            {travelSubTypes.map((st) => {
              const Icon = st.icon;
              const selected = subType === st.value;
              return (
                <button
                  key={st.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSubTypeChange(st.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    "border",
                    selected
                      ? "border-foreground/80 bg-foreground/10 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-foreground/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {st.label}
                </button>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
