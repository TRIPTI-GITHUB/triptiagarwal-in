import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PostCard } from "@/components/blog/PostCard";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/supabase/database.types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles and research on philately, numismatics, postal history, and cultural heritage.",
};

/**
 * BlogIndex
 * Server Component — fetches all published posts, newest first, and
 * renders them as a grid of PostCards. Draft posts (published = false)
 * are excluded automatically by the "published" filter below, backed
 * by the RLS policy set in Step 5.3.
 */
export default async function BlogIndex() {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .returns<Post[]>();

  return (
    <Section>
      <Container>
        <h1 className="text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">
          Blog
        </h1>
        <p className="text-lg text-brand-charcoal/70 mb-12 max-w-2xl">
          Articles and research on philately, numismatics, postal
          history, and cultural heritage.
        </p>

        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-brand-charcoal/70">
            No posts published yet — check back soon.
          </p>
        )}
      </Container>
    </Section>
  );
}