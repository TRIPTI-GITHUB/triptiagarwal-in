"use client";

import { useState } from "react";
import { MapPin, ChevronDown } from "lucide-react";
import type { TeleportTarget } from "@/components/museum/TeleportExecutor";

export interface TeleportDestination extends TeleportTarget {
  label: string;
}

interface TeleportMenuProps {
  destinations: TeleportDestination[];
  onSelect: (destination: TeleportDestination) => void;
}

/**
 * TeleportMenu
 * Standing accessibility option (section 13) - instantly jumps the
 * visitor to any room, no walking animation, for vestibular sensitivity
 * or motion-sickness risk. Deliberately a plain, always-visible top-bar
 * button rather than a settings menu, per "exposed clearly at the
 * lobby, not buried in a settings menu" - it's present everywhere, not
 * just there, so it's just as reachable mid-tour or deep in a room.
 */
export function TeleportMenu({ destinations, onSelect }: TeleportMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Teleport: jump instantly to a room"
        title="Teleport - jump instantly to a room, no walking animation"
        className="px-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow flex items-center gap-1.5"
      >
        <MapPin size={14} />
        Teleport
        <ChevronDown size={14} className={"transition-transform duration-200 " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Teleport destinations"
          className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden py-1 z-20"
        >
          {destinations.map((destination) => (
            <button
              key={destination.label}
              role="menuitem"
              onClick={() => {
                onSelect(destination);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-brand-charcoal hover:bg-brand-cream"
            >
              {destination.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
