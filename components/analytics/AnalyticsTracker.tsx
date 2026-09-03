"use client";

import { useAnalyticsTracking } from "@/lib/analytics/useAnalyticsTracking";

/**
 * Renders nothing - just runs the tracking hook. A legitimate
 * exception to "Server Components by default": this is inherently a
 * browser-side event stream (sessionStorage, sendBeacon, route
 * changes), mounted once from the root layout.
 */
export function AnalyticsTracker() {
  useAnalyticsTracking();
  return null;
}
