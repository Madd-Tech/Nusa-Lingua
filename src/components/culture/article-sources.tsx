import { BookMarked } from "lucide-react";
import { MarkdownContent } from "@/components/culture/markdown-content";

/** Daftar rujukan artikel (Markdown). */
export function ArticleSources({ sources }: { sources: string }) {
  return (
    <section aria-labelledby="rujukan" className="mt-10 rounded-3xl border-2 bg-card p-5 sm:p-6">
      <h2 id="rujukan" className="mb-2 flex items-center gap-2 text-lg">
        <BookMarked aria-hidden="true" className="size-5 text-budaya" /> Rujukan
      </h2>
      <MarkdownContent content={sources} variant="chat" className="text-sm text-muted-foreground" />
    </section>
  );
}
