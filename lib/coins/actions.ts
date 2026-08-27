"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { coinFormSchema, coinFormValuesFromFormData } from "@/lib/coins/schema";

export interface CoinActionResult {
  success: false;
  error: string;
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

/**
 * Uploads a new obverse/reverse image if one was actually chosen.
 * Returns `undefined` (not `null`) when no file was provided, so the
 * caller can omit the column from its update payload entirely and
 * leave the existing image untouched rather than clearing it.
 */
async function uploadCoinImageIfProvided(
  supabase: SupabaseClient,
  slug: string,
  side: "obverse" | "reverse",
  fileEntry: FormDataEntryValue | null
): Promise<string | undefined> {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) return undefined;

  if (!fileEntry.type.startsWith("image/")) {
    throw new Error(`The ${side} file must be an image.`);
  }
  if (fileEntry.size > MAX_IMAGE_BYTES) {
    throw new Error(`The ${side} image must be under 8MB.`);
  }

  const ext = fileEntry.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${slug}/${side}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("coins")
    .upload(path, fileEntry, { contentType: fileEntry.type, upsert: true });
  if (error) throw new Error(`Failed to upload ${side} image: ${error.message}`);

  const { data } = supabase.storage.from("coins").getPublicUrl(path);
  return data.publicUrl;
}

export async function createCoin(formData: FormData): Promise<CoinActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = coinFormSchema.safeParse(coinFormValuesFromFormData(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const values = parsed.data;

  try {
    const obverseUrl = await uploadCoinImageIfProvided(supabase, values.slug, "obverse", formData.get("obverse_image"));
    const reverseUrl = await uploadCoinImageIfProvided(supabase, values.slug, "reverse", formData.get("reverse_image"));

    const { error } = await supabase.from("coins").insert({
      ...values,
      ...(obverseUrl !== undefined ? { obverse_image_url: obverseUrl } : {}),
      ...(reverseUrl !== undefined ? { reverse_image_url: reverseUrl } : {}),
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "That slug is already in use — please choose another." };
      }
      return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }

  revalidatePath("/admin");
  revalidatePath("/collections/coins");
  redirect("/admin");
}

export async function updateCoin(id: string, formData: FormData): Promise<CoinActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "You must be logged in." };

  const parsed = coinFormSchema.safeParse(coinFormValuesFromFormData(formData));
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form for errors." };
  }
  const values = parsed.data;

  try {
    const obverseUrl = await uploadCoinImageIfProvided(supabase, values.slug, "obverse", formData.get("obverse_image"));
    const reverseUrl = await uploadCoinImageIfProvided(supabase, values.slug, "reverse", formData.get("reverse_image"));

    const { error } = await supabase
      .from("coins")
      .update({
        ...values,
        updated_at: new Date().toISOString(),
        ...(obverseUrl !== undefined ? { obverse_image_url: obverseUrl } : {}),
        ...(reverseUrl !== undefined ? { reverse_image_url: reverseUrl } : {}),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "That slug is already in use — please choose another." };
      }
      return { success: false, error: error.message };
    }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Something went wrong." };
  }

  revalidatePath("/admin");
  revalidatePath("/collections/coins");
  revalidatePath(`/collections/coins/${values.slug}`);
  redirect("/admin");
}
