"use client";

import { useState } from "react";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VocabEditDialog, type EditableVocab } from "@/components/moderation/vocab-edit-dialog";
import { VocabVisibilityButton } from "@/components/moderation/vocab-visibility-button";

/** Aksi per baris di /moderasi/kamus: edit dan sembunyikan/pulihkan. */
export function VocabRowActions({ vocab, hidden, uses }: { vocab: EditableVocab; hidden: boolean; uses: number }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex flex-wrap justify-end gap-1">
      <Button size="sm" variant="outline" onClick={() => setEditing(true)} aria-label={`Edit ${vocab.word}`}>
        <PencilLine aria-hidden="true" /> Edit
      </Button>
      <VocabVisibilityButton id={vocab.id} word={vocab.word} hidden={hidden} uses={uses} />
      <VocabEditDialog
        vocab={vocab}
        open={editing}
        onOpenChange={setEditing}
        warning={uses ? `Kata ini dipakai di ${uses} soal. Soal lesson tidak ikut berubah.` : undefined}
      />
    </div>
  );
}
