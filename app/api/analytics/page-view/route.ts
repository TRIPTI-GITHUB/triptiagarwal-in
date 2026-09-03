import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { pageViewSchema } from "@/lib/analytics/schema";

/** Records one page view and bumps the session's page_view_count. Fired on every client-side route change. */
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

  const parsed = pageViewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const values = parsed.data;

  try {
    const serviceClient = createServiceRoleClient();

    const { data: session } = await serviceClient
      .from("visitor_sessions")
      .select("id, page_view_count")
      .eq("session_key", values.sessionKey)
      .maybeSingle<{ id: string; page_view_count: number }>();

    // No matching session (admin visit that was never created, a
    // stale key, or a page-view that raced ahead of session-start) -
    // nothing to attach this view to, so no-op rather than error.
    if (!session) {
      return new NextResponse(null, { status: 204 });
    }

    await Promise.all([
      serviceClient.from("page_views").insert({ session_id: session.id, path: values.path }),
      serviceClient
        .from("visitor_sessions")
        .update({ page_view_count: session.page_view_count + 1 })
        .eq("id", session.id),
    ]);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
