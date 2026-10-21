"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Lock, PencilLine, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApproveEditDialog, type ApproveEditValues } from "@/components/moderation/approve-edit-dialog";
import { RejectDialog, type RejectValues } from "@/components/moderation/reject-dialog";
import { createClient } from "@/lib/supabase/client";
import type { QueueItem } from "@/lib/queries/moderation";
import { CONTRIBUTION_XP } from "@/lib/constants";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import type { Json } from "@/types/database";
import { formatRelative } from "@/lib/utils";

/** Kartu usulan yang menunggu: setujui, edit & setujui, atau tolak (semua lewat RPC review_submission). */
export function SubmissionReviewCard({ item }: { item: QueueItem }) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPreset, setRejectPreset] = useState<RejectValues["reason"] | undefined>();
  const submitter = item.submitter_username ? `@${item.submitter_username}` : "pengguna";

  const review = async (args: {
    decision: "approved" | "rejected";
    reason?: RejectValues["reason"];
    note?: string;
    edits?: Record<string, string>;
  }) => {
    const { error } = await createClient().rpc("review_submission", {
      p_id: item.id,
      p_decision: args.decision,
      p_reject_reason: args.reason ?? null,
      p_note: args.note || null,
      p_edits: (args.edits ?? null) as Json,
    });
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan keputusan. Coba lagi."));
      if (error.code === "NL409") router.refresh();
      return false;
    }
    toast.success(
      args.decision === "approved"
        ? `“${args.edits?.word ?? item.word}” disetujui · +${CONTRIBUTION_XP} XP untuk ${submitter}`
        : `“${item.word}” ditolak`,
    );
    router.refresh();
    return true;
  };

  const approve = async () => {
    setApproving(true);
    await review({ decision: "approved" });
    setApproving(false);
  };

  const approveWithEdits = (v: ApproveEditValues) => {
    const edits: Record<string, string> = {};
    if (v.word !== item.word) edits.word = v.word;
    if (v.meaningId !== item.meaning_id) edits.meaning_id = v.meaningId;
    if (v.speechLevel) edits.speech_level = v.speechLevel;
    if (v.exampleSentence) edits.example_sentence = v.exampleSentence;
    if (v.exampleMeaning) edits.example_meaning = v.exampleMeaning;
    return review({ decision: "approved", note: v.note, edits });
  };

  const openReject = (preset?: RejectValues["reason"]) => {
    setRejectPreset(preset);
    setRejectOpen(true);
  };

  const busy = approving;

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

      <p className="text-xs text-muted-foreground">
        Diusulkan oleh {submitter} · {formatRelative(item.created_at)} ·{" "}
        {item.submitter_reviewed > 0
          ? `${item.submitter_reviewed} usulan ditinjau, ${Math.round((item.submitter_approved / item.submitter_reviewed) * 100)}% disetujui`
          : "kontributor baru"}
      </p>

      {item.audio_url ? (
        <audio controls preload="none" src={item.audio_url} className="h-10 w-full" aria-label={`Rekaman pelafalan ${item.word}`} />
      ) : (
        <p className="text-xs italic text-muted-foreground">Tanpa rekaman audio</p>
      )}

      {item.duplicates.length ? (
        <div role="note" className="rounded-xl border-2 border-secondary/50 bg-secondary/10 p-3 text-sm">
          <p className="flex items-center gap-1.5 font-bold">
            <AlertTriangle aria-hidden="true" className="size-4 shrink-0" /> Kata ini sudah ada di kamus
          </p>
          <ul className="mt-1 space-y-0.5">
            {item.duplicates.map((d) => (
              <li key={d.id}>
                <span className="font-bold">{d.word}</span> — {d.meaning_id}
              </li>
            ))}
          </ul>
          {!item.is_own ? (
            <Button type="button" variant="link" size="sm" className="h-auto px-0 pt-1" onClick={() => openReject("duplikat")}>
              Tolak sebagai duplikat
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex flex-wrap justify-end gap-2">
        {item.is_own ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Lock aria-hidden="true" className="size-4" /> Usulanmu — perlu ditinjau moderator lain
          </p>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => openReject()} disabled={busy} aria-label={`Tolak ${item.word}`}>
              <X aria-hidden="true" /> Tolak
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)} disabled={busy} aria-label={`Edit lalu setujui ${item.word}`}>
              <PencilLine aria-hidden="true" /> Edit & setujui
            </Button>
            <Button size="sm" onClick={approve} disabled={busy} aria-label={`Setujui ${item.word}`}>
              <Check aria-hidden="true" /> {approving ? "Menyetujui…" : "Setujui"}
            </Button>
          </>
        )}
      </div>

      {!item.is_own ? (
        <>
          <RejectDialog
            open={rejectOpen}
            onOpenChange={setRejectOpen}
            word={item.word}
            initialReason={rejectPreset}
            onSubmit={(v) => review({ decision: "rejected", reason: v.reason, note: v.note })}
          />
          <ApproveEditDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            word={item.word}
            meaningId={item.meaning_id}
            onSubmit={approveWithEdits}
          />
        </>
      ) : null}
    </li>
  );
}
