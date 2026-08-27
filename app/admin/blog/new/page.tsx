import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PostForm } from "@/components/admin/blog/PostForm";

export const metadata: Metadata = {
  title: "New Post",
};

export default function NewPostPage() {
  return (
    <Section surface="white">
      <Container>
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-8">New post</h1>
        <PostForm mode="create" />
      </Container>
    </Section>
  );
}
