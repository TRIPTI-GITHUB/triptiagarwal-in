import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminPosts } from "@/lib/blog/adminQueries";
import { formatEventDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog Posts",
};

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const posts = await fetchAdminPosts(supabase);

  return (
    <Section surface="white">
      <Container>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl font-bold text-brand-charcoal">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="rounded-full bg-brand-gold text-white text-sm font-medium px-5 py-2 hover:bg-brand-gold/90 transition-colors"
          >
            + New post
          </Link>
        </div>

        <p className="text-sm text-brand-charcoal/60 mb-4">{posts.length.toLocaleString()} posts</p>

        <div className="overflow-x-auto border border-brand-gold/20 rounded-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-gold/20 bg-brand-gold/5 text-left">
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Title</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Event date</th>
                <th className="px-4 py-2.5 font-medium text-brand-charcoal/70">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-brand-gold/10 last:border-b-0">
                  <td className="px-4 py-2.5 text-brand-charcoal font-medium">{post.title}</td>
                  <td className="px-4 py-2.5 text-brand-charcoal/80">{formatEventDate(post.event_date)}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Link href={`/admin/blog/${post.id}/edit`} className="text-brand-gold hover:underline">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-brand-charcoal/60">
                    No posts yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
