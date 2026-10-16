import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloCheck } from "@/components/illustrations";
import { PageHeader } from "@/components/layout/page-header";
import { ModerationActions } from "@/components/community/moderation-actions";
import { SubmissionStatus } from "@/components/community/submission-status";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/progress";
import { countSubmissionsByStatus, getSubmissionsByStatus } from "@/lib/queries/community";
import { SUBMISSION_STATUS_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Moderasi kontribusi" };

const STATUSES: Enums<"submission_status">[] = ["pending", "approved", "rejected"];

export default async function ModerasiPage({ searchParams }: { searchParams: { status?: string } }) {
  const { supabase, user } = await getCurrentUser();
  const profile = await getProfile(supabase, user!.id);
  // Khusus moderator/admin. (RLS di database tetap menjadi penegak utama.)
  if (profile?.role !== "moderator" && profile?.role !== "admin") {
    return (
      <EmptyState
        className="mx-auto mt-8 max-w-lg"
        illustration={<ShieldX aria-hidden="true" className="size-20 text-komunitas" />}
        title="403 — Halaman khusus moderator"
        description="Halaman ini hanya untuk moderator dan admin. Kamu tetap bisa mengusulkan kosakata dan memantau statusnya."
        action={
          <Button asChild variant="komunitas">
            <Link href="/kontribusi">Kembali ke Kontribusi</Link>
          </Button>
        }
      />
    );
  }

  const status = STATUSES.includes(searchParams.status as Enums<"submission_status">)
    ? (searchParams.status as Enums<"submission_status">)
    : "pending";

  const [items, pendingCount] = await Promise.all([
    getSubmissionsByStatus(supabase, status),
    countSubmissionsByStatus(supabase, "pending"),
  ]);

  return (
    <>
      <Link href="/kontribusi" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Kontribusi
      </Link>
      <PageHeader
        icon={ShieldCheck}
        category="komunitas"
        pattern="parang"
        title="Moderasi kontribusi"
        description={`${pendingCount} kiriman menunggu ulasan.`}
      />

      <nav aria-label="Filter status" className="mb-6 inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/kontribusi/moderasi?status=${s}`}
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

      {items.length === 0 ? (
        <EmptyState
          illustration={<IlloCheck />}
          title={status === "pending" ? "Antrean bersih!" : "Belum ada data"}
          description={status === "pending" ? "Tidak ada kiriman yang menunggu ulasan saat ini." : "Belum ada kiriman dengan status ini."}
        />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {items.map((s) => (
            <li key={s.id} className="flex flex-col gap-3 rounded-2xl border-2 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-extrabold">{s.word}</p>
                  <p className="font-semibold">{s.meaning_id}</p>
                </div>
                <Badge variant="komunitas">{s.language?.name ?? "—"}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Diusulkan oleh {s.submitter ? `@${s.submitter}` : "pengguna"} · {formatRelative(s.created_at)}
              </p>
              {s.audio_url ? (
                <audio controls preload="none" src={s.audio_url} className="h-10 w-full" aria-label={`Rekaman pelafalan ${s.word}`} />
              ) : (
                <p className="text-xs italic text-muted-foreground">Tanpa rekaman audio</p>
              )}
              <div className="flex justify-end">
                {status === "pending" ? (
                  <ModerationActions id={s.id} reviewerId={user!.id} word={s.word} />
                ) : (
                  <SubmissionStatus status={s.status} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
