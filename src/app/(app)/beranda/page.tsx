import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Award, BookOpenCheck, GraduationCap, Plus, Repeat, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { RemoteImage } from "@/components/ui/remote-image";
import { IlloBook, IlloTrophy } from "@/components/illustrations";
import { DailyGoal } from "@/components/gamification/daily-goal";
import { StreakCard } from "@/components/gamification/streak-card";
import { LeaderboardList } from "@/components/gamification/leaderboard-list";
import { LanguageIcon } from "@/components/learning/language-icon";
import { ArticleCard } from "@/components/culture/article-card";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  countDueReviews,
  getLanguageProgressSummary,
  getLatestAchievements,
  getProfile,
  getUserLanguages,
  getXpByDay,
} from "@/lib/queries/progress";
import { getMyWeeklyRank, getWeeklyLeaderboard } from "@/lib/queries/leaderboard";
import { getReadArticleIds, getRecommendedArticles } from "@/lib/queries/culture";
import { ACTIVE_LANGUAGE_COOKIE, resolveActiveLanguage } from "@/lib/active-language";
import { formatDate, formatNumber, todayJakarta } from "@/lib/utils";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  const [profile, userLanguages, week, dueCount, leaderboard, myRank, readIds, badges] = await Promise.all([
    getProfile(supabase, userId),
    getUserLanguages(supabase, userId),
    getXpByDay(supabase, userId, 7),
    countDueReviews(supabase, userId),
    getWeeklyLeaderboard(supabase, { limit: 5 }),
    getMyWeeklyRank(supabase, userId),
    getReadArticleIds(supabase, userId),
    getLatestAchievements(supabase, userId, 4),
  ]);

  const active = resolveActiveLanguage(userLanguages, cookies().get(ACTIVE_LANGUAGE_COOKIE)?.value);
  const [summary, recommended] = await Promise.all([
    getLanguageProgressSummary(
      supabase,
      userId,
      userLanguages.map((ul) => ul.language_id),
    ),
    getRecommendedArticles(supabase, { languageId: active?.language_id, regionId: profile?.home_region_id, limit: 2 }),
  ]);

  const name = profile?.full_name ?? profile?.username ?? "Pelajar";
  const activeToday = profile?.last_active_date === todayJakarta();
  const todayXp = week[week.length - 1]?.xp ?? 0;
  const activeSummary = active ? summary.get(active.language_id) : undefined;
  const articles = recommended.filter((a) => !readIds.has(a.id)).slice(0, 2);
  const inTop = leaderboard.some((r) => r.user_id === userId);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-4xl">Halo, {name}!</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <StreakCard
            current={profile?.current_streak ?? 0}
            longest={profile?.longest_streak ?? 0}
            week={week}
            activeToday={activeToday}
          />

          {/* Lanjutkan belajar (bahasa aktif) */}
          <section aria-labelledby="lanjut-heading" className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-primary/8 p-5">
            <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.07} />
            <div className="relative">
              <h2 id="lanjut-heading" className="mb-3 text-xl">
                Lanjutkan belajar
              </h2>
              {!active ? (
                <EmptyState
                  className="bg-card"
                  illustration={<IlloBook />}
                  title="Belum ada bahasa yang dipelajari"
                  description="Pilih satu bahasa daerah untuk memulai lesson pertamamu."
                  action={
                    <Button asChild>
                      <Link href="/belajar">
                        <GraduationCap aria-hidden="true" /> Pilih bahasa
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <LanguageIcon name={active.language.name} code={active.language.code} iconUrl={active.language.icon_url} className="size-16" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="text-sm font-bold text-muted-foreground">{active.language.name}</p>
                    <p className="text-lg font-extrabold leading-tight">
                      {activeSummary?.nextLesson
                        ? activeSummary.nextLesson.title
                        : activeSummary?.total
                          ? "Semua lesson selesai!"
                          : "Materi sedang disiapkan"}
                    </p>
                    {activeSummary?.total ? (
                      <Progress
                        value={activeSummary.completed}
                        max={activeSummary.total}
                        className="h-3"
                        aria-label={`${activeSummary.completed} dari ${activeSummary.total} lesson selesai`}
                      />
                    ) : null}
                  </div>
                  {activeSummary?.nextLesson ? (
                    <Button asChild size="lg">
                      <Link href={`/belajar/${active.language.code}/lesson/${activeSummary.nextLesson.id}`}>
                        Mulai <ArrowRight aria-hidden="true" />
                      </Link>
                    </Button>
                  ) : activeSummary?.total ? (
                    <span className="inline-flex items-center gap-1.5 font-bold text-success-700 dark:text-success">
                      <BookOpenCheck aria-hidden="true" className="size-5" /> Tuntas
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <DailyGoal todayXp={todayXp} />
            {/* Ulasan */}
            <section aria-labelledby="ulasan-heading" className="flex flex-col justify-between gap-3 rounded-3xl border-2 bg-card p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-belajar/12">
                  <Repeat aria-hidden="true" className="size-6 text-belajar" />
                </span>
                <div>
                  <h2 id="ulasan-heading" className="font-extrabold">
                    Ulasan kosakata
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {dueCount > 0 ? `${formatNumber(dueCount)} kata siap diulas` : "Belum ada yang jatuh tempo"}
                  </p>
                </div>
              </div>
              <Button asChild variant={dueCount > 0 ? "default" : "outline"} size="sm">
                <Link href="/ulasan">{dueCount > 0 ? "Mulai ulasan" : "Buka ulasan"}</Link>
              </Button>
            </section>
          </div>

          {/* Bahasa yang diikuti */}
          <section aria-labelledby="bahasa-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 id="bahasa-heading" className="text-xl">
                Bahasa yang kamu ikuti
              </h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/belajar">
                  <Plus aria-hidden="true" /> Tambah bahasa
                </Link>
              </Button>
            </div>
            {userLanguages.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed p-5 text-center text-sm text-muted-foreground">Belum ada bahasa.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {userLanguages.map((ul) => {
                  const s = summary.get(ul.language_id);
                  return (
                    <li key={ul.language_id}>
                      <Link
                        href={`/belajar/${ul.language.code}`}
                        className="flex items-center gap-3 rounded-2xl border-2 bg-card p-3 transition-colors hover:bg-muted"
                      >
                        <LanguageIcon name={ul.language.name} code={ul.language.code} iconUrl={ul.language.icon_url} className="size-11 rounded-xl text-base" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-extrabold">{ul.language.name}</p>
                          <p className="text-xs text-muted-foreground">{s ? `${s.completed}/${s.total} lesson` : "—"}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-extrabold">
                          <Zap aria-hidden="true" className="size-4 fill-secondary text-secondary" />
                          {formatNumber(ul.xp)}
                          <span className="sr-only">XP</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Rekomendasi budaya */}
          {articles.length ? (
            <section aria-labelledby="budaya-heading" className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 id="budaya-heading" className="text-xl">
                  Rekomendasi budaya
                </h2>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/budaya">Semua</Link>
                </Button>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2">
                {articles.map((a) => (
                  <li key={a.id}>
                    <ArticleCard article={a} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          {/* Mini leaderboard */}
          <section aria-labelledby="lb-heading" className="rounded-3xl border-2 bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="lb-heading" className="text-lg">
                Peringkat mingguan
              </h2>
              <Link href="/peringkat" className="text-sm font-bold text-primary-700 hover:underline dark:text-primary">
                Lihat semua
              </Link>
            </div>
            {leaderboard.length ? (
              <>
                <LeaderboardList rows={leaderboard} currentUserId={userId} compact />
                {!inTop ? (
                  <p className="mt-3 rounded-2xl border-2 border-primary/40 bg-primary/8 px-3 py-2 text-sm font-bold">
                    {myRank ? `Posisimu: #${formatNumber(myRank.rank)} · ${formatNumber(myRank.row.weekly_xp)} XP` : "Kumpulkan XP minggu ini untuk masuk peringkat."}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="py-4 text-center">
                <IlloTrophy className="mx-auto h-20" />
                <p className="mt-2 text-sm text-muted-foreground">Belum ada yang mengumpulkan XP minggu ini. Jadilah yang pertama!</p>
              </div>
            )}
          </section>

          {/* Lencana terbaru */}
          <section aria-labelledby="lencana-heading" className="rounded-3xl border-2 bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center justify-between">
              <h2 id="lencana-heading" className="text-lg">
                Lencana terbaru
              </h2>
              <Link href="/profil#pencapaian" className="text-sm font-bold text-primary-700 hover:underline dark:text-primary">
                Koleksi
              </Link>
            </div>
            {badges.length ? (
              <ul className="space-y-2">
                {badges.map((b) => (
                  <li key={b.achievement_id} className="flex items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border-b-4 border-secondary-700 bg-secondary-600">
                      {b.achievement.icon_url ? (
                        <RemoteImage src={b.achievement.icon_url} alt="" className="size-full" />
                      ) : (
                        <Award aria-hidden="true" className="size-6 text-ink" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{b.achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(b.earned_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Selesaikan lesson dan jaga streak untuk meraih lencana pertamamu.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
