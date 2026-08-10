import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Video Gallery",
  description: "Video coverage and features — coming soon.",
};

export default function VideoGalleryPage() {
  return (
    <ComingSoon
      title="Video Gallery"
      description="Video coverage from exhibitions, talks, and behind-the-scenes moments is on its way."
    />
  );
}
