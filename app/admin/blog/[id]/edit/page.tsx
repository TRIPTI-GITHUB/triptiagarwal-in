import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PostForm } from "@/components/admin/blog/PostForm";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminPostById } from "@/lib/blog/adminQueries";

export const metadata: Metadata = {
  title: "Edit Post",
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const existing = await fetchAdminPostById(supabase, id);

  if (!existing) {
    notFound();
  }

  return (
    <Section surface="white">
      <Container>
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-8">Edit {existing.post.title}</h1>
        <PostForm mode="edit" existing={existing} />
      </Container>
    </Section>
  );
}
