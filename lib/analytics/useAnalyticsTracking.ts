"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LIVE_VISITORS_PRESENCE_CHANNEL } from "@/lib/analytics/presence";

const SESSION_STORAGE_KEY = "analytics-session-key";

/**
 * sessionStorage only - never localStorage, never a cookie. The key
 * must not survive past the tab closing or be shared cross-site, and
 * never links to a signed-in identity.
 */
function getOrCreateSessionKey(): string {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;
  const key = crypto.randomUUID();
  sessionStorage.setItem(SESSION_STORAGE_KEY, key);
  return key;
}

async function safePost(url: string, payload: unknown): Promise<void> {
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Ad blockers, offline, whatever - analytics must never be able to break the site.
  }
}

function refererHostname(): string | undefined {
  try {
    return document.referrer ? new URL(document.referrer).hostname : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Mounted once (via components/analytics/AnalyticsTracker.tsx in the
 * root layout). Deliberately avoids next/navigation's useSearchParams
 * - reading window.location.search directly instead - since that hook
 * requires a Suspense boundary and would otherwise push every page on
 * the site into dynamic rendering just to capture UTM params once per
 * session.
 */
export function useAnalyticsTracking() {
  const pathname = usePathname();
  const sessionKeyRef = useRef<string | null>(null);
  // Real value is set inside the effect below (Date.now() is impure,
  // so it can't be called directly during render as the ref's initial value).
  const sessionStartedAtRef = useRef<number>(0);
  const isFirstPathRef = useRef(true);

  useEffect(() => {
    let key: string;
    try {
      key = getOrCreateSessionKey();
    } catch {
      return; // sessionStorage unavailable (private browsing, etc.) - no tracking this visit, no error either
    }
    sessionKeyRef.current = key;
    sessionStartedAtRef.current = Date.now();

    const params = new URLSearchParams(window.location.search);
    safePost("/api/analytics/session-start", {
      sessionKey: key,
      entryPage: window.location.pathname,
      referrerDomain: refererHostname(),
      utmSource: params.get("utm_source") ?? undefined,
      utmMedium: params.get("utm_medium") ?? undefined,
      utmCampaign: params.get("utm_campaign") ?? undefined,
    });

    function handleUnload() {
      if (!sessionKeyRef.current) return;
      const durationSeconds = Math.round((Date.now() - sessionStartedAtRef.current) / 1000);
      const payload = JSON.stringify({
        sessionKey: sessionKeyRef.current,
        exitPage: window.location.pathname,
        durationSeconds,
      });
      navigator.sendBeacon("/api/analytics/session-end", new Blob([payload], { type: "application/json" }));
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") handleUnload();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handleUnload);

    // Live visitor count (Admin Console) - in-memory presence only,
    // entirely separate from the database writes above. Skips the
    // admin's own tab too, same exclusion as the write path, checked
    // client-side here since presence has no server round-trip to
    // check it in.
    const supabase = createClient();
    let presenceChannel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) return;
      presenceChannel = supabase.channel(LIVE_VISITORS_PRESENCE_CHANNEL, {
        config: { presence: { key } },
      });
      presenceChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          presenceChannel?.track({ online_at: new Date().toISOString() });
        }
      });
    });

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handleUnload);
      if (presenceChannel) supabase.removeChannel(presenceChannel);
    };
  }, []);

  useEffect(() => {
    // The first path is already recorded as entryPage by session-start above.
    if (isFirstPathRef.current) {
      isFirstPathRef.current = false;
      return;
    }
    if (!sessionKeyRef.current) return;
    safePost("/api/analytics/page-view", { sessionKey: sessionKeyRef.current, path: pathname });
  }, [pathname]);
}
