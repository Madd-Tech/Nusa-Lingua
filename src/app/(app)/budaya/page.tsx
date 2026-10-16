import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Landmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { IlloBook } from "@/components/illustrations";
import { ArticleCard } from "@/components/culture/article-card";
import { getCurrentUser } from "@/lib/supabase/server";
import { getArticlesPage, getReadArticleIds } from "@/lib/queries/culture";
import { getActiveLanguages, getRegions } from "@/lib/queries/content";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, parseId } from "@/lib/utils";

export const metadata: Metadata = { title: "Budaya" };

type SP = { kategori?: string; daerah?: string; bahasa?: string; q?: string; hal?: string };

function href(sp: SP, patch: Partial<SP>) {
  const merged: SP = { ...sp, ...patch };
  const p = new URLSearchParams();
  (Object.entries(merged) as [keyof SP, string | undefined][]).forEach(([k, v]) => {
    if (v && !(k === "hal" && v === "1")) p.set(k, v);
  });
  const qs = p.toString();
  return `/budaya${qs ? `?${qs}` : ""}`;
}

export default async function BudayaPage({ searchParams }: { searchParams: SP }) {
  const { supabase, user } = await getCurrentUser();
  const category = ARTICLE_CATEGORIES.some((c) => c.value === searchParams.kategori)
    ? (searchParams.kategori as Enums<"article_category">)
    : undefined;
  const regionId = parseId(searchParams.daerah) ?? undefined;
  const languageId = parseId(searchParams.bahasa) ?? undefined;
  const page = Math.max(1, Number(searchParams.hal) || 1);

  const [{ items, total, pageSize }, readIds, regions, languages] = await Promise.all([
    getArticlesPage(supabase, { category, regionId, languageId, q: searchParams.q, page }),
    getReadArticleIds(supabase, user!.id),
    getRegions(supabase),
    getActiveLanguages(supabase),
  ]);
  const filtered = !!(category || regionId || languageId || searchParams.q);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      {/* Hero kecil ungu */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-budaya-solid p-6 text-white sm:p-8">
        <BatikPattern variant="kawung" size={56} color="#ffffff" opacity={0.12} />
        <div className="relative flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Landmark aria-hidden="true" className="size-7" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl">Budaya Nusantara</h1>
            <p className="mt-1 text-white/90">Sejarah, cerita rakyat, tarian, kuliner, hingga aksara — konteks yang membuat bahasa hidup.</p>
          </div>
        </div>
      </section>

      <nav aria-label="Kategori budaya" className="scrollbar-none -mx-4 mb-4 flex gap-2 overflow-x-auto px-4">
        {[{ value: undefined as string | undefined, label: "Semua" }, ...ARTICLE_CATEGORIES].map((c) => {
          const active = category === c.value;
          return (
            <Link
              key={c.label}
              href={href(searchParams, { kategori: c.value, hal: undefined })}
              aria-current={active ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-colors",
                active ? "border-budaya bg-budaya/12 text-budaya-deep dark:text-budaya" : "bg-card hover:bg-muted",
              )}
            >
              {c.label}
            </Link>
          );
        })}
      </nav>

      <form role="search" action="/budaya" method="get" className="mb-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px_auto]">
        {category ? <input type="hidden" name="kategori" value={category} /> : null}
        <div className="relative sm:col-span-2 lg:col-span-1">
          <label htmlFor="cari-artikel" className="sr-only">
            Cari judul artikel
          </label>
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input id="cari-artikel" name="q" type="search" defaultValue={searchParams.q ?? ""} placeholder="Cari judul…" className="pl-11" />
        </div>
        <div>
          <label htmlFor="filter-daerah" className="sr-only">
            Daerah
          </label>
          <NativeSelect id="filter-daerah" name="daerah" defaultValue={regionId ? String(regionId) : ""}>
            <option value="">Semua daerah</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div>
          <label htmlFor="filter-bahasa" className="sr-only">
            Bahasa
          </label>
          <NativeSelect id="filter-bahasa" name="bahasa" defaultValue={languageId ? String(languageId) : ""}>
            <option value="">Semua bahasa</option>
            {languages.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" variant="budaya" className="sm:col-span-2 lg:col-span-1">
          Terapkan
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          illustration={<IlloBook />}
          title={filtered ? "Artikel tidak ditemukan" : "Belum ada artikel"}
          description={filtered ? "Coba ganti kategori, daerah, bahasa, atau kata kunci." : "Artikel budaya sedang ditulis oleh tim kami."}
          action={
            filtered ? (
              <Button asChild variant="outline">
                <Link href="/budaya">Hapus filter</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">{total} artikel</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((a) => (
              <li key={a.id}>
                <ArticleCard article={a} read={readIds.has(a.id)} />
              </li>
            ))}
          </ul>
          {totalPages > 1 ? (
            <nav aria-label="Halaman" className="mt-8 flex items-center justify-center gap-3">
              {page > 1 ? (
                <Button asChild variant="outline">
                  <Link href={href(searchParams, { hal: String(page - 1) })} rel="prev">
                    <ArrowLeft aria-hidden="true" /> Sebelumnya
                  </Link>
                </Button>
              ) : null}
              <span className="text-sm font-bold text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              {page < totalPages ? (
                <Button asChild variant="outline">
                  <Link href={href(searchParams, { hal: String(page + 1) })} rel="next">
                    Berikutnya <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
