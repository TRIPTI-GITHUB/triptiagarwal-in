import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { MilestoneViewer } from "@/components/milestones/MilestoneViewer";

export const metadata: Metadata = {
  title: "Key Milestones",
  description:
    "A timeline of key milestones — from first exhibitions to national recognitions and community initiatives.",
};

const SUPABASE_MILESTONES_BASE =
  "https://fegcrymnvukdglzffeja.supabase.co/storage/v1/object/public/Milestones";

const MILESTONE_IMAGES = [
  { url: `${SUPABASE_MILESTONES_BASE}/Tripti%20Journey%202013%20-%202022.jpeg`, caption: "2013 – 2022" },
  { url: `${SUPABASE_MILESTONES_BASE}/Tripti%20Journey%202023.jpeg`, caption: "2023" },
  { url: `${SUPABASE_MILESTONES_BASE}/Tripti%20Journey%202024.jpeg`, caption: "2024" },
  { url: `${SUPABASE_MILESTONES_BASE}/Tripti%20Journey%202025.jpeg`, caption: "2025" },
];

export default function KeyMilestonesPage() {
  return (
    <Section>
      <Container>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">Milestones</h1>
        <p className="text-lg text-brand-charcoal/70 mb-12 max-w-2xl">
          This timeline captures the key moments of my journey—from my first exhibitions to national
          recognitions and community initiatives.
        </p>

        <MilestoneViewer images={MILESTONE_IMAGES} />
      </Container>
    </Section>
  );
}
