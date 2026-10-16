import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloBook } from "@/components/illustrations";
import { LanguageCard } from "@/components/learning/language-card";
import { getCurrentUser } from "@/lib/supabase/server";
import { getActiveLanguages } from "@/lib/queries/content";
import { getUserLanguages } from "@/lib/queries/progress";

export const metadata: Metadata = { title: "Pilih bahasa" };

export default async function BelajarPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;
  const [languages, mine] = await Promise.all([getActiveLanguages(supabase), getUserLanguages(supabase, userId)]);
  const xpByLanguage = new Map(mine.map((m) => [m.language_id, m.xp]));

  // Kelompokkan per pulau (regions.island).
  const groups = new Map<string, typeof languages>();
  for (const lang of languages) {
    const key = lang.region?.island ?? "Lainnya";
    groups.set(key, [...(groups.get(key) ?? []), lang]);
  }
  const sortedGroups = Array.from(groups.entries()).sort(([a], [b]) =>
    a === "Lainnya" ? 1 : b === "Lainnya" ? -1 : a.localeCompare(b, "id"),
  );

  return (
    <>
      <PageHeader
        icon={GraduationCap}
        category="belajar"
        title="Pilih bahasa"
        description="Mulai dari bahasa daerah asalmu, atau jelajahi bahasa dari pulau lain."
      />

      {languages.length === 0 ? (
        <EmptyState
          illustration={<IlloBook />}
          title="Belum ada bahasa yang aktif"
          description="Tim kami sedang menyiapkan materi. Sambil menunggu, kamu bisa membaca cerita budaya."
        />
      ) : (
        <div className="space-y-10">
          {sortedGroups.map(([island, langs]) => {
            const id = `pulau-${island.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <section key={island} aria-labelledby={id}>
                <h2 id={id} className="mb-3 text-xl">
                  {island === "Lainnya" ? "Bahasa lainnya" : `Pulau ${island}`}{" "}
                  <span className="text-base font-bold text-muted-foreground">({langs.length})</span>
                </h2>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {langs
                    .slice()
                    .sort((a, b) => Number(xpByLanguage.has(b.id)) - Number(xpByLanguage.has(a.id)))
                    .map((lang) => (
                      <li key={lang.id}>
                        <LanguageCard language={lang} learningXp={xpByLanguage.get(lang.id) ?? null} userId={userId} />
                      </li>
                    ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}
