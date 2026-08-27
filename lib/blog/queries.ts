import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, PostLink, PostMedia } from "@/lib/supabase/database.types";

/** Published posts only, newest milestone first - event_date is when it happened, not when the row was authored. */
export async function fetchPublishedPosts(supabase: SupabaseClient): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("event_date", { ascending: false })
    .returns<Post[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchPostBySlug(supabase: SupabaseClient, slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Post>();
  if (error) throw error;
  return data ?? null;
}

export async function fetchPostMedia(supabase: SupabaseClient, postId: string): Promise<PostMedia[]> {
  const { data, error } = await supabase
    .from("post_media")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true })
    .returns<PostMedia[]>();
  if (error) throw error;
  return data ?? [];
}

export async function fetchPostLinks(supabase: SupabaseClient, postId: string): Promise<PostLink[]> {
  const { data, error } = await supabase
    .from("post_links")
    .select("*")
    .eq("post_id", postId)
    .order("sort_order", { ascending: true })
    .returns<PostLink[]>();
  if (error) throw error;
  return data ?? [];
}

/**
 * Extracts a YouTube video ID from any common URL shape:
 * watch?v=ID, youtu.be/ID, embed/ID, shorts/ID - with or without
 * www./m. prefixes or trailing query params. Returns null for
 * anything else, so the caller can fall back to a link-out card
 * instead of a broken embed.
 */
export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/]+)/);
      if (match) return match[2];
    }

    return null;
  } catch {
    return null;
  }
}
