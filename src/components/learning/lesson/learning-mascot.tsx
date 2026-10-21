"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import type { LearningMascotProfile } from "@/lib/learning-mascots";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "thinking" | "correct" | "wrong" | "celebrate";

const TONE: Record<MascotMood, { card: string; bubble: string; label: string }> = {
  idle: { card: "border-border bg-card", bubble: "bg-muted/70", label: "text-muted-foreground" },
  thinking: { card: "border-primary/40 bg-primary/6", bubble: "bg-primary/10", label: "text-primary-700 dark:text-primary" },
  correct: { card: "border-success/50 bg-success/8", bubble: "bg-success/12", label: "text-success-700 dark:text-success" },
  wrong: { card: "border-danger/40 bg-danger/8", bubble: "bg-danger/12", label: "text-danger-700 dark:text-danger" },
  celebrate: { card: "border-accent/60 bg-accent/10", bubble: "bg-accent/15", label: "text-accent-700 dark:text-accent" },
};

/**
 * Pendamping maskot di sesi lesson.
 *
 * Selalu terlihat: di layar kecil menjadi kartu horizontal di atas soal,
 * di layar lebar menjadi kolom lengket di samping soal. Pose, warna kartu,
 * dan balon ucapan berubah mengikuti jawaban pengguna.
 */
export function LearningMascot({
  mascot,
  mood,
  message,
  streak,
}: {
  mascot: LearningMascotProfile;
  mood: MascotMood;
  message: string;
  streak: number;
}) {
  const reduce = useReducedMotion();
  const tone = TONE[mood];

  return (
    <aside aria-label={`Maskot pendamping: ${mascot.name}`} className="relative">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border-2 border-b-4 p-2.5 shadow-soft transition-colors duration-300 sm:p-3 lg:p-4",
          tone.card,
        )}
      >
        {mood === "celebrate" ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 animate-pulse bg-accent/10" />
        ) : null}

        <div className="relative flex items-center gap-3 lg:flex-col lg:gap-2">
          <motion.div
            animate={
              reduce
                ? undefined
                : mood === "celebrate"
                  ? { rotate: [-3, 3, -3], scale: [1, 1.06, 1] }
                  : { y: [0, -4, 0] }
            }
            transition={mood === "celebrate" ? { duration: 0.9, repeat: Infinity } : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            className="relative shrink-0 pt-5"
          >
            <AnimatedMascot mascot={mascot.id} pose={mascot.poses[mood]} className="size-16 sm:size-24 lg:size-44" />
            {streak > 0 ? (
              <motion.span
                key={streak}
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-1 top-0 inline-flex items-center gap-0.5 rounded-full border-2 border-card bg-accent-600 px-1.5 py-0.5 text-[11px] font-extrabold leading-none text-white shadow-soft"
                aria-label={`Streak ${streak} jawaban benar berturut-turut`}
              >
                <Flame aria-hidden="true" className="size-3 fill-current" />
                {streak}
              </motion.span>
            ) : null}
          </motion.div>

          <div className="min-w-0 flex-1 lg:w-full">
            <div
              role="status"
              aria-live="polite"
              className={cn("relative rounded-2xl px-3 py-2 text-left transition-colors duration-300", tone.bubble)}
            >
              <p className="text-sm font-bold leading-snug">{message}</p>
            </div>
            <p className={cn("mt-2 hidden text-center text-[11px] font-extrabold uppercase tracking-wide lg:block", tone.label)}>
              {mascot.name} · {mascot.region}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
