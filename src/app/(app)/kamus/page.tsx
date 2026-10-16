import type { Metadata } from "next";
import Link from "next/link";
import { BookA } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloBook } from "@/components/illustrations";
import { LanguageIcon } from "@/components/learning/language-icon";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveLanguages } from "@/lib/queries/content";
import { getUserLanguages } from "@/lib/queries/progress";

export const metadata: Metadata = { title: "Kamus" };

export default async function KamusIndexPage() {
  const { supabase, user } = await getCurrentUser();
  const [languages, mine] = await Promise.all([getActiveLanguages(supabase), getUserLanguages(supabase, user!.id)]);
  const mineIds = new Set(mine.map((m) => m.language_id));
  const sorted = [...languages].sort((a, b) => Number(mineIds.has(b.id)) - Number(mineIds.has(a.id)));

  return (
    <>
      <PageHeader icon={BookA} category="belajar" title="Kamus" description="Cari kata, dengarkan pelafalannya, dan lihat contoh kalimat." />
      {sorted.length === 0 ? (
        <EmptyState illustration={<IlloBook />} title="Kamus belum tersedia" description="Belum ada bahasa yang aktif." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((lang) => (
            <li key={lang.id}>
              <Link
                href={`/kamus/${lang.code}`}
                className="flex items-center gap-3 rounded-2xl border-2 border-b-4 bg-card p-4 transition-colors hover:border-primary/50"
              >
                <LanguageIcon name={lang.name} iconUrl={lang.icon_url} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold">Kamus {lang.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {mineIds.has(lang.id) ? "Sedang kamu pelajari" : lang.region?.province ?? lang.region?.name ?? ""}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
