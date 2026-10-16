import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  Flame,
  HandHeart,
  Landmark,
  MapPin,
  Repeat,
  Settings,
  ShieldCheck,
  Trophy,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserAvatar } from "@/components/ui/avatar";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/gamification/stat-card";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { XpChartLazy } from "@/components/gamification/xp-chart-lazy";
import { LanguageIcon } from "@/components/learning/language-icon";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAchievements, getRegions } from "@/lib/queries/content";
import {
  getLanguageProgressSummary,
  getProfile,
  getProfileCounts,
  getUserAchievements,
  getUserLanguages,
  getXpByDay,
} from "@/lib/queries/progress";
import { ROLE_LABEL } from "@/lib/constants";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilPage() {
  const { supabase, user } = await getCurrentUser();
  const userId = user!.id;

  const [profile, languages, achievements, earned, xpDays, counts, regions] = await Promise.all([
    getProfile(supabase, userId),
    getUserLanguages(supabase, userId),
    getAchievements(supabase),
    getUserAchievements(supabase, userId),
    getXpByDay(supabase, userId, 30),
    getProfileCounts(supabase, userId),
    getRegions(supabase),
  ]);
  const summary = await getLanguageProgressSummary(
    supabase,
    userId,
    languages.map((l) => l.language_id),
  );
  const earnedMap = new Map(earned.map((e) => [e.achievement_id, e.earned_at]));
  const region = regions.find((r) => r.id === profile?.home_region_id);
  const isModerator = profile?.role === "moderator" || profile?.role === "admin";

  const quickLinks = [
    { href: "/ulasan", label: "Ulasan kosakata", icon: Repeat, tone: "text-belajar" },
    { href: "/kontribusi", label: "Kontribusi", icon: HandHeart, tone: "text-komunitas" },
    { href: "/peringkat", label: "Peringkat", icon: Trophy, tone: "text-progres" },
    ...(isModerator ? [{ href: "/kontribusi/moderasi", label: "Moderasi", icon: ShieldCheck, tone: "text-komunitas" }] : []),
    { href: "/profil/pengaturan", label: "Pengaturan", icon: Settings, tone: "text-muted-foreground" },
  ];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border-2 bg-card p-6">
        <BatikPattern variant="kawung" color="rgb(var(--c-progres))" opacity={0.07} />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
          <UserAvatar name={profile?.full_name ?? profile?.username} src={profile?.avatar_url} className="size-24 border-4 text-3xl" />
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="truncate text-3xl">{profile?.full_name ?? profile?.username}</h1>
            <p className="font-semibold text-muted-foreground">@{profile?.username}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="size-4" /> {region?.name ?? "Daerah belum diatur"}
              </span>
              {profile?.created_at ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays aria-hidden="true" className="size-4" /> Bergabung {formatDate(profile.created_at, { day: "numeric", month: "long", year: "numeric" })}
                </span>
              ) : null}
              {profile && profile.role !== "user" ? <Badge variant="komunitas">{ROLE_LABEL[profile.role]}</Badge> : null}
            </div>
          </div>
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href="/profil/pengaturan">
              <Settings aria-hidden="true" /> Pengaturan
            </Link>
          </Button>
        </div>
      </section>

      {/* Menu lain untuk mobile (bottom nav hanya 5 item) */}
      <nav aria-label="Menu lainnya" className="md:hidden">
        <ul className="divide-y-2 overflow-hidden rounded-2xl border-2 bg-card">
          {quickLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-muted">
                <l.icon aria-hidden="true" className={`size-5 ${l.tone}`} />
                <span className="flex-1">{l.label}</span>
                <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section aria-labelledby="statistik" className="space-y-3">
        <h2 id="statistik" className="text-xl">
          Statistik
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <StatCard icon={Zap} label="Total XP" value={formatNumber(profile?.xp_total)} tileClassName="bg-secondary/20" iconClassName="fill-secondary text-secondary" />
          <StatCard icon={Flame} label="Streak saat ini" value={`${formatNumber(profile?.current_streak)} hari`} tileClassName="bg-accent/12" iconClassName="fill-accent text-accent" />
          <StatCard icon={Trophy} label="Streak terpanjang" value={`${formatNumber(profile?.longest_streak)} hari`} tileClassName="bg-progres/15" iconClassName="text-progres" />
          <StatCard icon={BookOpenCheck} label="Lesson selesai" value={formatNumber(counts.lessons)} tileClassName="bg-belajar/12" iconClassName="text-belajar" />
          <StatCard icon={Landmark} label="Artikel dibaca" value={formatNumber(counts.reads)} tileClassName="bg-budaya/12" iconClassName="text-budaya" />
          <StatCard icon={HandHeart} label="Kontribusi disetujui" value={formatNumber(counts.approved)} tileClassName="bg-komunitas/10" iconClassName="text-komunitas" />
        </div>
      </section>

      <section aria-labelledby="grafik-xp" className="space-y-3 rounded-3xl border-2 bg-card p-5">
        <h2 id="grafik-xp" className="text-xl">
          XP 30 hari terakhir
        </h2>
        <XpChartLazy data={xpDays} />
      </section>

      <section aria-labelledby="bahasa-saya" className="space-y-3">
        <h2 id="bahasa-saya" className="text-xl">
          Bahasa yang dipelajari
        </h2>
        {languages.length === 0 ? (
          <EmptyState
            title="Belum ada bahasa"
            action={
              <Button asChild>
                <Link href="/belajar">Pilih bahasa</Link>
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {languages.map((l) => {
              const s = summary.get(l.language_id);
              return (
                <li key={l.language_id}>
                  <Link href={`/belajar/${l.language.code}`} className="block space-y-3 rounded-2xl border-2 bg-card p-4 hover:bg-muted">
                    <div className="flex items-center gap-3">
                      <LanguageIcon name={l.language.name} iconUrl={l.language.icon_url} className="size-11 rounded-xl text-base" />
                      <span className="flex-1 font-extrabold">{l.language.name}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-extrabold">
                        <Zap aria-hidden="true" className="size-4 fill-secondary text-secondary" /> {formatNumber(l.xp)} XP
                      </span>
                    </div>
                    {s && s.unitsTotal > 0 ? (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground">
                          {s.unitsCompleted}/{s.unitsTotal} unit tuntas · {s.completed}/{s.total} lesson
                        </p>
                        <Progress value={s.completed} max={s.total || 1} className="h-2.5" aria-label={`Progres ${l.language.name}`} />
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">Materi sedang disiapkan.</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="pencapaian" aria-labelledby="pencapaian-heading" className="scroll-mt-24 space-y-3">
        <h2 id="pencapaian-heading" className="text-xl">
          Koleksi lencana{" "}
          <span className="text-base font-bold text-muted-foreground">
            ({earned.length}/{achievements.length})
          </span>
        </h2>
        {achievements.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">Daftar lencana sedang disiapkan.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {achievements
              .slice()
              .sort((a, b) => Number(earnedMap.has(b.id)) - Number(earnedMap.has(a.id)))
              .map((a) => (
                <li key={a.id}>
                  <AchievementBadge name={a.name} description={a.description} iconUrl={a.icon_url} earnedAt={earnedMap.get(a.id) ?? null} />
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
