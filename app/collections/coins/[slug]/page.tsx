import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { CollectionGrid } from "@/components/ui/CollectionGrid";
import { CoinCard } from "@/components/coins/CoinCard";
import { CoinSpecTable } from "@/components/coins/CoinSpecTable";
import { createClient } from "@/lib/supabase/server";
import { fetchRelatedCoins } from "@/lib/coins/queries";
import type { CoinPublic } from "@/lib/supabase/database.types";

interface CoinPageProps {
  params: Promise<{ slug: string }>;
}

async function getCoin(slug: string): Promise<CoinPublic | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("coins_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle<CoinPublic>();
  return data ?? null;
}

function coinDescription(coin: CoinPublic): string {
  if (coin.public_comment) return coin.public_comment;
  const yearLabel = coin.year_raw ?? (coin.year !== null ? String(coin.year) : null);
  const parts = [coin.title, coin.country, yearLabel, coin.composition].filter(Boolean);
  return parts.join(" — ");
}

export async function generateMetadata({ params }: CoinPageProps): Promise<Metadata> {
  const { slug } = await params;
  const coin = await getCoin(slug);

  if (!coin) {
    return { title: "Coin Not Found" };
  }

  const description = coinDescription(coin);
  const images = [coin.obverse_image_url, coin.reverse_image_url].filter((url): url is string => Boolean(url));

  return {
    title: `${coin.title} — ${coin.country}`,
    description,
    alternates: {
      canonical: `/collections/coins/${coin.slug}`,
    },
    openGraph: {
      title: coin.title,
      description,
      url: `/collections/coins/${coin.slug}`,
      type: "article",
      images,
    },
    twitter: {
      card: images.length > 0 ? "summary_large_image" : "summary",
      title: coin.title,
      description,
      images,
    },
  };
}

export default async function CoinPage({ params }: CoinPageProps) {
  const { slug } = await params;
  const coin = await getCoin(slug);

  if (!coin) {
    notFound();
  }

  const supabase = await createClient();
  const relatedCoins = await fetchRelatedCoins(supabase, coin);

  const yearLabel = coin.year_raw ?? (coin.year !== null ? String(coin.year) : "Year unknown");
  const description = coinDescription(coin);
  const images = [coin.obverse_image_url, coin.reverse_image_url].filter((url): url is string => Boolean(url));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: coin.title,
    description,
    category: "Coins",
    ...(images.length > 0 ? { image: images } : {}),
    ...(coin.issuer || coin.country
      ? { brand: { "@type": "Organization", name: coin.issuer ?? coin.country } }
      : {}),
    additionalProperty: [
      { "@type": "PropertyValue", name: "Country", value: coin.country },
      { "@type": "PropertyValue", name: "Year", value: yearLabel },
      coin.grade ? { "@type": "PropertyValue", name: "Grade", value: coin.grade } : null,
      coin.composition ? { "@type": "PropertyValue", name: "Composition", value: coin.composition } : null,
      coin.mintmark ? { "@type": "PropertyValue", name: "Mintmark", value: coin.mintmark } : null,
      { "@type": "PropertyValue", name: "Available for exchange", value: coin.for_exchange ? "Yes" : "No" },
    ].filter(Boolean),
  };

  return (
    <Section>
      <Container className="max-w-5xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <nav aria-label="Breadcrumb" className="text-sm text-brand-charcoal/60 mb-6">
          <Link href="/collections/coins" className="hover:text-brand-gold transition-colors">
            Coins
          </Link>
          <span className="mx-2">/</span>
          <span className="text-brand-charcoal">{coin.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="grid grid-cols-2 gap-4 content-start">
            <figure className="col-span-1">
              <div className="aspect-square bg-brand-teal/5 border border-brand-charcoal/10 flex items-center justify-center overflow-hidden">
                {coin.obverse_image_url ? (
                  <img
                    src={coin.obverse_image_url}
                    alt={`Obverse of ${coin.title}`}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <span className="text-brand-teal/40 text-sm italic">Obverse coming soon</span>
                )}
              </div>
              <figcaption className="text-center text-xs text-brand-charcoal/50 mt-2">Obverse</figcaption>
            </figure>

            <figure className="col-span-1">
              <div className="aspect-square bg-brand-teal/5 border border-brand-charcoal/10 flex items-center justify-center overflow-hidden">
                {coin.reverse_image_url ? (
                  <img
                    src={coin.reverse_image_url}
                    alt={`Reverse of ${coin.title}`}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <span className="text-brand-teal/40 text-sm italic">Reverse coming soon</span>
                )}
              </div>
              <figcaption className="text-center text-xs text-brand-charcoal/50 mt-2">Reverse</figcaption>
            </figure>
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-brand-gold mb-2">
              {coin.country} · {yearLabel}
            </p>
            <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-4">{coin.title}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {coin.grade && (
                <span className="px-2.5 py-1 rounded-full bg-brand-charcoal/85 text-white text-xs font-semibold">
                  Grade: {coin.grade}
                </span>
              )}
              {coin.for_exchange && (
                <span className="px-2.5 py-1 rounded-full bg-brand-gold/15 text-brand-gold text-xs font-medium">
                  Available for exchange
                </span>
              )}
            </div>

            {coin.public_comment && (
              <p className="text-brand-charcoal/80 leading-relaxed mb-6 italic">&ldquo;{coin.public_comment}&rdquo;</p>
            )}

            <CoinSpecTable coin={coin} />
          </div>
        </div>

        {relatedCoins.length > 0 && (
          <div className="mt-16 pt-10 border-t border-brand-gold/20">
            <h2 className="font-heading text-2xl font-semibold text-brand-charcoal mb-6">Related coins</h2>
            <CollectionGrid>
              {relatedCoins.map((related) => (
                <CoinCard key={related.id} coin={related} />
              ))}
            </CollectionGrid>
          </div>
        )}
      </Container>
    </Section>
  );
}
