"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactFormSchema, type ContactFormValues } from "@/lib/contact/schema";
import { submitContactForm } from "@/lib/contact/actions";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { fullName: "", email: "", phone: "", message: "", honeypot: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setStatus(null);
    setSubmitting(true);
    const result = await submitContactForm(values);
    setSubmitting(false);

    if (result.success) {
      setStatus({ type: "success", message: "Thank you — your message has been sent. We'll get back to you soon." });
      reset();
    } else {
      setStatus({ type: "error", message: result.error });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-xl" noValidate>
      {status && (
        <p
          className={
            "text-sm rounded-md px-3 py-2 border " +
            (status.type === "success"
              ? "text-green-800 bg-green-50 border-green-200"
              : "text-red-700 bg-red-50 border-red-200")
          }
        >
          {status.message}
        </p>
      )}

      {/* Honeypot - hidden from sighted users and screen readers alike; a filled value means a bot, not a visitor. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      <label className="block text-sm">
        <span className="block font-medium text-brand-charcoal mb-1.5">
          Full Name <span className="text-brand-gold">*</span>
        </span>
        <input
          type="text"
          {...register("fullName")}
          className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
        {errors.fullName && <span className="block text-xs text-red-700 mt-1">{errors.fullName.message}</span>}
      </label>

      <label className="block text-sm">
        <span className="block font-medium text-brand-charcoal mb-1.5">
          Email <span className="text-brand-gold">*</span>
        </span>
        <input
          type="email"
          {...register("email")}
          className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
        {errors.email && <span className="block text-xs text-red-700 mt-1">{errors.email.message}</span>}
      </label>

      <label className="block text-sm">
        <span className="block font-medium text-brand-charcoal mb-1.5">Phone Number</span>
        <input
          type="tel"
          {...register("phone")}
          className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
      </label>

      <label className="block text-sm">
        <span className="block font-medium text-brand-charcoal mb-1.5">
          Query / Message <span className="text-brand-gold">*</span>
        </span>
        <textarea
          {...register("message")}
          rows={6}
          className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
        />
        {errors.message && <span className="block text-xs text-red-700 mt-1">{errors.message.message}</span>}
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-brand-gold text-white text-sm font-medium px-6 py-2.5 hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Submit"}
      </button>
    </form>
  );
}
