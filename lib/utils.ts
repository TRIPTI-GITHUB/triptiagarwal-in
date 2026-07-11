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