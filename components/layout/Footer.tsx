import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SocialIcons } from "@/components/layout/SocialIcons";
import { NAV_ITEMS } from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, SiteContent } from "@/lib/supabase/database.types";

/**
 * Footer
 * Site-wide footer, rendered once in the root layout - reworked from a
 * single copyright line into the Design Brief's 3-4 column layout
 * (site map, contact, social, closing tagline). `id="contact"` so the
 * Header's utility "Contact" link and the mobile overlay's link both
 * scroll here on whatever page the visitor is currently on.
 *
 * Queries `site_content` for social_links - that table may not exist
 * yet if the migration hasn't been applied (no Supabase MCP access in
 * this environment), in which case Supabase returns a query error and
 * `data` comes back null, which the render below already treats the
 * same as "no social links yet."
 */
export async function Footer() {
  const supabase = await createClient();

  const [{ data: profile }, { data: siteContent }] = await Promise.all([
    supabase
      .from("profiles")
      .select("contact_phone, contact_email")
      .limit(1)
      .maybeSingle<Pick<Profile, "contact_phone" | "contact_email">>(),
    supabase.from("site_content").select("social_links").limit(1).maybeSingle<Pick<SiteContent, "social_links">>(),
  ]);

  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="w-full border-t border-brand-gold/20 mt-auto bg-brand-cream">
      <Container className="py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <p className="font-heading text-lg font-bold text-brand-charcoal mb-2">
            Tripti Agarwal <span className="text-brand-gold font-normal">Heritage Lab</span>
          </p>
          <p className="text-sm text-brand-charcoal/60 italic">Preserving the Past. Inspiring the Future.</p>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold text-brand-charcoal mb-3 uppercase tracking-wide">
            Site Map
          </p>
          <ul className="space-y-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-brand-charcoal/70 hover:text-brand-teal transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-heading text-sm font-semibold text-brand-charcoal mb-3 uppercase tracking-wide">
            Contact
          </p>
          {profile?.contact_phone || profile?.contact_email ? (
            <ul className="space-y-2 text-sm text-brand-charcoal/70">
              {profile.contact_phone && (
                <li>
                  <a href={`tel:${profile.contact_phone}`} className="hover:text-brand-teal transition-colors">
                    {profile.contact_phone}
                  </a>
                </li>
              )}
              {profile.contact_email && (
                <li>
                  <a href={`mailto:${profile.contact_email}`} className="hover:text-brand-teal transition-colors">
                    {profile.contact_email}
                  </a>
                </li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-brand-charcoal/40 italic">Contact details coming soon.</p>
          )}
        </div>

        <div>
          <p className="font-heading text-sm font-semibold text-brand-charcoal mb-3 uppercase tracking-wide">
            Find Us
          </p>
          <SocialIcons links={siteContent?.social_links ?? null} />
        </div>
      </Container>

      <div className="border-t border-brand-gold/10">
        <Container className="py-6 flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 text-center">
          <p className="text-xs text-brand-charcoal/60">
            © {year} Tripti Agarwal Heritage Lab. All rights reserved.
          </p>
          <p className="text-xs italic text-brand-teal">Preserving the Past. Inspiring the Future.</p>
        </Container>
        <Container className="pb-6 text-center">
          <p className="text-xs text-brand-charcoal/50">
            This site uses anonymous visit analytics to improve the experience — no personal data is stored.{" "}
            <Link href="/privacy" className="text-brand-teal hover:underline">
              Privacy Policy
            </Link>
          </p>
        </Container>
      </div>
    </footer>
  );
}
