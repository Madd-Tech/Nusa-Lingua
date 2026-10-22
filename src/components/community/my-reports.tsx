import Link from "next/link";
import { Ban, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { MyReport } from "@/lib/queries/community";
import { REPORT_REASON_LABEL, REPORT_STATUS_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { formatDate } from "@/lib/utils";

function ReportStatusBadge({ status }: { status: Enums<"report_status"> }) {
  const label = REPORT_STATUS_LABEL[status];
  if (status === "resolved")
    return (
      <Badge variant="success">
        <CheckCircle2 aria-hidden="true" /> {label}
      </Badge>
    );
  if (status === "dismissed")
    return (
      <Badge variant="muted">
        <Ban aria-hidden="true" /> {label}
      </Badge>
    );
  return (
    <Badge variant="secondary">
      <Clock aria-hidden="true" /> Diperiksa
    </Badge>
  );
}

/** Laporan kesalahan yang dikirim user beserta hasil penanganannya. */
export function MyReports({ reports }: { reports: MyReport[] }) {
  return (
    <ul className="space-y-2">
      {reports.map((r) => {
        const target =
          r.target_type === "vocabulary"
            ? r.vocabulary
              ? { label: `“${r.vocabulary.word}”`, href: r.vocabulary.language ? `/kamus/${r.vocabulary.language.code}?q=${encodeURIComponent(r.vocabulary.word)}` : null }
              : { label: "Kata yang sudah dihapus", href: null }
            : r.article
              ? { label: `“${r.article.title}”`, href: `/budaya/${r.article.slug}` }
              : { label: "Artikel yang tidak lagi terbit", href: null };
        return (
          <li key={r.id} className="flex items-start gap-3 rounded-2xl border-2 bg-card p-3">
            <div className="min-w-0 flex-1 text-sm">
              <p className="break-words font-bold">
                {target.href ? (
                  <Link href={target.href} className="hover:underline">
                    {target.label}
                  </Link>
                ) : (
                  target.label
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {REPORT_REASON_LABEL[r.reason]} · {formatDate(r.created_at)}
              </p>
              {r.message ? <p className="mt-1 break-words text-muted-foreground">{r.message}</p> : null}
              {r.resolution_note ? (
                <p className="mt-1 break-words rounded-xl bg-muted px-3 py-2 text-xs">
                  <span className="font-bold">Moderator:</span> {r.resolution_note}
                </p>
              ) : null}
            </div>
            <ReportStatusBadge status={r.status} />
          </li>
        );
      })}
    </ul>
  );
}
