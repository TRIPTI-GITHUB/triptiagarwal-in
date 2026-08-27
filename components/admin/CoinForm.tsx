"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  coinFormSchema,
  suggestCoinSlug,
  COIN_TYPE_OPTIONS,
  COIN_GRADE_OPTIONS,
  type CoinFormValues,
} from "@/lib/coins/schema";
import type { CoinActionResult } from "@/lib/coins/actions";
import type { Coin } from "@/lib/supabase/database.types";

interface CoinFormProps {
  mode: "create" | "edit";
  coin?: Coin;
  action: (formData: FormData) => Promise<CoinActionResult>;
}

function coinToDefaultValues(coin?: Coin): Partial<CoinFormValues> {
  if (!coin) {
    return { quantity: 1, for_exchange: false, is_published: true };
  }
  return {
    country: coin.country,
    issuer: coin.issuer ?? undefined,
    currency: coin.currency ?? undefined,
    face_value: coin.face_value ?? undefined,
    title: coin.title,
    coin_type: coin.coin_type ?? undefined,
    shape: coin.shape ?? undefined,
    composition: coin.composition ?? undefined,
    weight_g: coin.weight_g ?? undefined,
    diameter_mm: coin.diameter_mm ?? undefined,
    thickness_mm: coin.thickness_mm ?? undefined,
    orientation: coin.orientation ?? undefined,
    year: coin.year ?? undefined,
    year_raw: coin.year_raw ?? undefined,
    year_calendar: coin.year_calendar ?? undefined,
    mintmark: coin.mintmark ?? undefined,
    grade: coin.grade ?? undefined,
    quantity: coin.quantity,
    for_exchange: coin.for_exchange,
    collection_tag: coin.collection_tag ?? undefined,
    comment: coin.comment ?? undefined,
    public_comment: coin.public_comment ?? undefined,
    buying_price_inr: coin.buying_price_inr ?? undefined,
    estimate_inr: coin.estimate_inr ?? undefined,
    private_comment: coin.private_comment ?? undefined,
    slug: coin.slug ?? undefined,
    is_published: coin.is_published,
  };
}

function buildFormData(values: CoinFormValues, obverseFile?: File, reverseFile?: File): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "boolean") {
      if (value) formData.append(key, "on");
    } else {
      formData.append(key, String(value));
    }
  }
  if (obverseFile) formData.append("obverse_image", obverseFile);
  if (reverseFile) formData.append("reverse_image", reverseFile);
  return formData;
}

function Field(props: {
  label: string;
  error?: string;
  type?: string;
  register: UseFormRegisterReturn;
  required?: boolean;
}) {
  const { label, error, type = "text", register, required } = props;
  return (
    <label className="block text-sm">
      <span className="block font-medium text-brand-charcoal mb-1.5">
        {label}
        {required && <span className="text-brand-gold"> *</span>}
      </span>
      <input
        type={type}
        step={type === "number" ? "any" : undefined}
        {...register}
        aria-invalid={Boolean(error)}
        className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
      />
      {error && <span className="block text-xs text-red-700 mt-1">{error}</span>}
    </label>
  );
}

function SelectField(props: {
  label: string;
  error?: string;
  register: UseFormRegisterReturn;
  options: readonly string[];
}) {
  const { label, error, register, options } = props;
  return (
    <label className="block text-sm">
      <span className="block font-medium text-brand-charcoal mb-1.5">{label}</span>
      <select
        {...register}
        aria-invalid={Boolean(error)}
        className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <span className="block text-xs text-red-700 mt-1">{error}</span>}
    </label>
  );
}

function ImageField(props: { label: string; existingUrl: string | null | undefined; inputRef: React.RefObject<HTMLInputElement | null> }) {
  const { label, existingUrl, inputRef } = props;
  return (
    <label className="block text-sm">
      <span className="block font-medium text-brand-charcoal mb-1.5">{label}</span>
      {existingUrl && (
        <img src={existingUrl} alt={`Current ${label.toLowerCase()}`} className="w-24 h-24 object-contain border border-brand-charcoal/10 bg-brand-teal/5 mb-2" />
      )}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="w-full text-sm text-brand-charcoal file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-brand-gold/15 file:text-brand-gold file:text-sm file:font-medium"
      />
      {existingUrl && <span className="block text-xs text-brand-charcoal/50 mt-1">Choose a file to replace it.</span>}
    </label>
  );
}

