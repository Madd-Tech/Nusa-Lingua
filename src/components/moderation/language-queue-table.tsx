import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OverviewRow } from "@/lib/queries/moderation";
import { formatNumber, formatRelative } from "@/lib/utils";

/** Antrean per bahasa: tabel (tablet/desktop) dan kartu (mobile). */
export function LanguageQueueTable({ rows, showModerators }: { rows: OverviewRow[]; showModerators: boolean }) {
  const reviewed = (r: OverviewRow) =>
    r.reviewed_7d ? `${formatNumber(r.reviewed_7d)} (${Math.round((r.approved_7d / r.reviewed_7d) * 100)}% disetujui)` : "—";
  const href = (r: OverviewRow) => `/moderasi/antrean?bahasa=${r.language_code}`;

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border-2 bg-card md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Antrean usulan per bahasa</caption>
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Bahasa</th>
              <th scope="col" className="px-4 py-3">Menunggu</th>
              <th scope="col" className="px-4 py-3">Paling lama</th>
              <th scope="col" className="px-4 py-3">Ditinjau 7 hari</th>
              <th scope="col" className="px-4 py-3">Artikel ditinjau</th>
              <th scope="col" className="px-4 py-3">Laporan</th>
              {showModerators ? <th scope="col" className="px-4 py-3">Moderator</th> : null}
              <th scope="col" className="px-4 py-3"><span className="sr-only">Aksi</span></th>
            </tr>
          </thead>
          <tbody className="divide-y-2">
            {rows.map((r) => (
              <tr key={r.language_id}>
                <td className="px-4 py-3 font-extrabold">{r.language_name}</td>
                <td className="px-4 py-3">
                  {r.pending_count ? <Badge variant="komunitas">{formatNumber(r.pending_count)}</Badge> : <span className="text-muted-foreground">0</span>}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {r.oldest_pending_at ? formatRelative(r.oldest_pending_at) : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{reviewed(r)}</td>
                <td className="px-4 py-3">
                  {r.articles_review ? (
                    <Link
                      href={`/moderasi/artikel?status=review&bahasa=${r.language_code}`}
                      className="font-bold text-budaya-deep hover:underline dark:text-budaya"
                    >
                      {formatNumber(r.articles_review)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.open_reports ? (
                    <Link
                      href={`/moderasi/laporan?bahasa=${r.language_code}`}
                      className="font-bold text-danger-700 hover:underline dark:text-danger"
                    >
                      {formatNumber(r.open_reports)}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                {showModerators ? (
                  <td className="px-4 py-3">
                    {r.moderator_count ? formatNumber(r.moderator_count) : <Badge variant="danger">Belum ada</Badge>}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right">
                  {r.pending_count ? (
                    <Link href={href(r)} className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
                      Tinjau <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-2 md:hidden">
        {rows.map((r) => (
          <li key={r.language_id} className="flex items-center gap-3 rounded-2xl border-2 bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="font-extrabold">{r.language_name}</p>
              <p className="text-xs text-muted-foreground">
                {r.oldest_pending_at ? `Tertua ${formatRelative(r.oldest_pending_at)} · ` : ""}
                Ditinjau 7 hari: {reviewed(r)}
                {r.articles_review ? ` · ${formatNumber(r.articles_review)} artikel menunggu` : ""}
                {r.open_reports ? ` · ${formatNumber(r.open_reports)} dilaporkan` : ""}
              </p>
              {showModerators && !r.moderator_count ? (
                <Badge variant="danger" className="mt-1">
                  Belum ada moderator
                </Badge>
              ) : null}
            </div>
            {r.pending_count ? (
              <Link
                href={href(r)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-komunitas/10 px-3 py-1.5 text-sm font-bold text-komunitas-deep dark:text-komunitas"
                aria-label={`Tinjau ${r.pending_count} usulan ${r.language_name}`}
              >
                {formatNumber(r.pending_count)} <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : (
              <span className="shrink-0 text-sm text-muted-foreground">0</span>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
