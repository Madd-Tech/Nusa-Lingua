import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloCheck } from "@/components/illustrations";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { ParamSelect } from "@/components/moderation/param-select";
import { ReportGroupCard } from "@/components/moderation/report-group-card";
import type { EditableVocab } from "@/components/moderation/vocab-edit-dialog";
import { getModerationContext } from "@/lib/moderation-context";
import { countReportTargets, getReportQueue } from "@/lib/queries/moderation";
import { REPORT_STATUSES } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Laporan pengguna" };

type SP = { status?: string; jenis?: string; bahasa?: string; hal?: string };

const TARGETS: { value: string; label: string; type: Enums<"report_target"> }[] = [
  { value: "kosakata", label: "Kosakata", type: "vocabulary" },
  { value: "artikel", label: "Artikel", type: "article" },
];

function buildHref(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  if (merged.status && merged.status !== "open") params.set("status", merged.status);
  (["jenis", "bahasa"] as const).forEach((k) => merged[k] && params.set(k, merged[k]!));
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/moderasi/laporan${qs ? `?${qs}` : ""}`;
}

export default async function LaporanPage({ searchParams }: { searchParams: SP }) {
  const { supabase, isModerator, scope } = await getModerationContext();
  if (!isModerator) return null;
  if (!scope.length) return <NoScopeState />;

  const status = REPORT_STATUSES.some((s) => s.value === searchParams.status)
    ? (searchParams.status as Enums<"report_status">)
    : "open";
  const target = TARGETS.find((t) => t.value === searchParams.jenis) ?? null;
  const language = scope.find((l) => l.code === searchParams.bahasa) ?? null;
  const page = Math.max(1, Number(searchParams.hal) || 1);
  const filter = { languageId: language?.id, targetType: target?.type };

  const [{ items, total, pageSize }, counts] = await Promise.all([
    getReportQueue(supabase, { status, ...filter, page }),
    countReportTargets(supabase, filter),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Data lengkap kata untuk dialog edit (RLS moderator: termasuk kata tersembunyi).
  const vocabIds = items.filter((g) => g.target_type === "vocabulary").map((g) => g.target_id);
  const vocabById = new Map<number, EditableVocab>();
  if (vocabIds.length) {
    const res = await supabase
      .from("vocabularies")
      .select("id, word, meaning_id, meaning_en, speech_level, pronunciation, example_sentence, example_meaning, category")
      .in("id", vocabIds);
    res.data?.forEach((v) => vocabById.set(v.id, v));
  }

  return (
    <section aria-labelledby="laporan-heading">
      <h2 id="laporan-heading" className="sr-only">
        Laporan pengguna
      </h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter status laporan" className="overflow-x-auto">
          <ul className="inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
            {REPORT_STATUSES.map((s) => (
              <li key={s.value}>
                <Link
                  href={buildHref(searchParams, { status: s.value, hal: undefined })}
                  aria-current={s.value === status ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground",
                    s.value === status && "bg-card text-foreground shadow-soft",
                  )}
                >
                  {s.label}
                  <span className="rounded-full bg-background/70 px-1.5 text-xs">{formatNumber(counts[s.value])}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-wrap gap-2">
          <ParamSelect
            param="jenis"
            label="Jenis konten"
            value={target?.value ?? ""}
            className="h-11 sm:w-44"
            options={[{ value: "", label: "Semua jenis" }, ...TARGETS.map((t) => ({ value: t.value, label: t.label }))]}
          />
          {scope.length > 1 ? (
            <ParamSelect
              param="bahasa"
              label="Bahasa"
              value={language?.code ?? ""}
              options={[{ value: "", label: "Semua bahasa" }, ...scope.map((l) => ({ value: l.code, label: l.name }))]}
            />
          ) : null}
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} {status === "open" ? "konten dilaporkan" : "konten"}
        {status === "open" && total ? " · paling banyak dilaporkan di atas" : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          illustration={<IlloCheck />}
          title={status === "open" ? "Tidak ada laporan terbuka" : "Belum ada data"}
          description={
            status === "open"
              ? "Laporan pelajar tentang kesalahan kata atau artikel akan muncul di sini."
              : "Belum ada laporan dengan status ini."
          }
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {items.map((g) => (
            <ReportGroupCard
              key={`${g.target_type}-${g.target_id}`}
              group={g}
              status={status}
              vocab={g.target_type === "vocabulary" ? vocabById.get(g.target_id) : undefined}
            />
          ))}
        </ul>
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
