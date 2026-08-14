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
      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brand-charcoal flex items-center justify-center shadow"
    >
      <DoorOpen size={16} />
    </Link>
  );
}
