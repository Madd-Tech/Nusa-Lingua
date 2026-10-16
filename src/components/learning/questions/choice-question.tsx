"use client";

import { useEffect, useMemo } from "react";
import { Check, X } from "lucide-react";
import { getChoices, isTextCorrect } from "@/lib/questions";
import { cn, shuffle } from "@/lib/utils";
import type { QuestionProps } from "./types";

/** Pilihan ganda (dipakai juga oleh soal "listen" yang punya opsi). Tombol angka 1–9 untuk memilih. */
export function ChoiceQuestion({ question, answer, onAnswer, locked, verdict }: QuestionProps) {
  // Acak sekali per soal.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const choices = useMemo(() => shuffle(getChoices(question.options)), [question.id]);
  const selected = answer?.kind === "choice" ? answer.value : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (locked || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= choices.length) onAnswer({ kind: "choice", value: choices[n - 1] });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choices, locked, onAnswer]);

  return (
    <div role="radiogroup" aria-label="Pilihan jawaban" className="grid gap-3 sm:grid-cols-2">
      {choices.map((choice, i) => {
        const isSelected = selected === choice;
        const isCorrect = locked && isTextCorrect(choice, question.correct_answer);
        const isWrongPick = locked && isSelected && verdict === false;
        return (
          <button
            key={`${choice}-${i}`}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={locked}
            onClick={() => onAnswer({ kind: "choice", value: choice })}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-2xl border-2 border-b-4 bg-card px-4 py-3 text-left text-base font-bold transition-colors",
              !locked && "hover:bg-muted",
              isSelected && !locked && "border-primary bg-primary/10",
              isCorrect && "border-success bg-success/12",
              isWrongPick && "animate-shake border-danger bg-danger/10",
              locked && !isCorrect && !isWrongPick && "opacity-60",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-lg border-2 text-xs font-extrabold text-muted-foreground",
                isSelected && !locked && "border-primary text-primary",
              )}
            >
              {i + 1}
            </span>
            <span className="flex-1">{choice}</span>
            {isCorrect ? (
              <>
                <Check aria-hidden="true" className="size-5 text-success-700 dark:text-success" />
                <span className="sr-only">(jawaban benar)</span>
              </>
            ) : null}
            {isWrongPick ? (
              <>
                <X aria-hidden="true" className="size-5 text-danger-700 dark:text-danger" />
                <span className="sr-only">(pilihanmu, salah)</span>
              </>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
