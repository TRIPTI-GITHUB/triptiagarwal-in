import type { AboutPhoto } from "@/lib/supabase/database.types";

interface PolaroidPhotoProps {
  photo: AboutPhoto | null;
  /** Fixed rotation in degrees - never randomized, so server and client render identically. */
  rotation?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<PolaroidPhotoProps["size"]>, string> = {
  sm: "w-40 sm:w-48",
  md: "w-56 sm:w-64",
  lg: "w-64 sm:w-80",
};

/**
 * PolaroidPhoto
 * A white-bordered, slightly rotated photo frame evoking a physical
 * polaroid. Renders a graceful placeholder when `photo` is null (about
 * scrapbook draft page may be reviewed before Tripti has uploaded
 * photos), and falls back to a non-empty alt string with a dev-time
 * warning if a supplied photo is missing its own alt text - this is a
 * meaningful content image, not decorative, so an empty alt would be
 * wrong.
 */
export function PolaroidPhoto({ photo, rotation = 0, size = "md", className = "" }: PolaroidPhotoProps) {
  if (photo && !photo.alt && process.env.NODE_ENV !== "production") {
    console.warn("PolaroidPhoto: photo is missing alt text —", photo.url);
  }

  return (
    <div
      className={`inline-block bg-white p-3 pb-8 shadow-lg ${SIZE_CLASSES[size]} ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="aspect-[4/5] w-full bg-brand-teal/5 overflow-hidden">
        {photo ? (
          <img
            src={photo.url}
            alt={photo.alt || "Photo of Tripti Agarwal"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-charcoal/30 text-sm italic text-center px-4">
            Photo coming soon
          </div>
        )}
      </div>
    </div>
  );
}
