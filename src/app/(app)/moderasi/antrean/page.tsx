import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloCheck } from "@/components/illustrations";
import { NoScopeState } from "@/components/moderation/no-scope-state";
import { ParamSelect } from "@/components/moderation/param-select";
import { ReviewedSubmissionCard } from "@/components/moderation/reviewed-submission-card";
import { SubmissionReviewCard } from "@/components/moderation/submission-review-card";
import { getModerationContext } from "@/lib/moderation-context";
import { getSubmissionQueue } from "@/lib/queries/moderation";
import { SUBMISSION_STATUS_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Antrean usulan" };

const STATUSES: Enums<"submission_status">[] = ["pending", "approved", "rejected"];

type SP = { status?: string; bahasa?: string; hal?: string };

function buildHref(sp: SP, patch: Partial<SP>) {
  const merged = { ...sp, ...patch };
  const params = new URLSearchParams();
  if (merged.status && merged.status !== "pending") params.set("status", merged.status);
  if (merged.bahasa) params.set("bahasa", merged.bahasa);
  if (merged.hal && merged.hal !== "1") params.set("hal", merged.hal);
  const qs = params.toString();
  return `/moderasi/antrean${qs ? `?${qs}` : ""}`;
}

export default async function AntreanPage({ searchParams }: { searchParams: SP }) {
  const { supabase, isModerator, scope } = await getModerationContext();
  if (!isModerator) return null;

  if (!scope.length) return <NoScopeState />;

  const status = STATUSES.includes(searchParams.status as Enums<"submission_status">)
    ? (searchParams.status as Enums<"submission_status">)
    : "pending";
  const language = scope.find((l) => l.code === searchParams.bahasa) ?? null;
  const page = Math.max(1, Number(searchParams.hal) || 1);
  const { items, total, pageSize } = await getSubmissionQueue(supabase, { status, languageId: language?.id, page });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section aria-labelledby="antrean-heading">
      <h2 id="antrean-heading" className="sr-only">
        Antrean usulan kosakata
      </h2>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter status" className="inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildHref(searchParams, { status: s, hal: undefined })}
              aria-current={s === status ? "page" : undefined}
              className={cn(
                "rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground",
                s === status && "bg-card text-foreground shadow-soft",
              )}
            >
              {SUBMISSION_STATUS_LABEL[s]}
            </Link>
          ))}
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

      <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
        {formatNumber(total)} usulan {SUBMISSION_STATUS_LABEL[status].toLowerCase()}
        {language ? ` · ${language.name}` : ""}
        {status === "pending" && total ? " · tertua di atas" : ""}
      </p>

      {items.length === 0 ? (
        <EmptyState
          illustration={<IlloCheck />}
          title={status === "pending" ? "Antrean bersih!" : "Belum ada data"}
          description={
            status === "pending" ? "Tidak ada usulan yang menunggu ditinjau saat ini." : "Belum ada usulan dengan status ini."
          }
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((item) =>
            status === "pending" ? (
              <SubmissionReviewCard key={item.id} item={item} />
            ) : (
              <ReviewedSubmissionCard key={item.id} item={item} />
            ),
          )}
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
