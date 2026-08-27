/**
 * formatDate
 * Converts a Supabase timestamp string (e.g. "2026-07-12T09:30:00Z")
 * into a readable date (e.g. "July 12, 2026"). Shared by any component
 * that displays a post or content date, so the format stays consistent
 * site-wide and only needs to change in one place.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * formatEventDate
 * For a plain SQL `date` column (e.g. posts.event_date, "2025-01-01"
 * with no time/timezone). `new Date("2025-01-01")` parses as UTC
 * midnight, so formatting it against a non-UTC local timezone can
 * silently print the wrong calendar day. Building the Date from its
 * Y/M/D parts directly keeps the displayed day exact regardless of
 * the server's timezone.
 */
export function formatEventDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}