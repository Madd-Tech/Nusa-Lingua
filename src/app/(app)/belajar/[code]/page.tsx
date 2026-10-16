import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { IlloBook } from "@/components/illustrations";
import { LanguageIcon } from "@/components/learning/language-icon";
import { LanguageTabs } from "@/components/learning/language-tabs";
import { StartLanguageButton } from "@/components/learning/start-language-button";
import { UnitPath } from "@/components/learning/unit-path";
import { computePath } from "@/lib/path";
import { getCurrentUser } from "@/lib/supabase/server";
import { getLanguageByCode, getUnitsWithLessons } from "@/lib/queries/content";
import { getLessonProgress, getUserLanguages } from "@/lib/queries/progress";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const { supabase } = await getCurrentUser();
  const lang = await getLanguageByCode(supabase, params.code).catch(() => null);
  return { title: lang ? `Belajar ${lang.name}` : "Belajar" };
}

export default async function LanguagePathPage({ params }: { params: { code: string } }) {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  const language = await getLanguageByCode(supabase, params.code);
  if (!language) notFound();

  const [units, mine] = await Promise.all([getUnitsWithLessons(supabase, language.id), getUserLanguages(supabase, userId)]);
  const lessonIds = units.flatMap((u) => u.lessons.map((l) => l.id));
  const progressRows = await getLessonProgress(supabase, userId, lessonIds);
  const progress = new Map(progressRows.map((p) => [p.lesson_id, p]));
  const path = computePath(units, progress);

  const total = lessonIds.length;
  const completed = progressRows.filter((p) => p.status === "completed").length;
  const stars = progressRows.reduce((s, p) => s + (p.stars ?? 0), 0);
  const membership = mine.find((m) => m.language_id === language.id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/belajar" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Semua bahasa
      </Link>

      <section className="relative mb-6 overflow-hidden rounded-3xl border-2 bg-card p-5">
        <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.06} />
        <div className="relative flex items-start gap-4">
          <LanguageIcon name={language.name} iconUrl={language.icon_url} className="size-16" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl">{language.name}</h1>
            {language.region ? (
              <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin aria-hidden="true" className="size-4" />
                {[language.region.name, language.region.province].filter(Boolean).join(", ")}
              </p>
            ) : null}
          </div>
          {membership ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-secondary/20 px-2.5 py-1 text-sm font-extrabold">
              <Zap aria-hidden="true" className="size-4 fill-secondary text-secondary" /> {formatNumber(membership.xp)} XP
            </span>
          ) : null}
        </div>
        {language.description ? <p className="relative mt-3 text-sm text-muted-foreground">{language.description}</p> : null}
        {total > 0 ? (
          <div className="relative mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span>
                {completed}/{total} lesson selesai
              </span>
              <span className="inline-flex items-center gap-1">
                <Star aria-hidden="true" className="size-4 fill-secondary text-secondary" /> {stars} bintang
              </span>
            </div>
            <Progress value={completed} max={total} aria-label={`Progres ${completed} dari ${total} lesson`} className="h-3" />
          </div>
        ) : null}
        {!membership ? (
          <div className="relative mt-4 flex flex-col gap-3 rounded-2xl border-2 border-dashed p-4 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm">Tambahkan {language.name} ke daftar belajarmu untuk mencatat XP per bahasa.</p>
            <StartLanguageButton userId={userId} languageId={language.id} code={language.code} languageName={language.name} size="sm">
              Tambahkan
            </StartLanguageButton>
          </div>
        ) : null}
      </section>

      <div className="mb-8 flex justify-center">
        <LanguageTabs code={language.code} active="jalur" />
      </div>

      {units.length === 0 ? (
        <EmptyState
          illustration={<IlloBook />}
          title="Materi sedang disiapkan"
          description={`Unit untuk ${language.name} belum tersedia. Sementara itu, intip kamusnya dulu.`}
          action={
            <Button asChild>
              <Link href={`/kamus/${language.code}`}>Buka kamus</Link>
            </Button>
          }
        />
      ) : (
        <UnitPath units={path} code={language.code} />
      )}
    </div>
  );
}
