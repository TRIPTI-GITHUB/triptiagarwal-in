import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { formatDate } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
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
 * URL's slug. If no matching published post exists (wrong slug, or
 * the post is still a draft), Next.js renders its built-in 404 page
 * via notFound().
 */
export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle<Post>();

  if (!post) {
    notFound();
  }

  return (
    <Section>
      <Container className="max-w-3xl">
        <p className="text-xs uppercase tracking-wide text-brand-gold mb-3">
          {formatDate(post.created_at)}
        </p>

        <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-8">
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
      </Container>
    </Section>
  );
}