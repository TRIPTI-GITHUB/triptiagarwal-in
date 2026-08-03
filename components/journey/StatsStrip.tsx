import { Container } from "@/components/ui/Container";
import { milestones, featuredInstitutions } from "@/data/milestones";
import type { MilestoneCategory } from "@/types/milestone";

function countByCategory(category: MilestoneCategory): number {
  return milestones.filter((m) => m.categories.includes(category)).length;
}

export function StatsStrip() {
  const firstYear = new Date(
    milestones.reduce((earliest, m) => (m.sortDate < earliest ? m.sortDate : earliest), milestones[0].sortDate)
  ).getFullYear();
  const currentYear = new Date().getFullYear();
  const yearsActive = currentYear - firstYear;

  const stats = [
    { label: "Years of the Journey", value: `${yearsActive}+` },
    { label: "Exhibitions", value: `${countByCategory("exhibition")}+` },
    { label: "Awards & Recognitions", value: `${countByCategory("award")}` },
    { label: "Media Features", value: `${countByCategory("media")}` },
    { label: "Institutions Reached", value: `${featuredInstitutions.length}` },
  ];

  return (
    <div className="bg-surface border-y border-border">
      <Container className="py-10 md:py-12">
        <dl className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-heritage-blue text-3xl md:text-4xl font-semibold font-[family-name:var(--font-heading)]">
                {stat.value}
              </dd>
              <p className="text-charcoal/70 text-sm md:text-base mt-2">{stat.label}</p>
            </div>
          ))}
        </dl>
      </Container>
    </div>
  );
}
