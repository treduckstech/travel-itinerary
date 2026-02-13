"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared root wrapper for all detail cards */
export function DetailCardWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("space-y-3 px-3 pb-3 pt-3 border-t border-border/40", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}

/** Shared action link - ghost-button style instead of blue underline */
export function DetailActionLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors"
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

/** Shared metadata badge */
export function DetailMetaBadge({
  icon: Icon,
  children,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground">
      {Icon && <Icon className="h-3 w-3" />}
      {children}
    </span>
  );
}

/** Shared static map image with error fallback */
export function DetailMapImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <div className="overflow-hidden rounded-md max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full h-auto"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
}
