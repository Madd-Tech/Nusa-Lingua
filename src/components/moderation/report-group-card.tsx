"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Ban, BookA, CheckCheck, ExternalLink, Newspaper, PencilLine } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResolveReportDialog } from "@/components/moderation/resolve-report-dialog";
import { VocabEditDialog, type EditableVocab } from "@/components/moderation/vocab-edit-dialog";
import { VocabVisibilityButton } from "@/components/moderation/vocab-visibility-button";
import { createClient } from "@/lib/supabase/client";
import type { ReportGroup } from "@/lib/queries/moderation";
import { REPORT_REASON_LABEL } from "@/lib/constants";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import type { Enums } from "@/types/database";
import { formatRelative } from "@/lib/utils";

const SHOWN = 3;

/** Satu target yang dilaporkan (kata/artikel) beserta laporan-laporannya dan aksi penanganan. */
export function ReportGroupCard({
  group,
  status,
  vocab,
}: {
  group: ReportGroup;
  status: Enums<"report_status">;
  /** Data lengkap kata untuk dialog edit (hanya target kosakata). */
  vocab?: EditableVocab;
}) {
  const router = useRouter();
  const [resolving, setResolving] = useState<"resolved" | "dismissed" | null>(null);
  const [editing, setEditing] = useState(false);
  const isVocab = group.target_type === "vocabulary";
  const open = status === "open";
  const title = group.title ?? (isVocab ? "Kata dihapus" : "Artikel dihapus");
  const extra = group.reports.length - SHOWN;

  const resolve = async (status: "resolved" | "dismissed", note: string) => {
    const { error } = await createClient().rpc("resolve_reports", {
      p_target_type: group.target_type,
      p_target_id: group.target_id,
      p_status: status,
      p_note: note || null,
    });
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan. Coba lagi."));
      if (error.code === "NL409") router.refresh();
      return false;
    }
    toast.success(status === "resolved" ? "Laporan ditandai selesai" : "Laporan diabaikan");
    router.refresh();
    return true;
  };

  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-komunitas/10 text-komunitas">
          {isVocab ? <BookA aria-hidden="true" className="size-5" /> : <Newspaper aria-hidden="true" className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="break-words text-lg font-extrabold">{title}</p>
          {group.subtitle ? <p className="line-clamp-2 break-words text-sm text-muted-foreground">{group.subtitle}</p> : null}
          <div className="mt-1.5 flex flex-wrap gap-1">
            <Badge variant="muted">{isVocab ? "Kosakata" : "Artikel"}</Badge>
            {group.language_name ? <Badge variant="komunitas">{group.language_name}</Badge> : null}
            {group.vocab_hidden ? <Badge variant="danger">Tersembunyi</Badge> : null}
            {isVocab && group.vocab_uses ? <Badge variant="outline">Dipakai di {group.vocab_uses} soal</Badge> : null}
            {!isVocab && group.article_status && group.article_status !== "published" ? <Badge variant="outline">Tidak terbit</Badge> : null}
          </div>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {group.report_count} laporan
        </Badge>
      </div>

      <ul className="space-y-2 rounded-xl bg-muted/50 p-3 text-sm">
        {group.reports.slice(0, SHOWN).map((r) => (
          <li key={r.id}>
            <p>
              <span className="font-bold">{REPORT_REASON_LABEL[r.reason]}</span>
              <span className="text-muted-foreground">
                {" "}
                · {r.reporter ? `@${r.reporter}` : "pengguna"} · {formatRelative(r.created_at)}
              </span>
            </p>
            {r.message ? <p className="break-words italic text-muted-foreground">“{r.message}”</p> : null}
          </li>
        ))}
        {extra > 0 ? <li className="text-xs font-bold text-muted-foreground">+{extra} laporan lain</li> : null}
      </ul>

      {!open ? (
        <p className="text-sm text-muted-foreground">
          Ditangani {group.resolved_by_username ? `oleh @${group.resolved_by_username} ` : ""}
          {group.resolved_at ? formatRelative(group.resolved_at) : ""}
          {group.resolution_note ? <span className="mt-0.5 block italic">“{group.resolution_note}”</span> : null}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
        {isVocab && vocab ? (
          <>
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <PencilLine aria-hidden="true" /> Edit kata
            </Button>
            <VocabVisibilityButton id={vocab.id} word={vocab.word} hidden={group.vocab_hidden} uses={group.vocab_uses} />
          </>
        ) : null}
        {!isVocab ? (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href={`/moderasi/artikel/${group.target_id}`}>
                <PencilLine aria-hidden="true" /> Buka editor
              </Link>
            </Button>
            {group.article_slug && group.article_status === "published" ? (
              <Button asChild size="sm" variant="ghost">
                <Link href={`/budaya/${group.article_slug}`}>
                  Lihat <ExternalLink aria-hidden="true" />
                </Link>
              </Button>
            ) : null}
          </>
        ) : null}
        {open ? (
          <>
            <Button size="sm" variant="ghost" onClick={() => setResolving("dismissed")}>
              <Ban aria-hidden="true" /> Abaikan
            </Button>
            <Button size="sm" onClick={() => setResolving("resolved")}>
              <CheckCheck aria-hidden="true" /> Tandai selesai
            </Button>
          </>
        ) : null}
      </div>

      <ResolveReportDialog
        mode={resolving}
        onOpenChange={(o) => !o && setResolving(null)}
        title={title}
        count={group.report_count}
        onSubmit={(note) => resolve(resolving ?? "resolved", note)}
      />
      {isVocab && vocab ? (
        <VocabEditDialog
          vocab={vocab}
          open={editing}
          onOpenChange={setEditing}
          warning={group.vocab_uses ? `Kata ini dipakai di ${group.vocab_uses} soal. Soal lesson tidak ikut berubah.` : undefined}
        />
      ) : null}
    </li>
  );
}
