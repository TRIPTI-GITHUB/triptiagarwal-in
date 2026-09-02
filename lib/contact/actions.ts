"use server";

import { headers } from "next/headers";
import { contactFormSchema, type ContactFormValues } from "@/lib/contact/schema";
import { sendContactNotification } from "@/lib/contact/email";

export type ContactActionResult = { success: true } | { success: false; error: string };

/**
 * IP/location come straight from request headers - this Next.js
 * version removed NextRequest.ip/.geo entirely (confirmed in
 * node_modules/next/dist/docs' version-history, not assumed), and
 * `x-vercel-ip-*` are plain HTTP headers Vercel's edge network injects
 * into every request, so no extra dependency is needed to read them.
 * They're only present in production on Vercel - locally they're just
 * absent, which formatLocation (lib/contact/email.ts) already handles.
 */
async function captureRequestMeta() {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "Unknown";

  return {
    ip,
    city: headerList.get("x-vercel-ip-city"),
    region: headerList.get("x-vercel-ip-country-region"),
    country: headerList.get("x-vercel-ip-country"),
    userAgent: headerList.get("user-agent"),
    referer: headerList.get("referer"),
    submittedAt: new Date().toISOString(),
  };
}

export async function submitContactForm(input: ContactFormValues): Promise<ContactActionResult> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const values = parsed.data;

  // A filled honeypot means a bot filled every input it found. Report
  // success without sending anything, so the bot gets no signal that
  // it was caught and no reason to try a different approach.
  if (values.honeypot) {
    return { success: true };
  }

  try {
    const meta = await captureRequestMeta();
    await sendContactNotification(
      { fullName: values.fullName, email: values.email, phone: values.phone, message: values.message },
      meta
    );
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Something went wrong. Please try again." };
  }

  return { success: true };
}
