import { Container } from "@/components/ui/Container";

export function JourneyHero() {
  return (
    <div className="bg-heritage-blue">
      <Container className="py-20 md:py-28 lg:py-32">
        <p className="text-antique-gold text-sm md:text-base font-semibold tracking-[0.2em] uppercase mb-4">
          The Journey
        </p>
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight max-w-3xl">
          A Decade of Small Beginnings, Big Stories
        </h1>
        <p className="text-white/80 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
          Every collector starts somewhere. This one started with a single Facebook
          post about a growing coin collection — and grew into exhibitions, awards,
          school workshops, and a story now told in classrooms and on national
          television.
        </p>
        <p className="text-white/70 text-base md:text-lg mt-6 max-w-2xl leading-relaxed">
          This is not a list of achievements. It is the story of how a personal
          hobby became a public mission — one exhibit, one workshop, one postcard
          at a time. Follow the timeline below to see how curiosity about a few
          coins and stamps turned into a decade of learning, teaching, and
          preserving heritage for others to discover.
        </p>
      </Container>
    </div>
  );
}
