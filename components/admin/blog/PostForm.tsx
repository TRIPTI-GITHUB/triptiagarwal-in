"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postFormSchema, suggestPostSlug, type PostFormValues } from "@/lib/blog/schema";
import { savePost, deletePost } from "@/lib/blog/actions";
import { CoverImageUploader } from "@/components/admin/blog/CoverImageUploader";
import { PhotoGalleryUploader } from "@/components/admin/blog/PhotoGalleryUploader";
import { VideoUploader } from "@/components/admin/blog/VideoUploader";
import { VideoListEditor } from "@/components/admin/blog/VideoListEditor";
import { DocumentUploader } from "@/components/admin/blog/DocumentUploader";
import { LinkListEditor } from "@/components/admin/blog/LinkListEditor";
import type { AdminPostWithRelations } from "@/lib/blog/adminQueries";

interface PostFormProps {
  mode: "create" | "edit";
  existing?: AdminPostWithRelations;
}

function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function buildDefaultValues(existing?: AdminPostWithRelations): PostFormValues {
  if (!existing) {
    return {
      title: "",
      slug: "",
      event_date: todayIsoDate(),
      excerpt: "",
      content: "",
      cover_image_url: "",
      published: false,
      photos: [],
      videos: [],
      documents: [],
      links: [],
    };
  }
  const { post, media, links } = existing;
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    event_date: post.event_date,
    excerpt: post.excerpt ?? "",
    content: post.content,
    cover_image_url: post.cover_image_url ?? "",
    published: post.published,
    photos: media
      .filter((m) => m.media_type === "image")
      .map((m) => ({ url: m.url, fileName: m.file_name ?? undefined, caption: m.caption ?? "" })),
    videos: media
      .filter((m) => m.media_type === "video")
      .map((m) => ({
        platform: m.video_platform,
        url: m.url,
        fileName: m.file_name ?? undefined,
        caption: m.caption ?? "",
      })),
    documents: media
      .filter((m) => m.media_type === "document")
      .map((m) => ({ url: m.url, fileName: m.file_name ?? "" })),
    links: links.map((l) => ({ platform: l.platform, url: l.url, label: l.label ?? "" })),
  };
}

export function PostForm({ mode, existing }: PostFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: buildDefaultValues(existing),
  });

  const title = watch("title");
  const coverImageUrl = watch("cover_image_url");
  const photos = watch("photos");
  const videos = watch("videos");
  const documents = watch("documents");
  const links = watch("links");
  const slugRegister = register("slug");

  useEffect(() => {
    if (slugTouched) return;
    const suggested = suggestPostSlug(title ?? "");
    if (suggested) setValue("slug", suggested, { shouldValidate: false });
  }, [title, slugTouched, setValue]);

  async function onSubmit(values: PostFormValues) {
    setServerError(null);
    setSubmitting(true);
    const result = await savePost(values);
    setSubmitting(false);
    if (result && !result.success) {
      setServerError(result.error);
    }
  }

  async function handleDelete() {
    if (!existing) return;
    setDeleting(true);
    const result = await deletePost(existing.post.id);
    setDeleting(false);
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
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Details</legend>

        <label className="block text-sm sm:col-span-2">
          <span className="block font-medium text-brand-charcoal mb-1.5">
            Title <span className="text-brand-gold">*</span>
          </span>
          <input
            type="text"
            {...register("title")}
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
          {errors.title && <span className="block text-xs text-red-700 mt-1">{errors.title.message}</span>}
        </label>

        <label className="block text-sm">
          <span className="block font-medium text-brand-charcoal mb-1.5">
            Slug <span className="text-brand-gold">*</span>
          </span>
          <input
            type="text"
            {...slugRegister}
            onChange={(e) => {
              setSlugTouched(true);
              slugRegister.onChange(e);
            }}
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
          {errors.slug && <span className="block text-xs text-red-700 mt-1">{errors.slug.message}</span>}
        </label>

        <label className="block text-sm">
          <span className="block font-medium text-brand-charcoal mb-1.5">
            Event date <span className="text-brand-gold">*</span>
          </span>
          <input
            type="date"
            {...register("event_date")}
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
          <span className="block text-xs text-brand-charcoal/50 mt-1">Any date, past or future — this is what the blog sorts and displays by.</span>
          {errors.event_date && <span className="block text-xs text-red-700 mt-1">{errors.event_date.message}</span>}
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="block font-medium text-brand-charcoal mb-1.5">Excerpt</span>
          <textarea
            {...register("excerpt")}
            rows={2}
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="block font-medium text-brand-charcoal mb-1.5">
            Content <span className="text-brand-gold">*</span>
          </span>
          <textarea
            {...register("content")}
            rows={8}
            className="w-full rounded-md border border-brand-gold/30 bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
          />
          {errors.content && <span className="block text-xs text-red-700 mt-1">{errors.content.message}</span>}
        </label>

        <label className="flex items-center gap-2.5 text-sm text-brand-charcoal cursor-pointer">
          <input type="checkbox" {...register("published")} className="h-4 w-4 rounded border-brand-gold/40 text-brand-gold focus:ring-brand-gold" />
          Published (visible on the public site)
        </label>
      </fieldset>

      <fieldset className="border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Cover image</legend>
        <CoverImageUploader value={coverImageUrl ?? ""} onChange={(url) => setValue("cover_image_url", url, { shouldValidate: true })} />
      </fieldset>

      <fieldset className="border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Photo gallery</legend>
        <PhotoGalleryUploader photos={photos} onChange={(next) => setValue("photos", next, { shouldValidate: true })} />
      </fieldset>

      <fieldset className="border-t border-brand-gold/20 pt-6 space-y-5">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-1">Videos</legend>
        <VideoUploader videos={videos} onChange={(next) => setValue("videos", next, { shouldValidate: true })} />
        <div>
          <span className="block text-sm font-medium text-brand-charcoal mb-1.5">Or link an existing video</span>
          <VideoListEditor videos={videos} onChange={(next) => setValue("videos", next, { shouldValidate: true })} />
        </div>
      </fieldset>

      <fieldset className="border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Other files (PPT, PDF, etc.)</legend>
        <DocumentUploader documents={documents} onChange={(next) => setValue("documents", next, { shouldValidate: true })} />
      </fieldset>

      <fieldset className="border-t border-brand-gold/20 pt-6">
        <legend className="font-heading text-lg font-semibold text-brand-charcoal mb-3">Links</legend>
        <LinkListEditor links={links} onChange={(next) => setValue("links", next, { shouldValidate: true })} />
      </fieldset>

      <div className="flex items-center gap-4 border-t border-brand-gold/20 pt-6">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-brand-gold text-white text-sm font-medium px-6 py-2.5 hover:bg-brand-gold/90 transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving…" : mode === "create" ? "Create post" : "Save changes"}
        </button>
        <button type="button" onClick={() => router.push("/admin/blog")} className="text-sm text-brand-charcoal/60 hover:text-brand-charcoal">
          Cancel
        </button>

        {mode === "edit" && (
          <div className="ml-auto">
            {confirmingDelete ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-brand-charcoal/70">Delete this post?</span>
                <button type="button" onClick={handleDelete} disabled={deleting} className="text-red-700 font-medium hover:underline disabled:opacity-50">
                  {deleting ? "Deleting…" : "Yes, delete"}
                </button>
                <button type="button" onClick={() => setConfirmingDelete(false)} className="text-brand-charcoal/60 hover:underline">
                  Cancel
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)} className="text-sm text-red-700 hover:underline">
                Delete post
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
