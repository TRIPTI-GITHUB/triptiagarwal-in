/**
 * UnderDevelopmentBanner
 * Always-visible notice strip at the top of the homepage, directly
 * under the sticky header (Header.tsx isn't `fixed`, so this just
 * flows into place below it). Not dismissible - the site being under
 * development is a standing fact for every visit, not a one-time tip.
 */
export function UnderDevelopmentBanner() {
  return (
    <div className="w-full bg-brand-charcoal text-center px-4 py-2.5">
      <p className="text-xs sm:text-sm text-white/90">
        This website is under development by Tripti Agarwal. For any queries, please contact{" "}
        <a href="mailto:triptiagarwal161@gmail.com" className="text-brand-gold hover:underline">
          triptiagarwal161@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
