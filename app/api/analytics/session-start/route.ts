import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { parseUserAgent } from "@/lib/analytics/userAgent";
import { sessionStartSchema } from "@/lib/analytics/schema";

function decodeGeoHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Creates one visitor_sessions row (and its first page_views row, for
 * the entry page) per session key. Never reads/logs the raw IP -
 * country/city come from Vercel's already-resolved x-vercel-ip-*
 * headers, plain HTTP headers injected at the edge (same technique as
 * the contact form's IP/location capture - no NextRequest.ip/.geo,
 * which this Next.js version removed).
 */
export async function POST(request: NextRequest) {
  // Don't track the site owner's own browsing (matches every other
  // /admin gate in this repo: "is there a logged-in Supabase Auth
  // user" - there's exactly one admin account, no role system).
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

  const parsed = sessionStartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const values = parsed.data;

  const { deviceType, browser, os, isBot } = parseUserAgent(request.headers.get("user-agent"));
  const country = decodeGeoHeader(request.headers.get("x-vercel-ip-country"));
  const city = decodeGeoHeader(request.headers.get("x-vercel-ip-city"));

  try {
    const serviceClient = createServiceRoleClient();

    const { data: session, error } = await serviceClient
      .from("visitor_sessions")
      .upsert(
        {
          session_key: values.sessionKey,
          entry_page: values.entryPage,
          referrer_domain: values.referrerDomain ?? null,
          utm_source: values.utmSource ?? null,
          utm_medium: values.utmMedium ?? null,
          utm_campaign: values.utmCampaign ?? null,
          country,
          city,
          device_type: deviceType,
          browser,
          os,
          is_bot: isBot,
          page_view_count: 1,
        },
        { onConflict: "session_key", ignoreDuplicates: true }
      )
      .select("id")
      .maybeSingle<{ id: string }>();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ignoreDuplicates means a repeat call for an existing session_key
    // (e.g. a second tab) returns no row here - the session already
    // exists, so there's no first page view left to record.
    if (session) {
      await serviceClient.from("page_views").insert({ session_id: session.id, path: values.entryPage });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
