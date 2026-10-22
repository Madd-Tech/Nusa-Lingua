import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleEditor } from "@/components/moderation/article-editor";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { getModerationContext } from "@/lib/moderation-context";
import { getRegions } from "@/lib/queries/content";
import { getScopeLanguagesWithRegion } from "@/lib/queries/moderation";

export const metadata: Metadata = { title: "Tulis artikel" };

export default async function ArtikelBaruPage() {
  const { supabase, userId, isModerator, isAdmin, scope } = await getModerationContext();
  if (!isModerator || !userId) return null;
  if (!scope.length) return <NoScopeState />;

  const [languages, regions] = await Promise.all([
    getScopeLanguagesWithRegion(
      supabase,
      scope.map((l) => l.id),
    ),
    getRegions(supabase),
  ]);

  return (
    <>
      <Link href="/moderasi/artikel?status=draft" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Semua artikel
      </Link>
      <h2 className="mb-4 text-xl">Tulis artikel baru</h2>
      <ArticleEditor userId={userId} isAdmin={isAdmin} languages={languages} regions={regions} />
    </>
  );
}
