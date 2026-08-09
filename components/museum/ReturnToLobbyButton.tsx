"use client";

import { Home } from "lucide-react";

interface ReturnToLobbyButtonProps {
  onReturn: () => void;
}

/**
 * ReturnToLobbyButton
 * "Return-to-lobby is always one action away" (Museum Navigation,
 * section 3) - a single, always-visible control (also bound to the
 * Home key in RoomMuseumScene) distinct from TeleportMenu's dropdown,
 * so getting back to the start never requires opening a menu first.
 * Reuses the same instant jump TeleportExecutor already provides -
 * getting out of a deep gallery is the "I'm lost" panic button, and an
 * instant cut there is the expected, standard behavior even though
 * normal room-to-room flow (section 8) deliberately avoids cuts.
 */
export function ReturnToLobbyButton({ onReturn }: ReturnToLobbyButtonProps) {
  return (
    <button
      onClick={onReturn}
      aria-label="Return to lobby (Home key)"
      title="Return to lobby - Home key"
      className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brand-charcoal flex items-center justify-center shadow"
    >
      <Home size={16} />
    </button>
  );
}
