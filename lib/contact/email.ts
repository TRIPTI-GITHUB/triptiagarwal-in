import { Resend } from "resend";

const CONTACT_RECIPIENT = "triptiagarwal161@gmail.com";
// Resend's shared sandbox sender - works with zero domain verification
// as long as the Resend account itself is signed up as
// triptiagarwal161@gmail.com, since sandbox sending is restricted to
// the account's own address.
const SENDER = "Tripti Agarwal Heritage Lab <onboarding@resend.dev>";

export interface ContactSubmission {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactRequestMeta {
  ip: string;
  city: string | null;
  region: string | null;
  country: string | null;
  userAgent: string | null;
  referer: string | null;
  submittedAt: string;
}

function formatLocation(meta: ContactRequestMeta): string {
  const parts = [meta.city, meta.region, meta.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Unknown (not available outside production)";
}

/** Sends the one notification email for a contact form submission, with every captured detail included and Reply-To set to the visitor. */
export async function sendContactNotification(submission: ContactSubmission, meta: ContactRequestMeta): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Email is not configured yet (RESEND_API_KEY is missing).");
  }

  const resend = new Resend(apiKey);

  const lines = [
    `Name: ${submission.fullName}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone || "(not provided)"}`,
    "",
    "Message:",
    submission.message,
    "",
    "---",
    `Submitted: ${meta.submittedAt}`,
    `IP address: ${meta.ip}`,
    `Location: ${formatLocation(meta)}`,
    `Referring page: ${meta.referer ?? "Unknown"}`,
    `User agent: ${meta.userAgent ?? "Unknown"}`,
  ];

  const { error } = await resend.emails.send({
    from: SENDER,
    to: CONTACT_RECIPIENT,
    replyTo: submission.email,
    subject: `New contact form message from ${submission.fullName}`,
    text: lines.join("\n"),
  });

  if (error) {
    throw new Error(error.message);
  }
}
