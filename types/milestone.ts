export type MilestoneCategory =
  | "award"
  | "exhibition"
  | "talk"
  | "publication"
  | "jury"
  | "workshop"
  | "community"
  | "media";

export interface MilestoneMedia {
  id: string;
  imageUrl: string;
  caption?: string;
}

export interface Milestone {
  id: string;
  /** ISO-ish label, kept as free text since sources use ranges like "Aug–Sep 2024" */
  dateLabel: string;
  /** Used for chronological sort only — first day of the period is fine */
  sortDate: string;
  title: string;
  shortDescription: string;
  categories: MilestoneCategory[];
  /** Filled in later once Tripti adds richer writeups — optional by design */
  detailedDescription?: string;
  quote?: string;
  coverImageUrl?: string;
  media?: MilestoneMedia[];
  featured?: boolean;
}

export interface JourneyEra {
  id: string;
  label: string;
  yearRange: string;
  intro: string;
  milestoneIds: string[];
}

export const CATEGORY_LABELS: Record<MilestoneCategory, string> = {
  award: "Award",
  exhibition: "Exhibition",
  talk: "Talk",
  publication: "Publication",
  jury: "Jury Role",
  workshop: "Workshop",
  community: "Community",
  media: "Media Feature",
};
 