import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ArticleEditor } from "@/components/moderation/article-editor";
import { getModerationContext } from "@/lib/moderation-context";
import { getRegions } from "@/lib/queries/content";
import { getArticleForEdit, getScopeLanguagesWithRegion } from "@/lib/queries/moderation";
import { parseId } from "@/lib/utils";

export const metadata: Metadata = { title: "Editor artikel" };

export default async function EditArtikelPage({ params }: { params: { id: string } }) {
  const { supabase, userId, isModerator, isAdmin, scope } = await getModerationContext();
  if (!isModerator || !userId) return null;
  const id = parseId(params.id);
  if (!id) notFound();

  const article = await getArticleForEdit(supabase, id);
  if (!article) notFound();

  // Artikel terbit terbaca semua orang; editor hanya untuk bahasa yang dimoderasi (bahasa kosong = admin).
  const canEdit = article.language_id ? scope.some((l) => l.id === article.language_id) : isAdmin;
  const back = (
    <Link
      href={`/moderasi/artikel?status=${article.status}`}
      className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" className="size-4" /> Semua artikel
    </Link>
  );

  if (!canEdit) {
    return (
      <>
        {back}
        <EmptyState
          illustration={<ShieldX aria-hidden="true" className="size-20 text-komunitas" />}
          title="Di luar bahasa yang kamu moderasi"
          description={`Artikel “${article.title}” hanya bisa diedit moderator ${article.language?.name ?? "bahasa terkait"} atau admin.`}
        />
      </>
    );
  }

  const [languages, regions] = await Promise.all([
    getScopeLanguagesWithRegion(
      supabase,
      scope.map((l) => l.id),
    ),
    getRegions(supabase),
  ]);

  return (
    <>
      {back}
      <h2 className="mb-4 break-words text-xl">{article.title}</h2>
      <ArticleEditor
        key={`${article.id}-${article.status}`}
        userId={userId}
        isAdmin={isAdmin}
        languages={languages}
        regions={regions}
        article={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          category: article.category,
          language_id: article.language_id,
          region_id: article.region_id,
          summary: article.summary,
          content: article.content,
          sources: article.sources,
          cover_url: article.cover_url,
          status: article.status,
          author_id: article.author_id,
          author_username: article.author?.username ?? null,
          editor_username: article.editor?.username ?? null,
          updated_at: article.updated_at,
          created_at: article.created_at,
          published_at: article.published_at,
          review_note: article.review_note,
        }}
      />
    </>
  );
}
