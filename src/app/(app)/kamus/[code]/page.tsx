import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { EmptyState } from "@/components/ui/empty-state";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { LanguageIcon } from "@/components/learning/language-icon";
import { LanguageTabs } from "@/components/learning/language-tabs";
import { VocabList } from "@/components/learning/vocab-list";
import { getCurrentUser } from "@/lib/supabase/server";
import { getModerationContext } from "@/lib/moderation-context";
import { getLanguageByCode, getVocabFacets, getVocabularies } from "@/lib/queries/content";
import { getMasteryFor } from "@/lib/queries/progress";
import { formatNumber } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { code: string } }): Promise<Metadata> {
  const { supabase } = await getCurrentUser();
  const lang = await getLanguageByCode(supabase, params.code).catch(() => null);
  return { title: lang ? `Kamus ${lang.name}` : "Kamus" };
}

type SP = { q?: string; kategori?: string; tutur?: string; hal?: string };

function buildHref(code: string, sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  (["q", "kategori", "tutur"] as const).forEach((k) => merged[k] && params.set(k, merged[k]!));
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/kamus/${code}${qs ? `?${qs}` : ""}`;
}

export default async function KamusPage({ params, searchParams }: { params: { code: string }; searchParams: SP }) {
  const { supabase, user } = await getCurrentUser();
  const language = await getLanguageByCode(supabase, params.code);
  if (!language) notFound();

  const page = Math.max(1, Number(searchParams.hal) || 1);
  const [{ items, total, pageSize }, facets, moderation] = await Promise.all([
    getVocabularies(supabase, language.id, {
      q: searchParams.q,
      category: searchParams.kategori,
      speechLevel: searchParams.tutur,
      page,
    }),
    getVocabFacets(supabase, language.id),
    getModerationContext(),
  ]);
  // Tombol Edit untuk moderator bahasa ini (RLS tetap penegak utama).
  const canModerate = moderation.isModerator && moderation.scope.some((l) => l.id === language.id);
  const mastery = await getMasteryFor(
    supabase,
    user!.id,
    items.map((i) => i.id),
  );
  const strength = Object.fromEntries(mastery.map((m) => [m.vocabulary_id, m.strength]));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const filtered = !!(searchParams.q || searchParams.kategori || searchParams.tutur);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/belajar/${language.code}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> {language.name}
      </Link>

      <section className="relative mb-6 overflow-hidden rounded-3xl border-2 bg-card p-5">
        <BatikPattern variant="parang" color="rgb(var(--c-belajar))" opacity={0.05} />
        <div className="relative flex flex-wrap items-center gap-4">
          <LanguageIcon name={language.name} code={language.code} iconUrl={language.icon_url} className="size-14" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl">Kamus {language.name}</h1>
            <p className="text-sm text-muted-foreground">
              {formatNumber(total)} kata{filtered ? " sesuai filter" : ""}
            </p>
          </div>
          <LanguageTabs code={language.code} active="kamus" />
        </div>

        <form role="search" action={`/kamus/${language.code}`} method="get" className="relative mt-5 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <label htmlFor="cari-kata" className="sr-only">
              Cari kata atau arti
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input id="cari-kata" name="q" type="search" defaultValue={searchParams.q ?? ""} placeholder="Cari kata atau arti…" className="pl-11" />
          </div>
          <div>
            <label htmlFor="filter-kategori" className="sr-only">
              Kategori
            </label>
            <SelectFilter
              id="filter-kategori"
              name="kategori"
              defaultValue={searchParams.kategori ?? ""}
              placeholder="Semua kategori"
              className="sm:w-44"
              options={[
                { value: "", label: "Semua kategori" },
                ...facets.categories.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>
          <div>
            <label htmlFor="filter-tutur" className="sr-only">
              Tingkat tutur
            </label>
            <SelectFilter
              id="filter-tutur"
              name="tutur"
              defaultValue={searchParams.tutur ?? ""}
              placeholder="Semua tingkat tutur"
              className="sm:w-44"
              options={[
                { value: "", label: "Semua tingkat tutur" },
                ...facets.speechLevels.map((s) => ({ value: s, label: s })),
              ]}
            />
          </div>
          <Button type="submit">Cari</Button>
        </form>
      </section>

      {items.length === 0 ? (
        <EmptyState
          title={filtered ? "Kata tidak ditemukan" : "Kamus masih kosong"}
          description={
            filtered
              ? "Coba kata kunci atau filter lain, atau bantu kami menambahkannya lewat Kontribusi."
              : "Bantu lengkapi kamus ini dengan mengusulkan kosakata."
          }
          action={
            <>
              {filtered ? (
                <Button asChild variant="outline">
                  <Link href={`/kamus/${language.code}`}>Hapus filter</Link>
                </Button>
              ) : null}
              <Button asChild variant="komunitas">
                <Link href="/kontribusi">Usulkan kosakata</Link>
              </Button>
            </>
          }
        />
      ) : (
        <>
          <VocabList items={items} strength={strength} canModerate={canModerate} />
          {totalPages > 1 ? (
            <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={buildHref(language.code, searchParams, { hal: String(page - 1) })} rel="prev">
                    <ArrowLeft aria-hidden="true" /> Sebelumnya
                  </Link>
                </Button>
              ) : null}
              <span className="text-sm font-bold text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              {page < totalPages ? (
                <Button asChild variant="outline">
                  <Link href={buildHref(language.code, searchParams, { hal: String(page + 1) })} rel="next">
                    Berikutnya <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </nav>
          ) : null}
        </>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Sebagian kosakata berasal dari NusaX (CC BY-SA 4.0) dan belum diverifikasi penutur asli.{" "}
        <Link href="/ketentuan#sumber-data" className="font-bold underline underline-offset-2 hover:text-foreground">
          Sumber data
        </Link>
      </p>
    </div>
  );
}
