import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Thematic Highlights",
  description: "Curated, cross-category groupings across coins, stamps, and postcards — coming soon.",
};

export default function ThematicHighlightsPage() {
  return (
    <ComingSoon
      title="Thematic Highlights"
      description="Curated groupings that cross categories — coins, stamps, and postcards sharing a single theme — are being planned."
    />
  );
}
