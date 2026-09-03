import type { SupabaseClient } from "@supabase/supabase-js";
import type { VisitorSession, PageView, AnalyticsDailyRollup } from "@/lib/supabase/database.types";

/**
 * Admin-only analytics queries. Every headline number excludes
 * is_bot=true rows (crawlers shouldn't inflate "how many people
 * visited"), per the RLS policies these run behind (admin-only read).
 * Aggregation happens in JS after a narrow-column fetch, same
 * approach as lib/coins/queries.ts's facet counts - correct and
 * simple at this site's traffic scale; no Postgres function needed.
 */

export interface AnalyticsSummary {
  visitsToday: number;
  visits7d: number;
  visits30d: number;
  totalSessionsAllTime: number;
  avgDurationSeconds30d: number | null;
}

function startOfUtcDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function daysAgo(from: Date, days: number): Date {
  return new Date(from.getTime() - days * 24 * 60 * 60 * 1000);
}

export async function fetchAnalyticsSummary(supabase: SupabaseClient): Promise<AnalyticsSummary> {
  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const sevenDaysAgo = daysAgo(todayStart, 6);
  const thirtyDaysAgo = daysAgo(todayStart, 29);

  const [{ data: recentRows, error: recentError }, { count: totalSessionsAllTime, error: totalError }] =
    await Promise.all([
      supabase
        .from("visitor_sessions")
        .select("started_at, duration_seconds")
        .eq("is_bot", false)
        .gte("started_at", thirtyDaysAgo.toISOString())
        .returns<Pick<VisitorSession, "started_at" | "duration_seconds">[]>(),
      supabase.from("visitor_sessions").select("id", { count: "exact", head: true }).eq("is_bot", false),
    ]);

  if (recentError) throw recentError;
  if (totalError) throw totalError;

  const rows = recentRows ?? [];
  const visitsToday = rows.filter((r) => new Date(r.started_at) >= todayStart).length;
  const visits7d = rows.filter((r) => new Date(r.started_at) >= sevenDaysAgo).length;
  const visits30d = rows.length;

  const durations = rows.map((r) => r.duration_seconds).filter((d): d is number => d !== null);
  const avgDurationSeconds30d =
    durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;

  return { visitsToday, visits7d, visits30d, totalSessionsAllTime: totalSessionsAllTime ?? 0, avgDurationSeconds30d };
}

export interface DailyVisitCount {
  day: string; // YYYY-MM-DD
  count: number;
}

/**
 * Visits per day for the last N days. Live-aggregated from
 * visitor_sessions for any day still in the raw-retention window
 * (everything, for the first 18 months of this feature's life); falls
 * back to analytics_daily_rollup's total_sessions for any day that's
 * already been purged by the retention job - both branches are
 * correct today and once the purge actually starts happening.
 */
export async function fetchDailyVisitCounts(supabase: SupabaseClient, days = 30): Promise<DailyVisitCount[]> {
  const now = new Date();
  const rangeStart = daysAgo(startOfUtcDay(now), days - 1);

  const [{ data: sessionRows, error: sessionsError }, { data: rollupRows, error: rollupError }] = await Promise.all([
    supabase
      .from("visitor_sessions")
      .select("started_at")
      .eq("is_bot", false)
      .gte("started_at", rangeStart.toISOString())
      .returns<Pick<VisitorSession, "started_at">[]>(),
    supabase
      .from("analytics_daily_rollup")
      .select("day, total_sessions")
      .gte("day", rangeStart.toISOString().slice(0, 10))
      .returns<Pick<AnalyticsDailyRollup, "day" | "total_sessions">[]>(),
  ]);

  if (sessionsError) throw sessionsError;
  if (rollupError) throw rollupError;

  const liveCounts = new Map<string, number>();
  for (const row of sessionRows ?? []) {
    const day = row.started_at.slice(0, 10);
    liveCounts.set(day, (liveCounts.get(day) ?? 0) + 1);
  }

  const rollupCounts = new Map((rollupRows ?? []).map((r) => [r.day, r.total_sessions]));

  const result: DailyVisitCount[] = [];
  for (let i = 0; i < days; i++) {
    const date = daysAgo(now, days - 1 - i);
    const day = date.toISOString().slice(0, 10);
    result.push({ day, count: liveCounts.get(day) ?? rollupCounts.get(day) ?? 0 });
  }
  return result;
}

export interface CountedEntry {
  label: string;
  count: number;
}

function tallyBy<T>(rows: T[], keyOf: (row: T) => string | null): CountedEntry[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = keyOf(row);
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export interface TrafficBreakdown {
  topPages: CountedEntry[];
  referrers: CountedEntry[];
  utmSources: CountedEntry[];
  countries: CountedEntry[];
  cities: CountedEntry[];
  devices: CountedEntry[];
  browsers: CountedEntry[];
  operatingSystems: CountedEntry[];
}

/** All the Analytics tab's breakdown tables, computed from the last 30 days of non-bot traffic. */
export async function fetchTrafficBreakdown(supabase: SupabaseClient, days = 30): Promise<TrafficBreakdown> {
  const rangeStart = daysAgo(startOfUtcDay(new Date()), days - 1).toISOString();

  const [{ data: sessions, error: sessionsError }, { data: pageViews, error: pageViewsError }] = await Promise.all([
    supabase
      .from("visitor_sessions")
      .select("referrer_domain, utm_source, country, city, device_type, browser, os")
      .eq("is_bot", false)
      .gte("started_at", rangeStart)
      .returns<
        Pick<
          VisitorSession,
          "referrer_domain" | "utm_source" | "country" | "city" | "device_type" | "browser" | "os"
        >[]
      >(),
    supabase
      .from("page_views")
      .select("path, viewed_at")
      .gte("viewed_at", rangeStart)
      .returns<Pick<PageView, "path" | "viewed_at">[]>(),
  ]);

  if (sessionsError) throw sessionsError;
  if (pageViewsError) throw pageViewsError;

  const sessionRows = sessions ?? [];

  return {
    topPages: tallyBy(pageViews ?? [], (r) => r.path).slice(0, 15),
    referrers: tallyBy(sessionRows, (r) => r.referrer_domain).slice(0, 15),
    utmSources: tallyBy(sessionRows, (r) => r.utm_source).slice(0, 15),
    countries: tallyBy(sessionRows, (r) => r.country).slice(0, 15),
    cities: tallyBy(sessionRows, (r) => r.city).slice(0, 15),
    devices: tallyBy(sessionRows, (r) => r.device_type),
    browsers: tallyBy(sessionRows, (r) => r.browser),
    operatingSystems: tallyBy(sessionRows, (r) => r.os),
  };
}
