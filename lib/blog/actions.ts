"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { postFormSchema, type PostFormValues } from "@/lib/blog/schema";

export interface PostActionResult {
  success: false;
  error: string;
}

async function replacePostMediaAndLinks(supabase: SupabaseClient, postId: string, values: PostFormValues) {
  const { error: deleteMediaError } = await supabase.from("post_media").delete().eq("post_id", postId);
  if (deleteMediaError) throw new Error(deleteMediaError.message);

  const { error: deleteLinksError } = await supabase.from("post_links").delete().eq("post_id", postId);
  if (deleteLinksError) throw new Error(deleteLinksError.message);

  const mediaRows = [
    ...values.photos.map((photo, index) => ({
      post_id: postId,
      media_type: "image" as const,
      url: photo.url,
      video_platform: null,
      caption: photo.caption || null,
      file_name: photo.fileName || null,
      sort_order: index,
    })),
    ...values.videos.map((video, index) => ({
      post_id: postId,
      media_type: "video" as const,
      url: video.url,
      video_platform: video.platform,
      caption: video.caption || null,
      file_name: video.fileName || null,
      sort_order: index,
    })),
    ...values.documents.map((doc, index) => ({
      post_id: postId,
      media_type: "document" as const,
      url: doc.url,
      video_platform: null,
      caption: null,
      file_name: doc.fileName,
      sort_order: index,
    })),
  ];
  if (mediaRows.length > 0) {
    const { error } = await supabase.from("post_media").insert(mediaRows);
    if (error) throw new Error(error.message);
  }

  const linkRows = values.links.map((link, index) => ({
    post_id: postId,
    platform: link.platform,
    url: link.url,
    label: link.label || null,
    sort_order: index,
  }));
  if (linkRows.length > 0) {
    const { error } = await supabase.from("post_links").insert(linkRows);
    if (error) throw new Error(error.message);
  }
}

export async function savePost(input: PostFormValues): Promise<PostActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = postFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const values = parsed.data;

  const postRow = {
    title: values.title,
    slug: values.slug,
    event_date: values.event_date,
    excerpt: values.excerpt || null,
    content: values.content,
    cover_image_url: values.cover_image_url || null,
    published: values.published,
  };

  let postId = values.id;

  try {
    if (postId) {
      const { error } = await supabase
        .from("posts")
        .update({ ...postRow, updated_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from("posts").insert(postRow).select("id").single();
      if (error) throw error;
      postId = data.id;
    }

    if (!postId) {
      throw new Error("Failed to resolve the post's id.");
    }
    await replacePostMediaAndLinks(supabase, postId, values);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong.";
    if (message.includes("duplicate key") || message.includes("posts_slug_key")) {
      return { success: false, error: "That slug is already in use — please choose another." };
    }
    return { success: false, error: message };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${values.slug}`);
  redirect("/admin/blog");
}

const BLOG_MEDIA_PUBLIC_PREFIX = "/storage/v1/object/public/blog-media/";

/** Recovers the storage object path from a blog-media public URL, or null if the URL isn't one of ours. */
function extractBlogMediaPath(url: string): string | null {
  const index = url.indexOf(BLOG_MEDIA_PUBLIC_PREFIX);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + BLOG_MEDIA_PUBLIC_PREFIX.length));
}

export async function deletePost(id: string): Promise<PostActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  try {
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("cover_image_url")
      .eq("id", id)
      .maybeSingle();
    if (postError) throw postError;

    const { data: media, error: mediaError } = await supabase.from("post_media").select("url").eq("post_id", id);
    if (mediaError) throw mediaError;

    // Every post_media URL is checked, regardless of type - a linked
    // video's URL points at YouTube/Instagram/etc, and
    // extractBlogMediaPath safely returns null for those, so this
    // covers uploaded photos/videos/documents without needing to
    // filter by media_type here.
    const uploadedUrls = [post?.cover_image_url, ...(media ?? []).map((m) => m.url)].filter(
      (url): url is string => Boolean(url)
    );

    const paths = uploadedUrls.map(extractBlogMediaPath).filter((path): path is string => Boolean(path));
    if (paths.length > 0) {
      await supabase.storage.from("blog-media").remove(paths);
    }

    const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
    if (deleteError) throw deleteError;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}
