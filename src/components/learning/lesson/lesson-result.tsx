"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame, Star, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { Confetti } from "@/components/gamification/confetti";
import type { CompleteLessonResult } from "@/components/learning/questions/types";
import { cn } from "@/lib/utils";

export function LessonResult({
  result,
  score,
  onContinue,
  onRetry,
}: {
  result: CompleteLessonResult;
  score: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  const reduce = useReducedMotion();
  const title = result.stars >= 3 ? "Sempurna!" : result.stars === 2 ? "Kerja bagus!" : "Lesson selesai!";

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-4 py-10 text-center">
      {result.stars >= 3 ? <Confetti /> : null}
      <BatikPattern variant="kawung" size={56} color="rgb(var(--secondary))" opacity={0.12} />
      <div className="relative w-full max-w-md space-y-8">
        <div role="img" aria-label={`${result.stars} dari 3 bintang`} className="flex items-end justify-center gap-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={reduce ? false : { scale: 0, rotate: -30, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 260, damping: 14 }}
              className={cn(i === 1 && "-translate-y-4")}
            >
              <Star
                aria-hidden="true"
                className={cn(
                  i === 1 ? "size-24" : "size-16",
                  i < result.stars ? "fill-secondary text-secondary-700" : "fill-muted text-muted-foreground/40",
                )}
              />
            </motion.span>
          ))}
        </div>

        <motion.div initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-2">
          <h1 className="text-4xl">{title}</h1>
          <p className="text-muted-foreground">Terus pertahankan semangatmu belajar bahasa daerah.</p>
        </motion.div>

        <motion.dl
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-3 gap-3"
        >
          <Tile label="XP" tone="bg-secondary-600 border-secondary-700 text-ink">
            <Zap aria-hidden="true" className="size-5 fill-secondary text-secondary-700" />+{result.xp_gained} XP
          </Tile>
          <Tile label="Akurasi" tone="bg-primary-600 border-primary-700 text-white">
            <Target aria-hidden="true" className="size-5" />
            {score}%
          </Tile>
          <Tile label="Streak" tone="bg-accent-600 border-accent-700 text-white">
            <motion.span
              animate={reduce ? undefined : { scale: [1, 1.25, 1], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6 }}
              className="inline-flex"
            >
              <Flame aria-hidden="true" className="size-5 fill-accent text-accent" />
            </motion.span>
            {result.streak} hari
          </Tile>
        </motion.dl>

        <div className="flex flex-col gap-3">
          <Button size="lg" block onClick={onContinue} autoFocus>
            Lanjut
          </Button>
          <Button size="lg" variant="outline" block onClick={onRetry}>
            Ulangi
          </Button>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, tone, children }: { label: string; tone: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border-2 border-b-4 bg-card", tone.split(" ")[1])}>
      <dt className={cn("px-2 py-1.5 text-xs font-extrabold uppercase tracking-wide", tone)}>{label}</dt>
      <dd className="flex items-center justify-center gap-1.5 px-2 py-3 text-lg font-extrabold">{children}</dd>
    </div>
  );
}
