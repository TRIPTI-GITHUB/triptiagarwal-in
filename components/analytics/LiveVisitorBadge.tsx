"use client";

import { useLiveVisitorCount } from "@/lib/analytics/usePresenceCount";

export function LiveVisitorBadge() {
  const count = useLiveVisitorCount();
  return (
    <div className="border border-brand-gold/20 rounded-sm bg-white px-5 py-4">
      <dt className="text-sm text-brand-charcoal/60 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" aria-hidden="true" />
        Live visitors
      </dt>
      <dd className="text-3xl font-semibold text-brand-charcoal mt-1">{count}</dd>
    </div>
  );
}
