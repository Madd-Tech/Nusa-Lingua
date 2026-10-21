import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SubmissionStatus } from "@/components/community/submission-status";
import type { QueueItem } from "@/lib/queries/moderation";
import { REJECT_REASON_LABEL } from "@/lib/constants";
import { formatRelative } from "@/lib/utils";

/** Kartu usulan yang sudah ditinjau (tab Disetujui/Ditolak). */
export function ReviewedSubmissionCard({ item }: { item: QueueItem }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-xl font-extrabold">{item.word}</p>
          <p className="break-words font-semibold">{item.meaning_id}</p>
        </div>
        <Badge variant="komunitas" className="shrink-0">
          {item.language_name}
        </Badge>
      </div>

      {item.original ? (
        <p className="text-sm text-muted-foreground">
          Diedit dari: <span className="font-bold text-foreground">{item.original.word}</span> — {item.original.meaning_id}
        </p>
      ) : null}

      {item.status === "rejected" && item.reject_reason ? (
        <p className="text-sm">
          <span className="font-bold">Alasan:</span> {REJECT_REASON_LABEL[item.reject_reason]}
        </p>
      ) : null}
      {item.review_note ? <p className="rounded-xl bg-muted px-3 py-2 text-sm">{item.review_note}</p> : null}

      <p className="text-xs text-muted-foreground">
        Diusulkan oleh {item.submitter_username ? `@${item.submitter_username}` : "pengguna"}
        {item.reviewed_at ? (
          <>
            {" "}
            · ditinjau {item.reviewer_username ? `oleh @${item.reviewer_username} ` : ""}
            {formatRelative(item.reviewed_at)}
          </>
        ) : null}
      </p>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
        <SubmissionStatus status={item.status} />
        {item.status === "approved" ? (
          <Link
            href={`/kamus/${item.language_code}?q=${encodeURIComponent(item.word)}`}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <BookOpen aria-hidden="true" className="size-4" /> Lihat di kamus
          </Link>
        ) : null}
      </div>
    </li>
  );
}
