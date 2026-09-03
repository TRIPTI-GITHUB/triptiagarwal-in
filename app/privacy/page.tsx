import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What this site collects, what it doesn't, and how visit analytics are handled.",
};

/**
 * Kept deliberately in sync with lib/analytics/schema.ts and the
 * visitor_sessions/page_views columns - if a field is ever added to
 * what's tracked, this page should be updated in the same change, not
 * left to drift.
 */
export default function PrivacyPolicyPage() {
  return (
    <Section>
      <Container className="max-w-2xl">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-brand-charcoal mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-brand-charcoal/80 leading-relaxed">
          <p>
            This site uses anonymous visit analytics to understand how it&rsquo;s used and to improve it — no
            personal data is collected through this, and nothing is ever sold or shared with third parties.
          </p>

          <div>
            <h2 className="font-heading text-xl font-semibold text-brand-charcoal mb-3">What is collected</h2>
            <ul className="list-disc list-outside pl-5 space-y-1.5">
              <li>Pages visited and roughly how long each page was viewed</li>
              <li>Approximate location (country and city), derived from network information, never your exact address</li>
              <li>General device type, browser, and operating system (e.g. &ldquo;mobile, Safari, iOS&rdquo;)</li>
              <li>How you arrived at the site — the referring website, or campaign parameters if you followed a tagged link</li>
              <li>
                A randomly generated identifier that exists only for the length of your visit, stored in your
                browser&rsquo;s temporary session storage and cleared when you close the tab
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-brand-charcoal mb-3">What is not collected</h2>
            <ul className="list-disc list-outside pl-5 space-y-1.5">
              <li>Your name, email address, or any other personally identifying information</li>
              <li>Your exact IP address — it is never stored, only the coarse country/city derived from it</li>
              <li>Anything that tracks you across other websites</li>
              <li>Any link between an anonymous visit and a signed-in account</li>
            </ul>
            <p className="mt-3 text-sm text-brand-charcoal/60">
              If you use the <a href="/contact" className="text-brand-teal hover:underline">Contact</a> form, the
              name, email, and message you submit there are handled separately, only to respond to your message.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-brand-charcoal mb-3">Retention</h2>
            <p>
              Detailed visit records are kept for up to 18 months. After that, they&rsquo;re reduced to anonymous
              daily totals (for example, &ldquo;142 visits on a given day&rdquo;) and the underlying detailed
              records are deleted.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-xl font-semibold text-brand-charcoal mb-3">Questions</h2>
            <p>
              For any questions about this policy, please contact{" "}
              <a href="mailto:triptiagarwal161@gmail.com" className="text-brand-teal hover:underline">
                triptiagarwal161@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
