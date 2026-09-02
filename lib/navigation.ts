/**
 * Site navigation structure - single source of truth shared by the
 * desktop Header dropdowns and the mobile full-screen overlay, so the
 * two can never drift apart (PRD_Navigation_IA_Homepage_Template
 * section 5, the finalized IA).
 *
 * Coins, Recognition & Memberships, Thematic Highlights, and Video
 * Gallery route to "coming soon" placeholder pages for now (PRD §8) -
 * not built out in this phase, but present in the nav per "every
 * currently-implemented feature must be reachable" plus the explicit
 * instruction to reserve real nav slots rather than omit them.
 */
export interface NavChild {
  href: string;
  label: string;
  description: string;
}

export interface NavItem {
  href: string;
  label: string;
  children?: NavChild[];
  // Homepage_UI_Design_Brief.md section 2: Collections gets a wide,
  // one-column-per-child grid panel (a single vertical list of three
  // feels sparse in a wide panel); About/Gallery stay a simple
  // vertical list. Explicit per-item rather than derived from child
  // count, since About also has three children but should NOT get
  // the grid treatment.
  dropdownLayout?: "grid" | "list";
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/about",
    label: "About",
    children: [
      { href: "/about", label: "About Tripti", description: "Tripti's story, in her own words." },
      {
        href: "/about-scrapbook",
        label: "About Tripti - Scrapbook Look",
        description: "The same story, told as a warm photo scrapbook.",
      },
      { href: "/journey", label: "Journey", description: "A decade-long timeline of milestones." },
      {
        href: "/about/key-milestones",
        label: "Key Milestones",
        description: "Milestone highlights, one image at a time.",
      },
      {
        href: "/about/recognition",
        label: "Recognition & Memberships",
        description: "Formal memberships, awards, and accolades.",
      },
    ],
  },
  {
    href: "/exhibits",
    label: "Collections",
    dropdownLayout: "grid",
    children: [
      { href: "/collections/coins", label: "Coins", description: "Browse the catalog by country, composition, and year." },
      { href: "/exhibits", label: "Exhibits", description: "Curated philatelic exhibits, sheet by sheet." },
      {
        href: "/collections/thematic-highlights",
        label: "Thematic Highlights",
        description: "Cross-category groupings around a shared theme.",
      },
    ],
  },
  { href: "/museum", label: "3D Museum" },
  {
    href: "/gallery/photo",
    label: "Gallery",
    children: [
      { href: "/gallery/photo", label: "Photo Gallery", description: "Moments from exhibitions and milestones." },
      { href: "/gallery/video", label: "Video Gallery", description: "Video coverage and features." },
    ],
  },
  { href: "/blog", label: "Blog" },
];

// The five confirmed platforms (PRD section 7.5) - rendered in this
// order regardless of which ones have a real URL yet in site_content.
export const SOCIAL_PLATFORMS = ["Numista", "Instagram", "Facebook", "LinkedIn", "Postcrossing"] as const;
