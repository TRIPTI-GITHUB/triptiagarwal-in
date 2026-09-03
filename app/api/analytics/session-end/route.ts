import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { sessionEndSchema } from "@/lib/analytics/schema";

/**
 * Closes out a session with its final duration/exit page. Called via
 * `navigator.sendBeacon` on tab close (a normal fetch can't reliably
 * fire during unload), so this must accept a plain POST with whatever
 * Content-Type the Blob-based beacon body carries - `request.json()`
 * parses the body text as JSON regardless of that header.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    return new NextResponse(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = sessionEndSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const values = parsed.data;

  try {
    const serviceClient = createServiceRoleClient();

    await serviceClient
      .from("visitor_sessions")
      .update({
        ended_at: new Date().toISOString(),
        duration_seconds: values.durationSeconds,
        exit_page: values.exitPage ?? null,
      })
      .eq("session_key", values.sessionKey);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
