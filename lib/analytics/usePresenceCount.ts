"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LIVE_VISITORS_PRESENCE_CHANNEL } from "@/lib/analytics/presence";

/**
 * Admin-only: subscribes to the live-visitor presence channel and
 * returns the current count. Read-only - doesn't call track() itself,
 * so viewing the dashboard never inflates the count with the admin's
 * own tab.
 */
export function useLiveVisitorCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(LIVE_VISITORS_PRESENCE_CHANNEL);

    channel
      .on("presence", { event: "sync" }, () => {
        setCount(Object.keys(channel.presenceState()).length);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
