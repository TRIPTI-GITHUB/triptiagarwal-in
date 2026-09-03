import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { StatsCards } from "@/components/analytics/StatsCards";
import { VisitsChart } from "@/components/analytics/VisitsChart";
import { BreakdownTable } from "@/components/analytics/BreakdownTable";
import { createClient } from "@/lib/supabase/server";
import { fetchAnalyticsSummary, fetchDailyVisitCounts, fetchTrafficBreakdown } from "@/lib/analytics/adminQueries";

export const metadata: Metadata = {
  title: "Analytics",
};

/**
 * Server Component - every query here runs with the admin's own
 * authenticated session (not the service-role key, which is
 * write-only and lives in app/api/analytics/*). The
 * analytics_admin_read_* RLS policies on all three tables are what
 * make this safe with just the anon key.
 */
export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [summary, dailyVisits, breakdown] = await Promise.all([
    fetchAnalyticsSummary(supabase),
    fetchDailyVisitCounts(supabase),
    fetchTrafficBreakdown(supabase),
  ]);

  return (
    <Section surface="white">
      <Container>
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-8">Analytics</h1>

        <StatsCards summary={summary} />
        <VisitsChart data={dailyVisits} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BreakdownTable title="Top pages" labelHeader="Page" entries={breakdown.topPages} />
          <BreakdownTable title="Traffic sources" labelHeader="Referrer" entries={breakdown.referrers} />
          <BreakdownTable title="UTM sources" labelHeader="Source" entries={breakdown.utmSources} />
          <BreakdownTable title="Countries" labelHeader="Country" entries={breakdown.countries} />
          <BreakdownTable title="Cities" labelHeader="City" entries={breakdown.cities} />
          <BreakdownTable title="Devices" labelHeader="Device type" entries={breakdown.devices} />
          <BreakdownTable title="Browsers" labelHeader="Browser" entries={breakdown.browsers} />
          <BreakdownTable title="Operating systems" labelHeader="OS" entries={breakdown.operatingSystems} />
        </div>
      </Container>
    </Section>
  );
}
