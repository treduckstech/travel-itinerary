"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function FormSection({ title, collapsible, defaultOpen = true, children }: FormSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  if (!collapsible) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {children}
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        {title}
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 pt-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
