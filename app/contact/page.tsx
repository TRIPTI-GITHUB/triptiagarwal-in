import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Tripti Agarwal Heritage Lab with any questions or queries.",
};

export default function ContactPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-3">Contact Us</h1>
        <p className="text-lg text-brand-charcoal/70 mb-10">
          Have a question or want to get in touch? Send a message below and we&rsquo;ll get back to you.
        </p>
        <ContactForm />
      </Container>
    </Section>
  );
}
