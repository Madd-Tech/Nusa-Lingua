import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RemoteImage } from "@/components/ui/remote-image";
import { ArticleIllustration } from "@/components/culture/article-illustration";
import { FeatureLink } from "@/components/layout/feature-link";
import { articleCategoryLabel } from "@/lib/constants";
import type { ArticleCardData } from "@/lib/queries/culture";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  read,
  featureLink,
  className,
}: {
  article: ArticleCardData;
  read?: boolean;
  /** Dipakai di halaman publik: link lewat goToFeature (tamu → /masuk?next=...). */
  featureLink?: { isLoggedIn: boolean };
  className?: string;
}) {
  const path = `/budaya/${article.slug}`;
  const cardClass = cn(
    "group flex h-full flex-col overflow-hidden rounded-3xl border-2 bg-card shadow-soft transition-shadow hover:shadow-lift focus-visible:ring-2",
    className,
  );

  const body = (
    <>
      <div className="relative aspect-[16/9] overflow-hidden bg-budaya/10">
        {article.cover_url ? (
          <RemoteImage
            src={article.cover_url}
            alt=""
            className="h-full w-full transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ArticleIllustration slug={article.slug} category={article.category} />
        )}
        {read ? (
          <Badge variant="success" className="absolute right-3 top-3 bg-card/95 shadow-soft">
            <CheckCircle2 aria-hidden="true" /> Sudah dibaca
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="budaya">{articleCategoryLabel(article.category)}</Badge>
          {article.region ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5" /> {article.region.name}
            </span>
          ) : null}
        </div>
        <h3 className="text-lg leading-snug group-hover:underline group-hover:underline-offset-4">{article.title}</h3>
        {article.summary ? <p className="line-clamp-3 text-sm text-muted-foreground">{article.summary}</p> : null}
      </div>
    </>
  );

  if (featureLink) {
    return (
      <FeatureLink path={path} isLoggedIn={featureLink.isLoggedIn} className={cardClass}>
        {body}
      </FeatureLink>
    );
  }
  return (
    <Link href={path} className={cardClass}>
      {body}
    </Link>
  );
}
