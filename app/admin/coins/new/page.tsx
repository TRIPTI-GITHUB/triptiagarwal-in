import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CoinForm } from "@/components/admin/CoinForm";
import { createCoin } from "@/lib/coins/actions";

export const metadata: Metadata = {
  title: "Add Coin",
};

export default function NewCoinPage() {
  return (
    <Section surface="white">
      <Container>
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-8">Add a coin</h1>
        <CoinForm mode="create" action={createCoin} />
      </Container>
    </Section>
  );
}
