"use client";

import { useState } from "react";
import { ChevronRight, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AudioButton } from "@/components/learning/audio-button";
import { StrengthDots } from "@/components/learning/strength-dots";
import { ReportButton } from "@/components/community/report-button";
import { VocabEditDialog } from "@/components/moderation/vocab-edit-dialog";
import type { VocabularyItem } from "@/lib/queries/content";
import { strengthLabel } from "@/lib/srs";

/** Daftar kosakata + detail kata dalam Sheet. `canModerate` menampilkan tombol Edit untuk moderator bahasa ini. */
export function VocabList({
  items,
  strength,
  canModerate = false,
}: {
  items: VocabularyItem[];
  strength: Record<number, number>;
  canModerate?: boolean;
}) {
  const [selected, setSelected] = useState<VocabularyItem | null>(null);
  const [editing, setEditing] = useState<VocabularyItem | null>(null);
  const s = selected ? strength[selected.id] ?? null : null;

  return (
    <>
      <ul className="grid gap-3 md:grid-cols-2">
        {items.map((v) => (
          <li key={v.id} className="flex items-center gap-3 rounded-2xl border-2 bg-card p-3 shadow-soft">
            <AudioButton src={v.audio_url} label={`Dengarkan ${v.word}`} size="sm" />
            <button
              type="button"
              onClick={() => setSelected(v)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Detail kata ${v.word}: ${v.meaning_id}`}
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-lg font-extrabold">{v.word}</span>
                  {v.speech_level ? <Badge variant="budaya">{v.speech_level}</Badge> : null}
                  {v.peran === "varian" ? <Badge variant="muted">padanan</Badge> : null}
                  {v.contributor?.username ? <Badge variant="komunitas">kontribusi</Badge> : null}
                </span>
                <span className="block truncate text-sm text-muted-foreground">{v.meaning_id}</span>
                {v.meaning_en ? (
                  <span className="block truncate text-xs italic text-muted-foreground/80">{v.meaning_en}</span>
                ) : null}
                <StrengthDots value={strength[v.id] ?? null} className="mt-1.5" />
              </span>
              <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="text-3xl">
                  {selected.word}
                  {selected.peran === "varian" ? (
                    <Badge variant="muted" className="ml-2 align-middle text-sm font-bold">
                      padanan
                    </Badge>
                  ) : null}
                </SheetTitle>
                <SheetDescription className="text-base">{selected.meaning_id}</SheetDescription>
                {selected.meaning_en ? (
                  <p className="text-sm italic text-muted-foreground">{selected.meaning_en}</p>
                ) : null}
              </SheetHeader>
              {selected.image_url ? (
                <RemoteImage src={selected.image_url} alt={`Ilustrasi ${selected.word}`} className="aspect-video w-full rounded-2xl border-2" />
              ) : null}
              <div className="flex items-center gap-3 rounded-2xl border-2 p-3">
                <AudioButton src={selected.audio_url} label={`Dengarkan ${selected.word}`} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Pengucapan</p>
                  <p className="font-bold">{selected.pronunciation ? `/${selected.pronunciation}/` : "—"}</p>
                </div>
              </div>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tingkat tutur</dt>
                  <dd className="mt-1">{selected.speech_level ? <Badge variant="budaya">{selected.speech_level}</Badge> : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Contoh kalimat</dt>
                  <dd className="mt-1">
                    {selected.example_sentence ? (
                      <>
                        <span className="italic">“{selected.example_sentence}”</span>
                        {selected.example_meaning ? (
                          <span className="mt-0.5 block text-sm text-muted-foreground">{selected.example_meaning}</span>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kategori</dt>
                  <dd className="mt-1 capitalize">{selected.category ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Peran kata</dt>
                  <dd className="mt-1 text-sm">
                    {selected.peran === "varian" ? (
                      "Padanan: kata lain untuk arti yang sama."
                    ) : (
                      "Materi pelajaran: muncul di lesson & soal."
                    )}
                  </dd>
                </div>
                {selected.contributor?.username ? (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kontributor</dt>
                    <dd className="mt-1 text-sm">
                      Diusulkan oleh <span className="font-bold">@{selected.contributor.username}</span> dan disetujui moderator.
                    </dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Penguasaanmu</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <StrengthDots value={s} />
                    <span className="text-sm">{s === null ? "Belum dipelajari" : strengthLabel(s)}</span>
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 border-t-2 pt-4">
                <ReportButton targetType="vocabulary" targetId={selected.id} targetLabel={selected.word} />
                {canModerate ? (
                  <Button size="sm" variant="outline" onClick={() => setEditing(selected)}>
                    <PencilLine aria-hidden="true" /> Edit kata
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      {canModerate ? (
        <VocabEditDialog
          vocab={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          warning={
            editing?.peran === "inti"
              ? "Kata ini materi pelajaran. Soal lesson yang memakainya tidak ikut berubah."
              : undefined
          }
          onSaved={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}
