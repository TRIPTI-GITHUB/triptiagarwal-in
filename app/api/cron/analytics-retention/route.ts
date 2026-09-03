import { NextResponse, type NextRequest } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";

const RETENTION_MONTHS = 18;
const STALE_SESSION_HOURS = 6;

interface OldSessionRow {
  id: string;
  started_at: string;
  duration_seconds: number | null;
  country: string | null;
  referrer_domain: string | null;
}

function tallyWithKey(values: (string | null)[], keyName: string): Record<string, string | number>[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([value, count]) => ({ [keyName]: value, count }))
    .sort((a, b) => (b.count as number) - (a.count as number))
    .slice(0, 10);
}

/**
 * Nightly Vercel Cron job (see vercel.json). Idempotent: a rollup
 * insert that finds an existing row for that day just skips it (or,
 * under a race, treats a duplicate-key error as "already handled"),
 * so running this twice in a day never double-counts or errors.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return await runRetentionJob();
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Something went wrong." }, { status: 500 });
  }
}

async function runRetentionJob(): Promise<NextResponse> {
  const supabase = createServiceRoleClient();

  // 1. Close out sessions that never got a proper session-end beacon
  // (tab crashed, device lost power, etc.), using their last page
  // view as the estimated end time.
  const staleCutoff = new Date(Date.now() - STALE_SESSION_HOURS * 60 * 60 * 1000).toISOString();
  const { data: staleSessions, error: staleError } = await supabase
    .from("visitor_sessions")
    .select("id, started_at")
    .is("ended_at", null)
    .lt("started_at", staleCutoff)
    .returns<Pick<OldSessionRow, "id" | "started_at">[]>();

  if (staleError) {
    return NextResponse.json({ error: staleError.message }, { status: 500 });
  }

  for (const session of staleSessions ?? []) {
    const { data: lastPageView } = await supabase
      .from("page_views")
      .select("viewed_at")
      .eq("session_id", session.id)
      .order("viewed_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ viewed_at: string }>();

    const endedAt = lastPageView?.viewed_at ?? session.started_at;
    const durationSeconds = Math.max(
      0,
      Math.round((new Date(endedAt).getTime() - new Date(session.started_at).getTime()) / 1000)
    );

    await supabase
      .from("visitor_sessions")
      .update({ ended_at: endedAt, duration_seconds: durationSeconds })
      .eq("id", session.id);
  }

  // 2. Roll up and purge any day older than the retention window that
  // doesn't already have a rollup row.
  const retentionCutoff = new Date();
  retentionCutoff.setMonth(retentionCutoff.getMonth() - RETENTION_MONTHS);

  const { data: oldSessions, error: oldSessionsError } = await supabase
    .from("visitor_sessions")
    .select("id, started_at, duration_seconds, country, referrer_domain")
    .lt("started_at", retentionCutoff.toISOString())
    .returns<OldSessionRow[]>();

  if (oldSessionsError) {
    return NextResponse.json({ error: oldSessionsError.message }, { status: 500 });
  }

  const sessionsByDay = new Map<string, OldSessionRow[]>();
  for (const session of oldSessions ?? []) {
    const day = session.started_at.slice(0, 10);
    const list = sessionsByDay.get(day) ?? [];
    list.push(session);
    sessionsByDay.set(day, list);
  }

  let rolledUpDays = 0;
  for (const [day, daySessions] of sessionsByDay) {
    const { data: existingRollup } = await supabase
      .from("analytics_daily_rollup")
      .select("day")
      .eq("day", day)
      .maybeSingle();

    if (existingRollup) continue;

    const sessionIds = daySessions.map((s) => s.id);
    const { data: dayPageViews } = await supabase
      .from("page_views")
      .select("path")
      .in("session_id", sessionIds)
      .returns<{ path: string }[]>();

    const durations = daySessions.map((s) => s.duration_seconds).filter((d): d is number => d !== null);
    const avgDurationSeconds =
      durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

    const { error: insertError } = await supabase.from("analytics_daily_rollup").insert({
      day,
      total_sessions: daySessions.length,
      total_page_views: dayPageViews?.length ?? 0,
      avg_duration_seconds: avgDurationSeconds,
      top_countries: tallyWithKey(daySessions.map((s) => s.country), "country"),
      top_referrers: tallyWithKey(daySessions.map((s) => s.referrer_domain), "referrer"),
      top_pages: tallyWithKey((dayPageViews ?? []).map((p) => p.path), "page"),
    });

    if (insertError) {
      // A concurrent run already inserted this day's rollup - treat as already handled, not a failure.
      if (!insertError.message.toLowerCase().includes("duplicate key")) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
      continue;
    }

    await supabase.from("visitor_sessions").delete().in("id", sessionIds);
    rolledUpDays += 1;
  }

  return NextResponse.json({ closedStaleSessions: staleSessions?.length ?? 0, rolledUpDays });
}
