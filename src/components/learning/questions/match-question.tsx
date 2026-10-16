"use client";

import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { getPairs } from "@/lib/questions";
import { cn, shuffle } from "@/lib/utils";
import type { QuestionProps } from "./types";

/** Pasangkan kata: pilih satu di kiri dan satu di kanan. Pasangan benar terkunci. */
export function MatchQuestion({ question, onAnswer, locked }: QuestionProps) {
  const pairs = useMemo(
    () => getPairs(question.options, question.correct_answer),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lefts = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rights = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs]);

  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null);
  const [announce, setAnnounce] = useState("");

  useEffect(() => {
    if (!selLeft || !selRight) return;
    const ok = pairs.some((p) => p.left === selLeft && p.right === selRight);
    if (ok) {
      const next = new Set(matched).add(selLeft);
      setMatched(next);
      setAnnounce(`Benar: ${selLeft} — ${selRight}`);
      onAnswer({ kind: "match", complete: next.size === pairs.length, mistakes });
    } else {
      const m = mistakes + 1;
      setMistakes(m);
      setWrong({ left: selLeft, right: selRight });
      setAnnounce(`Kurang tepat: ${selLeft} bukan pasangan ${selRight}`);
      setTimeout(() => setWrong(null), 450);
      onAnswer({ kind: "match", complete: false, mistakes: m });
    }
    setSelLeft(null);
    setSelRight(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selLeft, selRight]);

  const matchedRights = new Set(pairs.filter((p) => matched.has(p.left)).map((p) => p.right));

  const cell = (opts: { label: string; selected: boolean; done: boolean; isWrong: boolean; onClick: () => void }) => (
    <button
      key={opts.label}
      type="button"
      disabled={locked || opts.done}
      aria-pressed={opts.selected}
      onClick={opts.onClick}
      className={cn(
        "flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-b-4 bg-card px-3 py-2 text-center text-base font-bold transition-colors",
        !opts.done && !locked && "hover:bg-muted",
        opts.selected && "border-primary bg-primary/10",
        opts.done && "border-success/50 bg-success/8 text-muted-foreground",
        opts.isWrong && "animate-shake border-danger bg-danger/10",
      )}
    >
      {opts.label}
      {opts.done ? (
        <>
          <Check aria-hidden="true" className="size-4 text-success-700 dark:text-success" />
          <span className="sr-only">(sudah dipasangkan)</span>
        </>
      ) : null}
    </button>
  );

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {announce}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-3" role="group" aria-label="Kata">
          {lefts.map((l) =>
            cell({
              label: l,
              selected: selLeft === l,
              done: matched.has(l),
              isWrong: wrong?.left === l,
              onClick: () => setSelLeft(selLeft === l ? null : l),
            }),
          )}
        </div>
        <div className="space-y-3" role="group" aria-label="Arti">
          {rights.map((r) =>
            cell({
              label: r,
              selected: selRight === r,
              done: matchedRights.has(r),
              isWrong: wrong?.right === r,
              onClick: () => setSelRight(selRight === r ? null : r),
            }),
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {matched.size}/{pairs.length} pasangan
        {mistakes ? ` · ${mistakes} kali keliru` : ""}
      </p>
    </div>
  );
}
