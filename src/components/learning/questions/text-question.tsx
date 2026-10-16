"use client";

import { useEffect, useMemo, useRef } from "react";
import { Textarea } from "@/components/ui/input";
import { cn, shuffle } from "@/lib/utils";
import type { QuestionProps } from "./types";

/**
 * Jawaban teks bebas (translate / listen tanpa opsi). Jika `wordBank` diberikan,
 * tampil chip kata yang bisa diketuk untuk menambahkannya ke jawaban.
 * Jawaban dinormalisasi (lowercase, trim, tanpa tanda baca) saat diperiksa.
 */
export function TextQuestion({
  question,
  answer,
  onAnswer,
  locked,
  verdict,
  placeholder,
  wordBank,
}: QuestionProps & { placeholder?: string; wordBank?: string[] }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const value = answer?.kind === "text" ? answer.value : "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bank = useMemo(() => (wordBank?.length ? shuffle(wordBank) : []), [question.id]);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const append = (word: string) => onAnswer({ kind: "text", value: value.trim() ? `${value.trim()} ${word}` : word });

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
      {bank.length ? (
        <div role="group" aria-label="Bank kata (opsional)" className="flex flex-wrap gap-2">
          {bank.map((w, i) => (
            <button
              key={`${w}-${i}`}
              type="button"
              disabled={locked}
              onClick={() => append(w)}
              className="rounded-xl border-2 border-b-4 bg-card px-3 py-1.5 font-bold hover:bg-muted disabled:opacity-50"
              aria-label={`Tambahkan kata ${w}`}
            >
              {w}
            </button>
          ))}
          {value ? (
            <button
              type="button"
              disabled={locked}
              onClick={() => onAnswer(null)}
              className="rounded-xl px-3 py-1.5 text-sm font-bold text-muted-foreground underline-offset-4 hover:underline"
            >
              Hapus jawaban
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
