"use client";

import { useEffect, useRef, useState } from "react";
import { Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

type TextQuestionProps = QuestionProps & { placeholder?: string; wordBank?: string[] };

/**
 * Acak deterministik: urutan bank kata harus sama antara render server dan
 * klien supaya tidak memicu hydration mismatch.
 */
function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const arr = [...items];
  let state = (seed || 1) >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x1_0000_0000;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Jawaban teks bebas (translate / listen tanpa opsi).
 *
 * Jika `wordBank` diberikan, jawaban disusun dari chip: ketuk kata di bank
 * untuk memindahkannya ke kolom jawaban, lalu ketuk chip di kolom jawaban
 * untuk mengembalikannya. Jawaban dinormalisasi (lowercase, trim, tanpa tanda
 * baca) saat diperiksa.
 */
export function TextQuestion({ wordBank, ...props }: TextQuestionProps) {
  if (wordBank?.length) {
    return <WordBankQuestion {...props} words={wordBank} />;
  }
  return <FreeTextQuestion {...props} />;
}

function FreeTextQuestion({
  question,
  answer,
  onAnswer,
  locked,
  verdict,
  placeholder,
}: QuestionProps & { placeholder?: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const value = answer?.kind === "text" ? answer.value : "";

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      <label htmlFor="jawaban-teks" className="sr-only">
        Ketik jawabanmu
      </label>
      <Textarea
        ref={ref}
        id="jawaban-teks"
        value={value}
        onChange={(e) => onAnswer({ kind: "text", value: e.target.value })}
        onKeyDown={(e) => {
          // Enter = periksa (ditangani player); Shift+Enter = baris baru.
          if (e.key === "Enter" && !e.shiftKey) e.preventDefault();
        }}
        readOnly={locked}
        placeholder={placeholder ?? "Ketik jawabanmu di sini…"}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        rows={3}
        className={cn(
          "text-lg",
          locked && verdict === true && "border-success bg-success/8",
          locked && verdict === false && "border-danger bg-danger/8",
        )}
      />
    </div>
  );
}

function WordBankQuestion({
  question,
  answer,
  onAnswer,
  locked,
  verdict,
  words,
}: QuestionProps & { words: string[] }) {
  // Acak sekali per soal. QuestionView di-mount ulang untuk tiap soal.
  const [bank] = useState(() => seededShuffle(words, question.id));
  const [picked, setPicked] = useState<number[]>([]);
  const value = answer?.kind === "text" ? answer.value : "";

  const update = (next: number[]) => {
    setPicked(next);
    onAnswer(next.length ? { kind: "text", value: next.map((i) => bank[i]).join(" ") } : null);
  };

  const chip =
    "rounded-xl border-2 border-b-4 bg-card px-3.5 py-2 text-base font-bold transition-colors disabled:cursor-default";

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label="Kolom jawaban"
        className={cn(
          "flex min-h-24 w-full flex-wrap content-start gap-2 rounded-2xl border-2 border-input bg-card px-4 py-3 transition-colors",
          locked && verdict === true && "border-success bg-success/8",
          locked && verdict === false && "border-danger bg-danger/8",
        )}
      >
        {picked.length === 0 ? (
          <span className="py-1 text-base text-muted-foreground">
            Ketuk kata di bawah untuk menyusun jawaban.
          </span>
        ) : (
          picked.map((bankIndex, position) => (
            <button
              key={`${bankIndex}-${position}`}
              type="button"
              disabled={locked}
              onClick={() => update(picked.filter((_, i) => i !== position))}
              className={cn(chip, "bg-muted/40", !locked && "hover:bg-muted")}
              aria-label={`${bank[bankIndex]} — ketuk untuk mengembalikan ke bank kata`}
              title="Ketuk untuk mengembalikan ke bank kata"
            >
              {bank[bankIndex]}
            </button>
          ))
        )}
      </div>
      <div role="group" aria-label="Bank kata" className="flex flex-wrap items-center gap-2">
        {bank.map((word, index) => {
          if (picked.includes(index)) return null;
          return (
            <button
              key={`${word}-${index}`}
              type="button"
              disabled={locked}
              onClick={() => update([...picked, index])}
              className={cn(chip, !locked && "hover:bg-muted")}
              aria-label={`Tambahkan kata ${word}`}
            >
              {word}
            </button>
          );
        })}
        {picked.length || value ? (
          <button
            type="button"
            disabled={locked}
            onClick={() => update([])}
            className="rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground underline-offset-4 hover:underline disabled:opacity-50"
          >
            Hapus semua
          </button>
        ) : null}
      </div>
    </div>
  );
}
