import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";
import type { Post } from "@/lib/supabase/database.types";

interface PostCardProps {
  post: Post;
}

/**
 * PostCard
 * Preview tile for a single blog post — used in the blog list page.
 * Wraps the shared Card component so it stays visually consistent
 * with other tile content (feature grid, future collection items, etc.)
 * rather than defining its own styling from scratch.
 */
export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="h-full flex flex-col cursor-pointer">
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-40 object-cover rounded-xl mb-4 -mt-2"
          />
        )}
        <p className="text-xs uppercase tracking-wide text-brand-gold mb-2">
          {formatDate(post.created_at)}
        </p>
        <h3 className="font-semibold text-lg text-brand-charcoal mb-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-brand-charcoal/70 leading-6">
            {post.excerpt}
          </p>
        )}
      </Card>
    </Link>
  );
}