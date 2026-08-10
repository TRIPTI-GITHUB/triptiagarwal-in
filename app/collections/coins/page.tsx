import type { Metadata } from "next";
import { ComingSoon } from "@/components/ui/ComingSoon";

export const metadata: Metadata = {
  title: "Coins",
  description: "A sortable, searchable catalog of Indian and world coins — coming soon.",
};

export default function CoinsPage() {
  return (
    <ComingSoon
      title="Coins Catalog"
      description="A searchable, sortable catalog of Indian and world coins — by country, composition, and year — is on its way."
    />
  );
}
