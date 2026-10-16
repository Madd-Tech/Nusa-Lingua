"use client";

import { useMemo, useState } from "react";
import { getArrangeTokens } from "@/lib/questions";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

/** Susun kalimat: ketuk kata di bank untuk memindahkan ke baris jawaban (dan sebaliknya). */
export function ArrangeQuestion({ question, onAnswer, locked, verdict }: QuestionProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tokens = useMemo(() => getArrangeTokens(question.options, question.correct_answer), [question.id]);
  const [picked, setPicked] = useState<number[]>([]);

  const update = (next: number[]) => {
    setPicked(next);
    onAnswer(next.length ? { kind: "arrange", tokens: next.map((i) => tokens[i]) } : null);
  };

  const chip =
    "rounded-xl border-2 border-b-4 bg-card px-3.5 py-2 text-base font-bold transition-colors disabled:cursor-default";

  return (
    <div className="space-y-6">
      <div
        aria-label="Jawabanmu"
        role="group"
        className={cn(
          "flex min-h-[4.5rem] flex-wrap content-start gap-2 border-b-2 border-dashed pb-3",
          locked && verdict === true && "border-success",
          locked && verdict === false && "border-danger",
        )}
      >
        {picked.length === 0 ? (
          <span className="py-2 text-sm text-muted-foreground">Ketuk kata di bawah untuk menyusun jawaban.</span>
        ) : (
          picked.map((ti, pos) => (
            <button
              key={`${ti}-${pos}`}
              type="button"
              disabled={locked}
              onClick={() => update(picked.filter((_, p) => p !== pos))}
              className={cn(chip, !locked && "hover:bg-muted")}
              aria-label={`${tokens[ti]} — ketuk untuk mengembalikan`}
            >
              {tokens[ti]}
            </button>
          ))
        )}
      </div>
      <div role="group" aria-label="Bank kata" className="flex flex-wrap justify-center gap-2">
        {tokens.map((t, i) => {
          const used = picked.includes(i);
          return (
            <button
              key={`${t}-${i}`}
              type="button"
              disabled={locked || used}
              onClick={() => update([...picked, i])}
              className={cn(chip, used ? "border-muted bg-muted text-transparent" : "hover:bg-muted")}
              aria-hidden={used}
              tabIndex={used ? -1 : 0}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
