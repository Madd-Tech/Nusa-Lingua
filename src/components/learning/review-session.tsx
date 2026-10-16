"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { IlloCheck } from "@/components/illustrations";
import { AudioButton } from "@/components/learning/audio-button";
import { createClient } from "@/lib/supabase/client";
import { nextMastery, strengthLabel } from "@/lib/srs";
import type { DueReview } from "@/lib/queries/progress";
import { cn } from "@/lib/utils";

/**
 * Flashcard: depan (kata + audio + pelafalan) → balik (arti, contoh, tingkat tutur).
 * Pintasan: Spasi = balik kartu, 1 = Belum ingat, 2 = Sudah ingat.
 */
export function ReviewSession({ userId, items }: { userId: string; items: DueReview[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tally, setTally] = useState({ remembered: 0, forgot: 0 });

  const item = items[index];
  const done = index >= items.length;

  const grade = async (correct: boolean) => {
    if (!item || saving) return;
    setSaving(true);
    const next = nextMastery(item, correct);
    const { error } = await supabase
      .from("user_vocab_mastery")
      .upsert({ user_id: userId, vocabulary_id: item.vocabulary_id, ...next }, { onConflict: "user_id,vocabulary_id" });
    setSaving(false);
    if (error) {
      toast.error("Gagal menyimpan. Coba tekan lagi.");
      return;
    }
    setTally((t) => (correct ? { ...t, remembered: t.remembered + 1 } : { ...t, forgot: t.forgot + 1 }));
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || e.target instanceof HTMLInputElement || e.target instanceof HTMLButtonElement) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && e.key === "1") void grade(false);
      else if (flipped && e.key === "2") void grade(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (done) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border-2 bg-card p-8 text-center">
        <IlloCheck />
        <h2 className="text-2xl">Sesi ulasan selesai!</h2>
        <p className="text-muted-foreground">
          Sudah ingat <strong className="text-foreground">{tally.remembered}</strong> kata, dan{" "}
          <strong className="text-foreground">{tally.forgot}</strong> kata akan muncul lagi lebih cepat.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => router.refresh()}>
            <RefreshCw aria-hidden="true" /> Cek ulasan lagi
          </Button>
          <Button asChild variant="outline">
            <Link href="/belajar">Lanjut belajar</Link>
          </Button>
        </div>
      </div>
    );
  }

  const vocab = item.vocabulary;

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Progress value={index} max={items.length} className="h-3" aria-label={`Kartu ${index + 1} dari ${items.length}`} />
        <span className="shrink-0 text-sm font-bold text-muted-foreground">
          {index + 1}/{items.length}
        </span>
      </div>

      <div className="[perspective:1200px]">
        <div
          key={item.vocabulary_id}
          className={cn(
            "relative grid min-h-[300px] transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          {/* Depan */}
          <section
            aria-hidden={flipped}
            ref={(el) => {
              el?.toggleAttribute("inert", flipped);
            }}
            className="relative col-start-1 row-start-1 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border-2 border-b-[6px] bg-card p-6 text-center shadow-soft [backface-visibility:hidden]"
          >
            <BatikPattern variant="kawung" color="rgb(var(--c-belajar))" opacity={0.05} />
            <Badge variant="muted" className="relative">
              <Brain aria-hidden="true" /> {strengthLabel(item.strength)}
            </Badge>
            <h2 className="relative text-4xl sm:text-5xl">{vocab.word}</h2>
            {vocab.pronunciation ? <p className="relative text-muted-foreground">/{vocab.pronunciation}/</p> : null}
            <AudioButton src={vocab.audio_url} label={`Dengarkan ${vocab.word}`} className="relative" />
          </section>
          {/* Balik */}
          <section
            aria-hidden={!flipped}
            ref={(el) => {
              el?.toggleAttribute("inert", !flipped);
            }}
            aria-live="polite"
            className="relative col-start-1 row-start-1 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border-2 border-b-[6px] border-primary/40 bg-card p-6 text-center shadow-soft [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            <BatikPattern variant="parang" color="rgb(var(--primary))" opacity={0.05} />
            <p className="relative text-sm font-bold uppercase tracking-wide text-muted-foreground">{vocab.word} artinya</p>
            <p className="relative text-3xl font-extrabold text-primary-700 dark:text-primary">{vocab.meaning_id}</p>
            {vocab.example_sentence ? <p className="relative italic text-muted-foreground">“{vocab.example_sentence}”</p> : null}
            {vocab.speech_level ? (
              <Badge variant="budaya" className="relative">
                Tingkat tutur: {vocab.speech_level}
              </Badge>
            ) : null}
          </section>
        </div>
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button size="lg" variant="destructive" onClick={() => grade(false)} disabled={saving}>
            <ThumbsDown aria-hidden="true" /> Belum ingat
          </Button>
          <Button size="lg" onClick={() => grade(true)} disabled={saving}>
            <ThumbsUp aria-hidden="true" /> Sudah ingat
          </Button>
        </div>
      ) : (
        <Button size="lg" variant="secondary" block onClick={() => setFlipped(true)}>
          Balik kartu
        </Button>
      )}
      <p className="hidden text-center text-xs text-muted-foreground sm:block">Pintasan: Spasi = balik kartu · 1 = Belum ingat · 2 = Sudah ingat</p>
    </div>
  );
}
