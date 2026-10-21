import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Submission } from "@/lib/queries/community";
import type { SubmissionOriginal } from "@/lib/queries/moderation";
import { CONTRIBUTION_XP, REJECT_REASON_LABEL } from "@/lib/constants";

/** Hasil tinjauan untuk kontributor: XP, perubahan dari moderator, alasan & catatan, tautan kamus. */
export function SubmissionFeedback({ submission: s }: { submission: Submission }) {
  if (s.status === "pending") return null;
  const original = s.original as SubmissionOriginal | null;

  return (
    <div className="space-y-1 text-xs">
      {/* Usulan yang disetujui sebelum sistem XP kontribusi tidak punya reviewed_at. */}
      {s.status === "approved" && s.reviewed_at ? (
        <p className="font-bold text-success-700 dark:text-success">+{CONTRIBUTION_XP} XP</p>
      ) : null}
      {original ? (
        <p className="text-muted-foreground">
          Disetujui dengan perubahan dari “{original.word}” — {original.meaning_id}
        </p>
      ) : null}
      {s.status === "rejected" && s.reject_reason ? (
        <p>
          <span className="font-bold">Alasan:</span> {REJECT_REASON_LABEL[s.reject_reason]}
        </p>
      ) : null}
      {s.review_note ? <p className="italic text-muted-foreground">“{s.review_note}”</p> : null}
      {s.status === "approved" && s.language?.code ? (
        <Link
          href={`/kamus/${s.language.code}?q=${encodeURIComponent(s.word)}`}
          className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
        >
          <BookOpen aria-hidden="true" className="size-3.5" /> Lihat di kamus
        </Link>
      ) : null}
    </div>
  );
}
