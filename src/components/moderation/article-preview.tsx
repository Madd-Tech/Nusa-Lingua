import { Languages, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RemoteImage } from "@/components/ui/remote-image";
import { ArticleIllustration } from "@/components/culture/article-illustration";
import { ArticleSources } from "@/components/culture/article-sources";
import { MarkdownContent } from "@/components/culture/markdown-content";
import { articleCategoryLabel } from "@/lib/constants";

/** Pratinjau artikel dengan tampilan yang sama seperti halaman /budaya/[slug]. */
export function ArticlePreview({
  title,
  slug,
  category,
  summary,
  content,
  sources,
  coverUrl,
  languageName,
  regionName,
}: {
  title: string;
  slug: string;
  category: string;
  summary?: string;
  content: string;
  sources?: string;
  coverUrl: string | null;
  languageName?: string;
  regionName?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8 overflow-hidden rounded-3xl border-2 border-budaya/30 bg-card">
        {coverUrl ? (
          <RemoteImage src={coverUrl} alt="" eager className="aspect-[16/7] w-full" />
        ) : (
          <ArticleIllustration slug={slug} category={category} className="aspect-[16/7] w-full" />
        )}
        <div className="space-y-3 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted-foreground">
            <Badge variant="budaya">{articleCategoryLabel(category)}</Badge>
            {regionName ? (
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-4" /> {regionName}
              </span>
            ) : null}
            {languageName ? (
              <span className="inline-flex items-center gap-1">
                <Languages aria-hidden="true" className="size-4" /> {languageName}
              </span>
            ) : null}
          </div>
          <h2 className="text-3xl leading-tight sm:text-4xl">{title || "Judul artikel"}</h2>
          {summary ? <p className="text-lg text-muted-foreground">{summary}</p> : null}
        </div>
      </header>
      {content.trim() ? (
        <MarkdownContent content={content} />
      ) : (
        <p className="text-center text-sm italic text-muted-foreground">Isi artikel masih kosong.</p>
      )}
      {sources?.trim() ? <ArticleSources sources={sources} /> : null}
    </div>
  );
}
