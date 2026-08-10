import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Recognition & Memberships",
  description: "Formal memberships, awards, and accolades — coming soon.",
};

export default function RecognitionPage() {
  return (
    <ComingSoon
      title="Recognition & Memberships"
      description="A full account of memberships, awards, and accolades earned along the way is being prepared."
    />
  );
}
