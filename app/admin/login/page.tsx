import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { login } from "@/lib/auth/actions";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const { error } = await searchParams;

  return (
    <Section>
      <Container className="max-w-sm">
        <h1 className="font-heading text-3xl font-bold text-brand-charcoal mb-6 text-center">Admin Login</h1>

        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
            {decodeURIComponent(error)}
          </p>
        )}

        <form action={login} className="space-y-4">
          <label className="block text-sm">
            <span className="block font-medium text-brand-charcoal mb-1.5">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="username"
              className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </label>

          <label className="block text-sm">
            <span className="block font-medium text-brand-charcoal mb-1.5">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-brand-gold text-white text-sm font-medium py-2.5 hover:bg-brand-gold/90 transition-colors"
          >
            Log in
          </button>
        </form>
      </Container>
    </Section>
  );
}
