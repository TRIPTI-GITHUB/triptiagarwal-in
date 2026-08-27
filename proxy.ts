import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed the `middleware.ts` file convention to `proxy.ts`
// (function renamed `middleware` -> `proxy`) - this file is the
// current convention, not the deprecated one.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Scoped to /admin only - the rest of the site has no auth-dependent
  // pages and shouldn't pay for a session-refresh round trip on every request.
  matcher: ["/admin/:path*"],
};
