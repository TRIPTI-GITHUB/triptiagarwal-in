import Link from "next/link";
import { Card } from "@/components/ui/Card";

interface Feature {
  icon: string;
  title: string;
  description: string;
  href?: string;
}

const FEATURES: Feature[] = [
  {
    icon: "🏛️",
    title: "Digital Museum",
    description: "Interactive exhibits exploring history through curated heritage collections.",
  },
  {
    icon: "📮",
    title: "Stamp Collections",
    description: "Philatelic collections spanning postal history and design.",
    href: "/exhibits",
  },
  {
    icon: "🪙",
    title: "Coin Collections",
    description: "Numismatic pieces documenting the history of currency.",
  },
  {
    icon: "📚",
    title: "Learning Resources",
    description: "Articles, research, and educational content for collectors and students.",
  },
  {
    icon: "🎙️",
    title: "Podcast",
    description: "Conversations and interviews with heritage experts.",
  },
  {
    icon: "🤖",
    title: "AI Heritage Tools",
    description: "AI-powered identification and exhibit generation for collectors.",
  },
];

/**
 * FeatureGrid
 * Displays the platform's core feature areas as a responsive grid of
 * Cards. Tiles with an `href` in FEATURES become clickable links to
 * that section of the site; tiles without one render as static
 * preview cards for features not built yet.
 */
export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {FEATURES.map((feature) => {
        const content = (
          <Card
            className={feature.href ? "h-full transition-transform hover:-translate-y-0.5" : "h-full"}
          >
            <span className="text-3xl">{feature.icon}</span>
            <h3 className="mt-3 font-semibold text-brand-charcoal">
              {feature.title}
            </h3>
            <p className="mt-1 text-sm text-brand-charcoal/70">
              {feature.description}
            </p>
          </Card>
        );

        if (feature.href) {
          return (
            <Link key={feature.title} href={feature.href} className="block">
              {content}
            </Link>
          );
        }

        return <div key={feature.title}>{content}</div>;
      })}
    </div>
  );
}