import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CoinForm } from "@/components/admin/CoinForm";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminCoinById } from "@/lib/coins/adminQueries";
import { updateCoin } from "@/lib/coins/actions";

export const metadata: Metadata = {
  title: "Edit Coin",
};

interface EditCoinPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoinPage({ params }: EditCoinPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const coin = await fetchAdminCoinById(supabase, id);

  if (!coin) {
    notFound();
  }

  return (
    <Section surface="white">
      <Container>
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-8">Edit {coin.title}</h1>
        <CoinForm mode="edit" coin={coin} action={updateCoin.bind(null, coin.id)} />
      </Container>
    </Section>
  );
}
