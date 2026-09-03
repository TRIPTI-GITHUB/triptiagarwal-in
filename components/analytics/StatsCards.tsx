import { LiveVisitorBadge } from "@/components/analytics/LiveVisitorBadge";
import type { AnalyticsSummary } from "@/lib/analytics/adminQueries";

interface StatsCardsProps {
  summary: AnalyticsSummary;
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-brand-gold/20 rounded-sm bg-white px-5 py-4">
      <dt className="text-sm text-brand-charcoal/60">{label}</dt>
      <dd className="text-3xl font-semibold text-brand-charcoal mt-1">{value}</dd>
    </div>
  );
}

/** Excludes is_bot=true traffic from every number here, per the RLS-gated admin queries these values come from. */
export function StatsCards({ summary }: StatsCardsProps) {
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
      <LiveVisitorBadge />
      <Card label="Visits today" value={summary.visitsToday.toLocaleString()} />
      <Card label="Visits (7 days)" value={summary.visits7d.toLocaleString()} />
      <Card label="Visits (30 days)" value={summary.visits30d.toLocaleString()} />
      <Card label="Total sessions (all-time)" value={summary.totalSessionsAllTime.toLocaleString()} />
      <Card label="Avg. session duration (30 days)" value={formatDuration(summary.avgDurationSeconds30d)} />
    </dl>
  );
}
