import { Container } from "@/components/ui/Container";
import { featuredInstitutions } from "@/data/milestones";

const FORMATS = [
  "Interactive sessions introducing the hobby",
  "Postcard-writing workshops reviving handwritten correspondence",
  "Kids-friendly hands-on activities",
  "Curated exhibitions for school events",
];

export function CommunitySection() {
  return (
    <Container>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="font-heading text-heritage-blue text-3xl md:text-4xl font-semibold mb-6">
            Bringing Heritage to Classrooms
          </h2>
          <p className="text-charcoal/80 leading-relaxed mb-6">
            Beyond exhibitions and awards, this journey has always been about
            sharing what&apos;s been learned. Over the years, Tripti has worked
            directly with schools and organisations to introduce philately,
            numismatics, and postcrossing to new audiences:
          </p>
          <ul className="space-y-2">
            {featuredInstitutions.map((institution) => (
              <li key={institution} className="flex items-start gap-3 text-charcoal/80">
                <span className="text-forest-green mt-1" aria-hidden="true">
                  ●
                </span>
                {institution}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface rounded-xl border border-border p-8">
          <h3 className="font-heading text-heritage-blue text-lg font-semibold mb-4">
            Formats Offered
          </h3>
          <ul className="space-y-4">
            {FORMATS.map((format) => (
              <li key={format} className="text-charcoal/80 leading-relaxed border-b border-border last:border-b-0 pb-4 last:pb-0">
                {format}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Container>
  );
}
