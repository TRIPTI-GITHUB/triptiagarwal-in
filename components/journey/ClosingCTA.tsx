import Link from "next/link";
import { Container } from "@/components/ui/Container";

export function ClosingCTA() {
  return (
    <Container className="text-center max-w-2xl">
      <h2 className="font-heading text-heritage-blue text-3xl md:text-4xl font-semibold mb-6">
        The Next Chapter
      </h2>
      <p className="text-charcoal/80 leading-relaxed mb-8">
        From a single Facebook post in 2013 to national exhibitions, media
        features, and international recognition, this journey has always been
        about one thing: making history and heritage accessible to everyone
        who&apos;s curious enough to look closer. Tripti Agarwal Heritage Lab is
        where that journey continues — as a digital museum, a learning space,
        and a growing community for collectors of every age.
      </p>
      {/* TODO: confirm final route once Collections/Exhibits is live */}
      <Link
        href="/collections"
        className="inline-block bg-heritage-blue text-white px-8 py-3 rounded-full font-medium hover:bg-heritage-blue/90 transition-colors"
      >
        Explore the Digital Museum
      </Link>
    </Container>
  );
}
