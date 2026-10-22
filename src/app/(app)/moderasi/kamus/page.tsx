import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { ParamSelect } from "@/components/moderation/param-select";
import { VocabRowActions } from "@/components/moderation/vocab-row-actions";
import { getModerationContext } from "@/lib/moderation-context";
import { getModerationVocab, type ModerationVocab, type VocabFilter } from "@/lib/queries/moderation";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Kelola kamus" };

type SP = { bahasa?: string; q?: string; tampil?: string; hal?: string };

const FILTERS: { value: VocabFilter; label: string }[] = [
  { value: "semua", label: "Semua kata" },
  { value: "tersembunyi", label: "Tersembunyi" },
  { value: "kontribusi", label: "Hasil kontribusi" },
];

function buildHref(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  (["bahasa", "q", "tampil"] as const).forEach((k) => merged[k] && params.set(k, merged[k]!));
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/moderasi/kamus${qs ? `?${qs}` : ""}`;
}

function SourceBadge({ v }: { v: ModerationVocab }) {
  if (v.source === "kontribusi") return <Badge variant="komunitas">kontribusi</Badge>;
  if (v.source) return <Badge variant="muted">{v.source}</Badge>;
  return null;
}

export default async function KelolaKamusPage({ searchParams }: { searchParams: SP }) {
  const { supabase, isModerator, scope } = await getModerationContext();
  if (!isModerator) return null;
  if (!scope.length) return <NoScopeState />;

  const language = scope.find((l) => l.code === searchParams.bahasa) ?? scope[0];
  const filter = FILTERS.find((f) => f.value === searchParams.tampil)?.value ?? "semua";
  const page = Math.max(1, Number(searchParams.hal) || 1);
  const { items, total, pageSize } = await getModerationVocab(supabase, {
    languageId: language.id,
    q: searchParams.q,
    filter,
    page,
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = !!(searchParams.q || filter !== "semua");

  return (
    <section aria-labelledby="kamus-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="kamus-heading" className="text-xl">
            Kelola kamus {language.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Edit kata yang keliru atau sembunyikan entri yang tidak layak. Kata yang dipakai soal hanya bisa diedit.
          </p>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/kamus/${language.code}`}>Lihat kamus publik</Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {scope.length > 1 ? (
          <ParamSelect
            param="bahasa"
            label="Bahasa"
            value={language.code}
            options={scope.map((l) => ({ value: l.code, label: l.name }))}
          />
        ) : null}
        <ParamSelect
          param="tampil"
          label="Tampilkan"
          value={filter === "semua" ? "" : filter}
          className="h-11 sm:w-48"
          options={FILTERS.map((f) => ({ value: f.value === "semua" ? "" : f.value, label: f.label }))}
        />
        <form role="search" action="/moderasi/kamus" method="get" className="relative min-w-[14rem] flex-1">
          <input type="hidden" name="bahasa" value={language.code} />
          {filter !== "semua" ? <input type="hidden" name="tampil" value={filter} /> : null}
          <label htmlFor="cari-kamus" className="sr-only">
            Cari kata atau arti
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input id="cari-kamus" name="q" type="search" defaultValue={searchParams.q ?? ""} placeholder="Cari kata atau arti…" className="h-11 pl-11" />
        </form>
      </div>

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} kata{filtered ? " sesuai filter" : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          title={filtered ? "Kata tidak ditemukan" : "Kamus masih kosong"}
          description={filtered ? "Coba kata kunci atau filter lain." : "Belum ada kosakata untuk bahasa ini."}
          action={
            filtered ? (
              <Button asChild variant="outline">
                <Link href={buildHref({ bahasa: language.code }, {})}>Hapus filter</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border-2 bg-card md:block">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Daftar kosakata {language.name}</caption>
              <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">Kata</th>
                  <th scope="col" className="px-4 py-3">Arti</th>
                  <th scope="col" className="px-4 py-3">Tutur</th>
                  <th scope="col" className="px-4 py-3">Soal</th>
                  <th scope="col" className="px-4 py-3"><span className="sr-only">Aksi</span></th>
                </tr>
              </thead>
              <tbody className="divide-y-2">
                {items.map((v) => (
                  <tr key={v.id} className={v.is_hidden ? "bg-muted/40" : undefined}>
                    <td className="px-4 py-3 align-top">
                      <p className="font-extrabold">{v.word}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <SourceBadge v={v} />
                        {v.is_hidden ? <Badge variant="danger">Tersembunyi</Badge> : null}
                      </div>
                      {v.is_hidden && v.hidden_reason ? (
                        <p className="mt-1 text-xs italic text-muted-foreground">“{v.hidden_reason}”</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">{v.meaning_id}</td>
                    <td className="px-4 py-3 align-top text-muted-foreground">{v.speech_level ?? "—"}</td>
                    <td className="px-4 py-3 align-top text-muted-foreground">{v.uses || "—"}</td>
                    <td className="px-4 py-3 align-top">
                      <VocabRowActions vocab={v} hidden={v.is_hidden} uses={v.uses} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="space-y-2 md:hidden">
            {items.map((v) => (
              <li key={v.id} className="space-y-2 rounded-2xl border-2 bg-card p-3">
                <div>
                  <p className="font-extrabold">{v.word}</p>
                  <p className="text-sm text-muted-foreground">{v.meaning_id}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <SourceBadge v={v} />
                    {v.speech_level ? <Badge variant="budaya">{v.speech_level}</Badge> : null}
                    {v.uses ? <Badge variant="outline">{v.uses} soal</Badge> : null}
                    {v.is_hidden ? <Badge variant="danger">Tersembunyi</Badge> : null}
                  </div>
                  {v.is_hidden && v.hidden_reason ? <p className="mt-1 text-xs italic text-muted-foreground">“{v.hidden_reason}”</p> : null}
                </div>
                <VocabRowActions vocab={v} hidden={v.is_hidden} uses={v.uses} />
              </li>
            ))}
          </ul>
        </>
      )}

      {totalPages > 1 ? (
        <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={buildHref({ ...searchParams, bahasa: language.code }, { hal: String(page - 1) })} rel="prev">
                <ArrowLeft aria-hidden="true" /> Sebelumnya
              </Link>
            </Button>
          ) : null}
          <span className="text-sm font-bold text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={buildHref({ ...searchParams, bahasa: language.code }, { hal: String(page + 1) })} rel="next">
                Berikutnya <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
