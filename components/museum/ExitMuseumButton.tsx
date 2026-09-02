"use client";

import Link from "next/link";
import { DoorOpen } from "lucide-react";

/**
 * ExitMuseumButton
 * LOBBY REMOVED (2026-08-13): replaces ReturnToLobbyButton (left fully
 * intact, unused, for restoration) now that there's no lobby to
 * teleport back to. This is a real page navigation - Link, not a
 * teleport - back to the 2D exhibit listing, not an in-scene move.
 * Also bound to the Home key in RoomMuseumScene.tsx, same "one action
 * away" principle the old lobby-return button followed.
 */
export function ExitMuseumButton() {
  return (
    <Link
      href="/museum"
      aria-label="Exit museum (Home key)"
      title="Exit museum - Home key"
      className="flex items-center gap-1.5 pl-3 pr-4 py-2 rounded-full bg-white/90 hover:bg-white text-brand-charcoal text-xs font-medium shadow"
    >
      <DoorOpen size={16} />
      Exit
    </Link>
  );
}