export function CoinForm({ mode, coin, action }: CoinFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const obverseInputRef = useRef<HTMLInputElement>(null);
  const reverseInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.input<typeof coinFormSchema>, unknown, CoinFormValues>({
    // zod's preprocess()'d fields make the schema's input type looser
    // than its output type (CoinFormValues) - the three type params
    // here are @hookform/resolvers' documented way to tell RHF "fields
    // hold this raw shape, but handleSubmit's callback gets the
    // validated/coerced CoinFormValues shape instead."
    resolver: zodResolver(coinFormSchema),
    defaultValues: coinToDefaultValues(coin),
  });

  const country = watch("country");
  const title = watch("title");
  const year = watch("year");
  const slugRegister = register("slug");

  // Keep the slug field synced to the suggestion until the visitor
  // edits it directly (tracked via slugTouched, set the moment they
  // type into the slug field themselves - see the Field below).
  useEffect(() => {
    if (slugTouched) return;
    const suggested = suggestCoinSlug(country ?? "", title ?? "", year ? Number(year) : null);
    if (suggested) setValue("slug", suggested, { shouldValidate: false });
  }, [country, title, year, slugTouched, setValue]);

  async function onSubmit(values: CoinFormValues) {
    setServerError(null);
    setSubmitting(true);
    const formData = buildFormData(values, obverseInputRef.current?.files?.[0], reverseInputRef.current?.files?.[0]);
    const result = await action(formData);
    setSubmitting(false);
    if (result && !result.success) {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 max-w-3xl">
      {serverError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">{serverError}</p>
      )}

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Identification</legend>
        <Field label="Country" required register={register("country")} error={errors.country?.message} />
        <Field label="Title" required register={register("title")} error={errors.title?.message} />
        <Field label="Issuer" register={register("issuer")} error={errors.issuer?.message} />
        <Field
          label="Slug"
          required
          register={{
            ...slugRegister,
            onChange: (e) => {
              setSlugTouched(true);
              return slugRegister.onChange(e);
            },
          }}
          error={errors.slug?.message}
        />
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Classification</legend>
        <SelectField label="Type" register={register("coin_type")} options={COIN_TYPE_OPTIONS} />
        <Field label="Shape" register={register("shape")} />
        <Field label="Composition" register={register("composition")} />
        <SelectField label="Grade" register={register("grade")} options={COIN_GRADE_OPTIONS} />
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Physical specs</legend>
        <Field label="Face value" type="number" register={register("face_value")} error={errors.face_value?.message} />
        <Field label="Currency" register={register("currency")} />
        <Field label="Weight (g)" type="number" register={register("weight_g")} error={errors.weight_g?.message} />
        <Field label="Diameter (mm)" type="number" register={register("diameter_mm")} error={errors.diameter_mm?.message} />
        <Field label="Thickness (mm)" type="number" register={register("thickness_mm")} error={errors.thickness_mm?.message} />
        <Field label="Orientation" register={register("orientation")} />
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Dating &amp; mint</legend>
        <Field label="Year" type="number" register={register("year")} error={errors.year?.message} />
        <Field label="Year (as inscribed)" register={register("year_raw")} />
        <Field label="Calendar" register={register("year_calendar")} />
        <Field label="Mintmark" register={register("mintmark")} />
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Collection</legend>
        <Field label="Quantity held" type="number" register={register("quantity")} error={errors.quantity?.message} />
        <Field label="Collection tag" register={register("collection_tag")} />
        <label className="flex items-center gap-2.5 text-sm text-brand-charcoal cursor-pointer">
          <input type="checkbox" {...register("for_exchange")} className="h-4 w-4 rounded border-brand-gold/40 text-brand-gold focus:ring-brand-gold" />
          Available for exchange
        </label>
        <label className="flex items-center gap-2.5 text-sm text-brand-charcoal cursor-pointer">
          <input type="checkbox" {...register("is_published")} className="h-4 w-4 rounded border-brand-gold/40 text-brand-gold focus:ring-brand-gold" />
          Published (visible on the public site)
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 gap-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Notes</legend>
        <label className="block text-sm">
          <span className="block font-medium text-brand-charcoal mb-1.5">Public comment (shown on the coin&rsquo;s page)</span>
          <textarea {...register("public_comment")} rows={2} className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold" />
        </label>
        <label className="block text-sm">
          <span className="block font-medium text-brand-charcoal mb-1.5">Internal comment (never shown publicly)</span>
          <textarea {...register("comment")} rows={2} className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold" />
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-1">Private — never shown publicly</legend>
        <p className="sm:col-span-2 text-xs text-brand-charcoal/50 -mt-2 mb-1">
          Excluded from the public coins_public view. Visible only here in admin.
        </p>
        <Field label="Buying price (INR)" type="number" register={register("buying_price_inr")} />
        <Field label="Estimated value (INR)" type="number" register={register("estimate_inr")} />
        <label className="block text-sm sm:col-span-2">
          <span className="block font-medium text-brand-charcoal mb-1.5">Private notes</span>
          <textarea {...register("private_comment")} rows={2} className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold" />
        </label>
      </fieldset>

      <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Images</legend>
        <ImageField label="Obverse" existingUrl={coin?.obverse_image_url} inputRef={obverseInputRef} />
        <ImageField label="Reverse" existingUrl={coin?.reverse_image_url} inputRef={reverseInputRef} />
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-gold text-white text-sm font-medium px-6 py-2.5 hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "create" ? "Create coin" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="text-sm text-brand-charcoal/60 hover:text-brand-charcoal"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
