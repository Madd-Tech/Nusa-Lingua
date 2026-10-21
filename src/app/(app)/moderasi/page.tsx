import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCheck, Hourglass, Inbox, ShieldAlert, Timer } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloCheck } from "@/components/illustrations";
import { StatCard } from "@/components/gamification/stat-card";
import { ActivityList } from "@/components/moderation/activity-list";
import { LanguageQueueTable } from "@/components/moderation/language-queue-table";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { getModerationContext } from "@/lib/moderation-context";
import { getModerationLog, getModerationOverview, getMyModerationStats } from "@/lib/queries/moderation";
import { formatHours, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard moderasi" };

const tileLink = "rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&>div]:h-full [&>div]:transition-colors [&>div]:hover:bg-muted/40";

export default async function ModerasiDashboardPage() {
  const { supabase, isModerator, isAdmin, scope } = await getModerationContext();
  if (!isModerator) return null;
  if (!scope.length) return <NoScopeState />;

  const [overview, mine, recent] = await Promise.all([
    getModerationOverview(supabase),
    getMyModerationStats(supabase, 7),
    getModerationLog(supabase, { pageSize: 8 }),
  ]);

  const pending = overview.reduce((sum, r) => sum + r.pending_count, 0);
  const languagesWithQueue = overview.filter((r) => r.pending_count > 0).length;
  const oldest = overview.reduce<string | null>(
    (min, r) => (r.oldest_pending_at && (!min || r.oldest_pending_at < min) ? r.oldest_pending_at : min),
    null,
  );
  const oldestHours = oldest ? (Date.now() - new Date(oldest).getTime()) / 3_600_000 : null;
  const unmoderated = overview.filter((r) => r.moderator_count === 0);
  const languageNames = new Map(scope.map((l) => [l.id, l.name]));

  return (
    <div className="space-y-8">
      <section aria-labelledby="ringkasan" className="space-y-3">
        <h2 id="ringkasan" className="sr-only">
          Ringkasan
        </h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Link href="/moderasi/antrean" className={tileLink}>
            <StatCard
              icon={Inbox}
              label="Usulan menunggu"
              value={formatNumber(pending)}
              hint={pending ? `di ${languagesWithQueue} bahasa` : "Antrean bersih"}
              tileClassName="bg-komunitas/10"
              iconClassName="text-komunitas"
            />
          </Link>
          <StatCard
            icon={Hourglass}
            label="Menunggu paling lama"
            value={oldestHours === null ? "—" : formatHours(oldestHours)}
            hint={oldestHours === null ? "Tidak ada antrean" : "sejak dikirim"}
            tileClassName="bg-secondary/20"
            iconClassName="text-secondary-700 dark:text-secondary"
          />
          <StatCard
            icon={CheckCheck}
            label="Kamu tinjau (7 hari)"
            value={formatNumber(mine.reviewed)}
            hint={mine.reviewed ? `${Math.round((mine.approved / mine.reviewed) * 100)}% disetujui` : "Belum ada tinjauan"}
            tileClassName="bg-success/12"
            iconClassName="text-success-700 dark:text-success"
          />
          {isAdmin ? (
            <Link href="/moderasi/tim" className={tileLink}>
              <StatCard
                icon={ShieldAlert}
                label="Bahasa tanpa moderator"
                value={formatNumber(unmoderated.length)}
                hint={unmoderated.length ? "Hanya admin yang meninjau" : "Semua bahasa terjaga"}
                tileClassName="bg-danger/10"
                iconClassName="text-danger-700 dark:text-danger"
              />
            </Link>
          ) : (
            <StatCard
              icon={Timer}
              label="Rata-rata waktu tunggu"
              value={mine.avg_wait_hours === null ? "—" : formatHours(mine.avg_wait_hours)}
              hint="dari dikirim sampai kamu tinjau"
              tileClassName="bg-asisten/12"
              iconClassName="text-asisten"
            />
          )}
        </div>
      </section>

      <section aria-labelledby="per-bahasa" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="per-bahasa" className="text-xl">
            Antrean per bahasa
          </h2>
          <Link href="/moderasi/antrean" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            Buka antrean <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <LanguageQueueTable rows={overview} showModerators={isAdmin} />
      </section>

      <section aria-labelledby="aktivitas" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="aktivitas" className="text-xl">
            Aktivitas terbaru
          </h2>
          {recent.total > recent.items.length ? (
            <Link href="/moderasi/riwayat" className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:underline">
              Lihat semua riwayat <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
        {recent.items.length ? (
          <ActivityList
            entries={recent.items}
            actorHref={(id) => `/moderasi/riwayat?aktor=${id}`}
            languageNames={languageNames}
          />
        ) : (
          <EmptyState
            illustration={<IlloCheck />}
            title="Belum ada aktivitas"
            description="Keputusan moderasi di bahasa yang kamu pegang akan tercatat di sini."
          />
        )}
      </section>
    </div>
  );
}
