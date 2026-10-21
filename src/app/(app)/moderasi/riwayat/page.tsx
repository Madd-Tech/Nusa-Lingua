import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityList } from "@/components/moderation/activity-list";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { ParamSelect } from "@/components/moderation/param-select";
import { getModerationContext } from "@/lib/moderation-context";
import { getModerationLog } from "@/lib/queries/moderation";
import { LOG_ACTION_FILTERS } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Riwayat moderasi" };

type SP = { aksi?: string; bahasa?: string; aktor?: string; hal?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function buildHref(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  (["aksi", "bahasa", "aktor"] as const).forEach((k) => merged[k] && params.set(k, merged[k]!));
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/moderasi/riwayat${qs ? `?${qs}` : ""}`;
}

export default async function RiwayatPage({ searchParams }: { searchParams: SP }) {
  const { supabase, userId, isModerator, isAdmin, scope } = await getModerationContext();
  if (!isModerator) return null;
  if (!scope.length) return <NoScopeState />;

  const filters = LOG_ACTION_FILTERS.filter((f) => !f.adminOnly || isAdmin);
  const actionFilter = filters.find((f) => f.value === searchParams.aksi) ?? null;
  const language = scope.find((l) => l.code === searchParams.bahasa) ?? null;
  const actorId = searchParams.aktor && UUID.test(searchParams.aktor) ? searchParams.aktor : null;
  const isMine = !!actorId && actorId === userId;
  const page = Math.max(1, Number(searchParams.hal) || 1);

  const [{ items, total, pageSize }, actor] = await Promise.all([
    getModerationLog(supabase, { actions: actionFilter?.actions, languageId: language?.id, actorId, page }),
    actorId && !isMine
      ? supabase.from("profiles").select("username").eq("id", actorId).maybeSingle().then((r) => r.data)
      : Promise.resolve(null),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = !!(actionFilter || language || actorId);
  const languageNames = new Map(scope.map((l) => [l.id, l.name]));

  return (
    <section aria-labelledby="riwayat-heading">
      <h2 id="riwayat-heading" className="sr-only">
        Riwayat aktivitas moderasi
      </h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ParamSelect
          param="aksi"
          label="Jenis aktivitas"
          value={actionFilter?.value ?? ""}
          options={[{ value: "", label: "Semua aktivitas" }, ...filters.map((f) => ({ value: f.value, label: f.label }))]}
        />
        {scope.length > 1 ? (
          <ParamSelect
            param="bahasa"
            label="Bahasa"
            value={language?.code ?? ""}
            options={[{ value: "", label: "Semua bahasa" }, ...scope.map((l) => ({ value: l.code, label: l.name }))]}
          />
        ) : null}
        {userId ? (
          <Link
            href={buildHref(searchParams, { aktor: isMine ? undefined : userId, hal: undefined })}
            aria-pressed={isMine}
            className={cn(
              "inline-flex h-11 items-center gap-1.5 rounded-2xl border-2 px-4 text-sm font-bold transition-colors",
              isMine ? "border-komunitas bg-komunitas/10 text-komunitas-deep dark:text-komunitas" : "bg-card hover:bg-muted",
            )}
          >
            <UserRound aria-hidden="true" className="size-4" /> Aktivitas saya
          </Link>
        ) : null}
        {actorId && !isMine ? (
          <Link
            href={buildHref(searchParams, { aktor: undefined, hal: undefined })}
            className="inline-flex h-11 items-center gap-1.5 rounded-2xl border-2 border-komunitas bg-komunitas/10 px-4 text-sm font-bold text-komunitas-deep dark:text-komunitas"
            aria-label={`Hapus filter moderator @${actor?.username ?? "pengguna"}`}
          >
            @{actor?.username ?? "pengguna"} <X aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} aktivitas{filtered ? " sesuai filter" : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          title={filtered ? "Tidak ada aktivitas yang cocok" : "Belum ada aktivitas"}
          description={
            filtered ? "Coba ubah atau hapus filter." : "Keputusan moderasi di bahasa yang kamu pegang akan tercatat di sini."
          }
          action={
            filtered ? (
              <Button asChild variant="outline">
                <Link href="/moderasi/riwayat">Hapus filter</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <ActivityList
          entries={items}
          actorHref={(id) => buildHref(searchParams, { aktor: id, hal: undefined })}
          languageNames={languageNames}
        />
      )}

      {totalPages > 1 ? (
        <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={buildHref(searchParams, { hal: String(page - 1) })} rel="prev">
                <ArrowLeft aria-hidden="true" /> Sebelumnya
              </Link>
            </Button>
          ) : null}
          <span className="text-sm font-bold text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={buildHref(searchParams, { hal: String(page + 1) })} rel="next">
                Berikutnya <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
