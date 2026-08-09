import { CATEGORY_LABELS, type Milestone } from "@/types/milestone";

interface MilestoneCardProps {
  milestone: Milestone;
}

const CATEGORY_STYLES: Record<string, string> = {
  award: "bg-antique-gold/15 text-antique-gold",
  exhibition: "bg-heritage-blue/10 text-heritage-blue",
  talk: "bg-forest-green/10 text-forest-green",
  publication: "bg-heritage-blue/10 text-heritage-blue",
  jury: "bg-antique-gold/15 text-antique-gold",
  workshop: "bg-forest-green/10 text-forest-green",
  community: "bg-charcoal/10 text-charcoal",
  media: "bg-antique-gold/15 text-antique-gold",
};

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  return (
    <article className="bg-surface rounded-xl shadow-sm border border-border p-6 md:p-8 hover:shadow-md transition-shadow">
      <p className="text-antique-gold text-sm font-semibold tracking-wide uppercase mb-2">
        {milestone.dateLabel}
      </p>
      <h3 className="font-heading text-heritage-blue text-xl md:text-2xl font-semibold mb-3">
        {milestone.title}
      </h3>
      <p className="text-charcoal/80 leading-relaxed mb-4">{milestone.shortDescription}</p>
      <div className="flex flex-wrap gap-2">
        {milestone.categories.map((category) => (
          <span
            key={category}
            className={`text-xs font-medium px-3 py-1 rounded-full ${CATEGORY_STYLES[category]}`}
          >
            {CATEGORY_LABELS[category]}
          </span>
        ))}
      </div>
    </article>
  );
}
