import { MonogramIcon } from "@/components/layout/SocialIcons";
import type { PostMedia } from "@/lib/supabase/database.types";

interface DocumentsListProps {
  documents: PostMedia[];
}

/** post_media rows with media_type "document" (PPT, PDF, etc.) as simple download links. */
export function DocumentsList({ documents }: DocumentsListProps) {
  if (documents.length === 0) return null;

  return (
    <ul className="space-y-2">
      {documents.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 border border-brand-gold/20 rounded-sm bg-white px-5 py-3 hover:border-brand-gold transition-colors"
          >
            <span className="text-brand-charcoal/60">
              <MonogramIcon letter="D" />
            </span>
            <span className="text-sm font-medium text-brand-charcoal">{doc.file_name || "Download"}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
