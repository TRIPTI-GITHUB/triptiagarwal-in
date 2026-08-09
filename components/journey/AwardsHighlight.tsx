import { Container } from "@/components/ui/Container";
import { awardHighlights } from "@/data/milestones";

export function AwardsHighlight() {
  return (
    <Container>
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="font-heading text-heritage-blue text-3xl md:text-4xl font-semibold mb-4">
          Credibility That Speaks
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {awardHighlights.map((award) => (
          <div
            key={award.title}
            className="bg-surface rounded-xl shadow-sm border border-border p-8 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-antique-gold/15 flex items-center justify-center mx-auto mb-4">
              <span className="text-antique-gold text-xl" aria-hidden="true">
                ★
              </span>
            </div>
            <h3 className="font-heading text-heritage-blue text-lg font-semibold mb-2">{award.title}</h3>
            <p className="text-charcoal/70 text-sm leading-relaxed">{award.detail}</p>
          </div>
        ))}
      </div>
      <p className="text-center text-charcoal/70 max-w-2xl mx-auto mt-10 leading-relaxed">
        Also felicitated by the Numisphila Club of Delhi (2023), and recipient of a
        personal e-postcard greeting from the Hon&apos;ble Prime Minister of India.
      </p>
    </Container>
  );
}
