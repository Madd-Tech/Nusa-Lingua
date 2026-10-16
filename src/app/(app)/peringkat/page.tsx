import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloTrophy } from "@/components/illustrations";
import { PageHeader } from "@/components/layout/page-header";
import { LeaderboardList, RankBadge } from "@/components/gamification/leaderboard-list";
import { Podium } from "@/components/gamification/podium";
import { getCurrentUser } from "@/lib/supabase/server";
import { getMyWeeklyRank, getWeeklyLeaderboard } from "@/lib/queries/leaderboard";
import { getRegions } from "@/lib/queries/content";
import { getProfile } from "@/lib/queries/progress";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Peringkat" };

export default async function PeringkatPage({ searchParams }: { searchParams: { lingkup?: string } }) {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;
  const [profile, regions] = await Promise.all([getProfile(supabase, userId), getRegions(supabase)]);

  const wantsRegional = searchParams.lingkup === "daerah";
  const regionId = wantsRegional && profile?.home_region_id ? profile.home_region_id : undefined;
  const [rows, mine] = await Promise.all([
    getWeeklyLeaderboard(supabase, { regionId, limit: 50 }),
    getMyWeeklyRank(supabase, userId, { regionId }),
  ]);
  const regionNames = new Map(regions.map((r) => [r.id, r.name]));
  const myRegion = profile?.home_region_id ? regionNames.get(profile.home_region_id) : null;
  const showPodium = rows.length >= 3;

  const tabs = [
    { key: "nasional", label: "Nasional", href: "/peringkat", active: !wantsRegional },
    { key: "daerah", label: myRegion ? `Daerah saya · ${myRegion}` : "Daerah saya", href: "/peringkat?lingkup=daerah", active: wantsRegional },
  ];

  return (
    <>
      <PageHeader
        icon={Trophy}
        category="progres"
        title="Peringkat mingguan"
        description="Kumpulkan XP sepanjang minggu untuk naik peringkat."
      >
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Lingkup peringkat" className="inline-flex flex-wrap gap-1 rounded-2xl border-2 bg-muted p-1">
            {tabs.map((t) => (
              <Link
                key={t.key}
                href={t.href}
                aria-current={t.active ? "page" : undefined}
                className={cn("rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground", t.active && "bg-card text-foreground shadow-soft")}
              >
                {t.label}
              </Link>
            ))}
          </nav>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-4" /> Reset setiap Senin
          </p>
        </div>
      </PageHeader>

      {wantsRegional && !profile?.home_region_id ? (
        <EmptyState
          title="Daerah asal belum dipilih"
          description="Atur daerah asalmu di Pengaturan untuk melihat peringkat daerah."
          action={
            <Button asChild>
              <Link href="/profil/pengaturan">Buka pengaturan</Link>
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          illustration={<IlloTrophy />}
          title="Papan peringkat masih kosong"
          description="Belum ada yang mengumpulkan XP minggu ini. Selesaikan satu lesson dan jadilah yang pertama!"
          action={
            <Button asChild>
              <Link href="/belajar">Mulai lesson</Link>
            </Button>
          }
        />
      ) : (
        <div className="mx-auto max-w-2xl pb-4">
          {showPodium ? <Podium rows={rows} currentUserId={userId} /> : null}
          <LeaderboardList
            rows={showPodium ? rows.slice(3) : rows}
            startRank={showPodium ? 4 : 1}
            currentUserId={userId}
            regionNames={regionNames}
          />
        </div>
      )}

      {/* Baris milik user — selalu terlihat (sticky di bawah). */}
      {rows.length > 0 ? (
        <div className="sticky bottom-24 z-20 mx-auto mt-4 max-w-2xl md:bottom-4">
          <div className="flex items-center gap-3 rounded-2xl border-2 border-primary bg-card px-3 py-2.5 shadow-lift">
            {mine ? (
              <>
                <RankBadge rank={mine.rank} />
                <UserAvatar name={profile?.full_name ?? profile?.username} src={profile?.avatar_url} />
                <p className="min-w-0 flex-1 truncate font-bold">
                  {profile?.username ?? "Kamu"} <span className="text-xs font-extrabold text-primary-700 dark:text-primary">(Kamu)</span>
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-extrabold">
                  <Zap aria-hidden="true" className="size-4 fill-secondary text-secondary" /> {formatNumber(mine.row.weekly_xp)}
                  <span className="sr-only">XP minggu ini</span>
                </span>
              </>
            ) : (
              <p className="font-bold">Kamu belum punya XP minggu ini. Selesaikan lesson untuk masuk papan peringkat!</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
