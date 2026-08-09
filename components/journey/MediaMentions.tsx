import { Container } from "@/components/ui/Container";
import { mediaFeatures } from "@/data/milestones";

export function MediaMentions() {
  return (
    <Container>
      <div className="bg-heritage-blue rounded-2xl px-6 py-12 md:px-16 md:py-16 text-center">
        <h2 className="font-heading text-white text-3xl md:text-4xl font-semibold mb-6">
          Featured in National Media
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
          The Wildlife Week Philately Exhibition (2024), held at the Art Gallery,
          Dehradun, with its closing ceremony at Raj Bhawan, was covered by:
        </p>
        <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-8">
          {mediaFeatures.map((outlet) => (
            <li key={outlet} className="text-antique-gold font-semibold text-lg">
              {outlet}
            </li>
          ))}
        </ul>
        <p className="text-white/60 text-sm max-w-xl mx-auto">
          Her 2021 virtual exhibition on Gandhi Jayanti was also featured in a
          newspaper at the time.
        </p>
      </div>
    </Container>
  );
}
