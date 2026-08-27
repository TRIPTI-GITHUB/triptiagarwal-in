import { z } from "zod";

const COIN_TYPES = [
  "Standard circulation coin",
  "Circulating commemorative coin",
  "Non-circulating coin",
  "Other",
] as const;

const COIN_GRADES = ["G", "VG", "F", "VF", "XF", "AU", "UNC"] as const;

export const COIN_TYPE_OPTIONS = COIN_TYPES;
export const COIN_GRADE_OPTIONS = COIN_GRADES;

/** Turns "" (an empty text/number input) into undefined so `.optional()` applies; a real 0 or "0" survives. */
const optionalText = z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.string().optional());
const optionalNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
  z.number().finite().optional()
);
const optionalEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), z.enum(values).optional());

/**
 * Shared create/edit coin form schema - one source of truth used both
 * client-side (react-hook-form's zodResolver, for inline field errors)
 * and server-side (re-validated inside the Server Action, since the
 * client's validation is only a UX convenience, never a security
 * boundary). Mirrors the coins table's own CHECK constraints
 * (coin_type, grade) and NOT NULL columns (country, title, quantity).
 */
export const coinFormSchema = z.object({
  country: z.string().trim().min(1, "Country is required"),
  issuer: optionalText,
  currency: optionalText,
  face_value: optionalNumber,
  title: z.string().trim().min(1, "Title is required"),
  coin_type: optionalEnum(COIN_TYPES),
  shape: optionalText,
  composition: optionalText,
  weight_g: optionalNumber,
  diameter_mm: optionalNumber,
  thickness_mm: optionalNumber,
  orientation: optionalText,
  year: optionalNumber,
  year_raw: optionalText,
  year_calendar: optionalText,
  mintmark: optionalText,
  grade: optionalEnum(COIN_GRADES),
  quantity: z.preprocess((v) => (v === "" || v === null || v === undefined ? 1 : Number(v)), z.number().int().min(0)),
  for_exchange: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  collection_tag: optionalText,
  comment: optionalText,
  public_comment: optionalText,
  buying_price_inr: optionalNumber,
  estimate_inr: optionalNumber,
  private_comment: optionalText,
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  is_published: z.preprocess((v) => v === "on" || v === true, z.boolean()),
});

export type CoinFormValues = z.infer<typeof coinFormSchema>;

/** Extracts and coerces every text-field value from a submitted FormData into the shape coinFormSchema expects. */
export function coinFormValuesFromFormData(formData: FormData): Record<string, unknown> {
  const keys: (keyof CoinFormValues)[] = [
    "country",
    "issuer",
    "currency",
    "face_value",
    "title",
    "coin_type",
    "shape",
    "composition",
    "weight_g",
    "diameter_mm",
    "thickness_mm",
    "orientation",
    "year",
    "year_raw",
    "year_calendar",
    "mintmark",
    "grade",
    "quantity",
    "for_exchange",
    "collection_tag",
    "comment",
    "public_comment",
    "buying_price_inr",
    "estimate_inr",
    "private_comment",
    "slug",
    "is_published",
  ];
  const values: Record<string, unknown> = {};
  for (const key of keys) {
    values[key] = formData.get(key) ?? (key === "for_exchange" || key === "is_published" ? undefined : "");
  }
  return values;
}

/**
 * Suggests a URL slug from country + title + year (e.g.
 * "india-1-pice-1952"), matching the pattern already present across
 * all 819 imported rows. The create form live-fills this as the
 * visitor types but leaves it editable; uniqueness is enforced by the
 * database's `coins_slug_key` constraint, and the form surfaces that
 * error if it fires.
 */
export function suggestCoinSlug(country: string, title: string, year: number | null): string {
  return [country, title, year ? String(year) : null]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFKD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
