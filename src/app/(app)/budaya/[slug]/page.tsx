import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, GraduationCap, Languages, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { RemoteImage } from "@/components/ui/remote-image";
import { ArticleCard } from "@/components/culture/article-card";
import { ArticleIllustration } from "@/components/culture/article-illustration";
import { MarkdownContent } from "@/components/culture/markdown-content";
import { ReadTracker } from "@/components/culture/read-tracker";
import { TableOfContents } from "@/components/culture/table-of-contents";
import { AskAssistantButton } from "@/components/chat/ask-assistant-button";
import { getCurrentUser } from "@/lib/supabase/server";
import { getArticleBySlug, getReadArticleIds, getRelatedArticles } from "@/lib/queries/culture";
import { getPublicPersonas } from "@/lib/queries/personas";
import { articleCategoryLabel } from "@/lib/constants";
import { extractHeadings } from "@/lib/markdown-toc";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { supabase } = await getCurrentUser();
  const article = await getArticleBySlug(supabase, params.slug).catch(() => null);
  return { title: article?.title ?? "Budaya", description: article?.summary ?? undefined };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const { supabase, user } = await getCurrentUser();
  const article = await getArticleBySlug(supabase, params.slug);
  if (!article) notFound();

  const [related, readIds, personas] = await Promise.all([
    getRelatedArticles(supabase, article),
    getReadArticleIds(supabase, user!.id),
    // Persona dibaca di server (service role); hanya kolom publik.
    getPublicPersonas().catch(() => []),
  ]);
  const persona = article.language_id ? personas.find((p) => p.language_id === article.language_id) ?? null : null;
  const headings = extractHeadings(article.content);
  const minutes = Math.max(1, Math.round(article.content.split(/\s+/).length / 200));
  const alreadyRead = readIds.has(article.id);

  return (
    <div className="mx-auto max-w-5xl">
      <ReadTracker userId={user!.id} articleId={article.id} alreadyRead={alreadyRead} />
      <Link href="/budaya" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Semua artikel
      </Link>

      <header className="relative mb-8 overflow-hidden rounded-3xl border-2 border-budaya/30 bg-card">
        {article.cover_url ? (
          <RemoteImage src={article.cover_url} alt="" eager className="aspect-[16/7] w-full" />
        ) : (
          <ArticleIllustration
            slug={article.slug}
            category={article.category}
            className="aspect-[16/7] w-full"
          />
        )}
        <div className="space-y-3 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-semibold text-muted-foreground">
            <Badge variant="budaya">{articleCategoryLabel(article.category)}</Badge>
            {article.region ? (
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-4" />
                {[article.region.name, article.region.province].filter(Boolean).join(", ")}
              </span>
            ) : null}
            {article.language ? (
              <span className="inline-flex items-center gap-1">
                <Languages aria-hidden="true" className="size-4" /> {article.language.name}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Clock aria-hidden="true" className="size-4" /> {minutes} menit baca
            </span>
            {alreadyRead ? (
              <Badge variant="success">
                <CheckCircle2 aria-hidden="true" /> Sudah dibaca
              </Badge>
            ) : null}
          </div>
          <h1 className="text-3xl leading-tight sm:text-4xl">{article.title}</h1>
          {article.summary ? <p className="text-lg text-muted-foreground">{article.summary}</p> : null}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_220px]">
        <article id="isi-artikel" className="min-w-0">
          <MarkdownContent content={article.content} />
        </article>
        {headings.length >= 2 ? (
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        ) : null}
      </div>

      <aside aria-label="Lanjutkan" className="relative mt-10 overflow-hidden rounded-3xl border-2 bg-card p-5 sm:p-6">
        <BatikPattern variant="kawung" color="rgb(var(--c-budaya))" opacity={0.05} />
        <div className="relative space-y-4">
          <p className="text-lg font-extrabold">Sudah selesai membaca? Lanjutkan petualanganmu.</p>
          <div className="flex flex-wrap gap-2">
            {article.language ? (
              <Button asChild>
                <Link href={`/belajar/${article.language.code}`}>
                  <GraduationCap aria-hidden="true" /> Pelajari bahasanya
                </Link>
              </Button>
            ) : null}
            {persona ? (
              <AskAssistantButton userId={user!.id} persona={{ id: persona.id, name: persona.name }} articleTitle={article.title} />
            ) : (
              <Button asChild variant="outline">
                <Link href="/asisten">Tanya asisten AI</Link>
              </Button>
            )}
          </div>
        </div>
      </aside>

      {related.length ? (
        <section aria-labelledby="terkait" className="mt-12">
          <h2 id="terkait" className="mb-4 text-xl">
            Artikel terkait
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {related.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} read={readIds.has(a.id)} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
