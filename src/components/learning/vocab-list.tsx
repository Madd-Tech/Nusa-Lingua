"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RemoteImage } from "@/components/ui/remote-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AudioButton } from "@/components/learning/audio-button";
import { StrengthDots } from "@/components/learning/strength-dots";
import type { VocabularyItem } from "@/lib/queries/content";
import { strengthLabel } from "@/lib/srs";

/** Daftar kosakata + detail kata dalam Sheet. */
export function VocabList({ items, strength }: { items: VocabularyItem[]; strength: Record<number, number> }) {
  const [selected, setSelected] = useState<VocabularyItem | null>(null);
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
                </span>
                <span className="block truncate text-sm text-muted-foreground">{v.meaning_id}</span>
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
                <SheetTitle className="text-3xl">{selected.word}</SheetTitle>
                <SheetDescription className="text-base">{selected.meaning_id}</SheetDescription>
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
                  <dd className="mt-1 italic">{selected.example_sentence ? `“${selected.example_sentence}”` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Kategori</dt>
                  <dd className="mt-1 capitalize">{selected.category ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Penguasaanmu</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <StrengthDots value={s} />
                    <span className="text-sm">{s === null ? "Belum dipelajari" : strengthLabel(s)}</span>
                  </dd>
                </div>
              </dl>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
