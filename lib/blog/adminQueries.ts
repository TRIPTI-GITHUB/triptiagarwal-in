import type { SupabaseClient } from "@supabase/supabase-js";
import type { Post, PostLink, PostMedia } from "@/lib/supabase/database.types";

/** Every post (draft + published) - the "authenticated users can view all posts" RLS policy backs this. */
export async function fetchAdminPosts(supabase: SupabaseClient): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("event_date", { ascending: false })
    .returns<Post[]>();
  if (error) throw error;
  return data ?? [];
}

export interface AdminPostWithRelations {
  post: Post;
  media: PostMedia[];
  links: PostLink[];
}

export async function fetchAdminPostById(
  supabase: SupabaseClient,
  id: string
): Promise<AdminPostWithRelations | null> {
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle<Post>();
  if (postError) throw postError;
  if (!post) return null;

  const [{ data: media, error: mediaError }, { data: links, error: linksError }] = await Promise.all([
    supabase.from("post_media").select("*").eq("post_id", id).order("sort_order", { ascending: true }).returns<PostMedia[]>(),
    supabase.from("post_links").select("*").eq("post_id", id).order("sort_order", { ascending: true }).returns<PostLink[]>(),
  ]);
  if (mediaError) throw mediaError;
  if (linksError) throw linksError;

  return { post, media: media ?? [], links: links ?? [] };
}
