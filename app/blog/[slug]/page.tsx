import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PhotoGallery } from "@/components/blog/PhotoGallery";
import { VideoEmbed } from "@/components/blog/VideoEmbed";
import { DocumentsList } from "@/components/blog/DocumentsList";
import { PostLinksRow } from "@/components/blog/PostLinksRow";
import { formatEventDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { fetchPostBySlug, fetchPostLinks, fetchPostMedia } from "@/lib/blog/queries";
import type { Post } from "@/lib/supabase/database.types";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * generateMetadata
 * Sets the browser tab title and search-engine description dynamically
 * per post, using that post's own title and excerpt instead of a
 * generic site-wide default.
 */
export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Pick<Post, "title" | "excerpt">>();

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  };
}

/**
 * PostPage
 * Server Component — fetches a single published post matching the
 * URL's slug (event_date is the display/sort date throughout, not
 * created_at), plus its photo gallery, videos, and outbound links. If
 * no matching published post exists (wrong slug, or the post is still
 * a draft), Next.js renders its built-in 404 page via notFound().
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const post = await fetchPostBySlug(supabase, slug);
  if (!post) {
    notFound();
  }

  const media = await fetchPostMedia(supabase, post.id);
  const links = await fetchPostLinks(supabase, post.id);
  const photos = media.filter((m) => m.media_type === "image");
  const videos = media.filter((m) => m.media_type === "video");
  const documents = media.filter((m) => m.media_type === "document");

  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-wide text-brand-gold mb-3">
          {formatEventDate(post.event_date)}
        </p>

        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-8">
          {post.title}
        </h1>

        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-auto rounded-2xl mb-10 border border-brand-gold/20"
          />
        )}

        <div className="prose prose-lg max-w-none text-brand-charcoal/90 leading-8 whitespace-pre-line">
          {post.content}
        </div>

        {photos.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-brand-charcoal mb-5">Photos</h2>
            <PhotoGallery photos={photos} />
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-12 space-y-8">
            <h2 className="font-heading text-2xl font-semibold text-brand-charcoal mb-5">Videos</h2>
            {videos.map((video) => (
              <VideoEmbed key={video.id} video={video} />
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-2xl font-semibold text-brand-charcoal mb-5">Files</h2>
            <DocumentsList documents={documents} />
          </div>
        )}

        {links.length > 0 && (
          <div className="mt-12">
            <PostLinksRow links={links} />
          </div>
        )}
      </Container>
    </Section>
  );
}
