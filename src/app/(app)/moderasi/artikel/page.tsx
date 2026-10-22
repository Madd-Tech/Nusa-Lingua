import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MessageSquareWarning, PenSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloBook } from "@/components/illustrations";
import { ArticleStatusBadge } from "@/components/moderation/article-status-badge";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { ParamSelect } from "@/components/moderation/param-select";
import { getModerationContext } from "@/lib/moderation-context";
import { countArticlesByStatus, getModerationArticles } from "@/lib/queries/moderation";
import { ARTICLE_STATUSES, articleCategoryLabel } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, formatNumber, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Artikel budaya" };

type SP = { status?: string; bahasa?: string; hal?: string };

const EMPTY: Record<Enums<"article_status">, { title: string; description: string }> = {
  draft: { title: "Belum ada draf", description: "Mulai tulis artikel tentang budaya dari bahasa yang kamu moderasi." },
  review: { title: "Tidak ada yang menunggu tinjauan", description: "Artikel yang diajukan penulis akan muncul di sini." },
  published: { title: "Belum ada artikel terbit", description: "Artikel yang sudah diterbitkan tampil di halaman Budaya." },
  archived: { title: "Arsip kosong", description: "Artikel yang diarsipkan disembunyikan dari halaman Budaya." },
};

function buildHref(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  (["status", "bahasa"] as const).forEach((k) => merged[k] && params.set(k, merged[k]!));
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/moderasi/artikel${qs ? `?${qs}` : ""}`;
}

export default async function ArtikelModerasiPage({ searchParams }: { searchParams: SP }) {
  const { supabase, userId, isModerator, isAdmin, scope } = await getModerationContext();
  if (!isModerator) return null;
  if (!scope.length) return <NoScopeState />;

  const status = ARTICLE_STATUSES.some((s) => s.value === searchParams.status)
    ? (searchParams.status as Enums<"article_status">)
    : "review";
  const language = scope.find((l) => l.code === searchParams.bahasa) ?? null;
  // Admin melihat semua (termasuk artikel tanpa bahasa); moderator dibatasi ke bahasanya.
  const languageIds = language ? [language.id] : isAdmin ? null : scope.map((l) => l.id);
  const page = Math.max(1, Number(searchParams.hal) || 1);

  const [{ items, total, pageSize }, counts] = await Promise.all([
    getModerationArticles(supabase, { status, languageIds, page }),
    countArticlesByStatus(supabase, languageIds),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section aria-labelledby="artikel-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 id="artikel-heading" className="text-xl">
          Artikel budaya
        </h2>
        <Button asChild variant="budaya">
          <Link href="/moderasi/artikel/baru">
            <PenSquare aria-hidden="true" /> Tulis artikel
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter status artikel" className="overflow-x-auto">
          <ul className="inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
            {ARTICLE_STATUSES.map((s) => (
              <li key={s.value}>
                <Link
                  href={buildHref(searchParams, { status: s.value, hal: undefined })}
                  aria-current={s.value === status ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground",
                    s.value === status && "bg-card text-foreground shadow-soft",
                  )}
                >
                  {s.tab}
                  <span className="rounded-full bg-background/70 px-1.5 text-xs">{formatNumber(counts[s.value])}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {scope.length > 1 ? (
          <ParamSelect
            param="bahasa"
            label="Bahasa"
            value={language?.code ?? ""}
            options={[{ value: "", label: "Semua bahasa" }, ...scope.map((l) => ({ value: l.code, label: l.name }))]}
          />
        ) : null}
      </div>

      {items.length === 0 ? (
        <EmptyState
          illustration={<IlloBook />}
          title={EMPTY[status].title}
          description={EMPTY[status].description}
          action={
            status === "draft" ? (
              <Button asChild variant="budaya">
                <Link href="/moderasi/artikel/baru">Tulis artikel</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <ul className="space-y-3">
          {items.map((a) => {
            const mine = a.author_id === userId;
            return (
              <li key={a.id}>
                <Link
                  href={`/moderasi/artikel/${a.id}`}
                  className="flex flex-col gap-2 rounded-2xl border-2 bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-lg font-extrabold">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[a.language?.name, articleCategoryLabel(a.category)].filter(Boolean).join(" · ")} · oleh{" "}
                      {a.author?.username ? `@${a.author.username}` : "tim Nusa Lingua"}
                      {mine ? " (kamu)" : ""} · {formatRelative(a.updated_at ?? a.created_at)}
                    </p>
                    {a.status === "draft" && a.review_note ? (
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-secondary-700 dark:text-secondary">
                        <MessageSquareWarning aria-hidden="true" className="size-4" /> Ada catatan dari peninjau
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {a.status === "review" && mine && !isAdmin ? <Badge variant="muted">Menunggu moderator lain</Badge> : null}
                    <ArticleStatusBadge status={a.status} />
                  </div>
                </Link>
              </li>
            );
          })}
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
