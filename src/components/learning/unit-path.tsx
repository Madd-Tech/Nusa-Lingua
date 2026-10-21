"use client";

import Link from "next/link";
import { Check, Lock, Play, RotateCcw, Star, Target, Zap } from "lucide-react";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Stars } from "@/components/gamification/stars";
import { useLearningMascot } from "@/hooks/use-learning-mascot";
import { UNIT_LEVEL_LABEL } from "@/lib/constants";
import type { LearningMascotProfile } from "@/lib/learning-mascots";
import type { LessonState, PathLesson, PathUnit } from "@/lib/path";
import { cn } from "@/lib/utils";

const OFFSETS = [0, 44, 72, 44, 0, -44, -72, -44];

const UNIT_COLORS = [
  { bg: "bg-primary-600", border: "border-primary-700" },
  { bg: "bg-budaya-solid", border: "border-budaya-deep" },
  { bg: "bg-asisten-solid", border: "border-asisten-deep" },
  { bg: "bg-accent-600", border: "border-accent-700" },
];

export function UnitPath({ units, code }: { units: PathUnit[]; code: string }) {
  const { mascot } = useLearningMascot(code);
  let globalIndex = 0;
  return (
    <ol className="space-y-10">
      {units.map((unit, ui) => {
        const color = UNIT_COLORS[ui % UNIT_COLORS.length];
        const done = unit.lessons.filter((l) => l.state === "completed").length;
        return (
          <li key={unit.id} aria-labelledby={`unit-${unit.id}`}>
            <header className={cn("relative mb-8 overflow-hidden rounded-3xl border-b-[6px] p-5 text-white", color.bg, color.border)}>
              <BatikPattern variant={ui % 2 ? "parang" : "kawung"} color="#ffffff" opacity={0.12} />
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold opacity-90">Unit {ui + 1}</p>
                  <h2 id={`unit-${unit.id}`} className="text-2xl">
                    {unit.title}
                  </h2>
                  {unit.description ? <p className="mt-1 max-w-prose text-sm opacity-90">{unit.description}</p> : null}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className="bg-white/20 text-white">{UNIT_LEVEL_LABEL[unit.level]}</Badge>
                  <span className="text-sm font-bold">
                    {done}/{unit.lessons.length} lesson
                  </span>
                </div>
              </div>
            </header>

            {unit.lessons.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">Lesson untuk unit ini sedang disiapkan.</p>
            ) : (
              <ol className="flex flex-col items-center gap-6">
                {unit.lessons.map((lesson) => {
                  const offset = OFFSETS[globalIndex++ % OFFSETS.length];
                  return (
                    <li key={lesson.id} style={{ transform: `translateX(${offset}px)` }} className="flex flex-col items-center">
                      <LessonNode lesson={lesson} mascot={mascot} href={`/belajar/${code}/lesson/${lesson.id}`} />
                    </li>
                  );
                })}
              </ol>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const STATE_LABEL: Record<LessonState, string> = {
  completed: "selesai",
  current: "lesson berikutnya",
  locked: "terkunci",
};

function LessonNode({ lesson, mascot, href }: { lesson: PathLesson; mascot: LearningMascotProfile; href: string }) {
  const label = `${lesson.title}, ${STATE_LABEL[lesson.state]}${lesson.state === "completed" ? `, ${lesson.stars} bintang` : ""}`;
  const styles: Record<LessonState, string> = {
    completed: "bg-secondary-600 border-secondary-700 text-ink hover:brightness-105",
    current: "bg-primary-600 border-primary-700 text-white hover:brightness-110 animate-pulse-ring",
    locked: "bg-muted border-border text-muted-foreground",
  };
  const icon =
    lesson.state === "completed" ? (
      <Check aria-hidden="true" strokeWidth={3} />
    ) : lesson.state === "locked" ? (
      <Lock aria-hidden="true" />
    ) : (
      <Star aria-hidden="true" className="fill-current" />
    );

  return (
    <>
      {lesson.state === "current" ? (
        <div className="mb-1 flex -translate-x-[2.125rem] items-end gap-1">
          <AnimatedMascot mascot={mascot.id} pose={mascot.poses.idle} className="size-16 shrink-0" />
          <span
            aria-hidden="true"
            className="relative mb-4 animate-bounce rounded-xl border-2 bg-card px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-primary-700 shadow-soft after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-border dark:text-primary"
          >
            {mascot.name} menanti!
          </span>
        </div>
      ) : null}
      <Popover>
        <PopoverTrigger
          aria-label={label}
          className={cn(
            "relative flex size-[72px] items-center justify-center rounded-full border-b-[6px] bg-clip-padding transition-[filter] [&_svg]:size-8",
            "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/50",
            styles[lesson.state],
          )}
        >
          {icon}
        </PopoverTrigger>
        <PopoverContent side="bottom" className="w-64">
          <div className="space-y-3">
            <div>
              <p className="text-lg font-extrabold leading-tight">{lesson.title}</p>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{STATE_LABEL[lesson.state]}</p>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl bg-muted p-2">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap aria-hidden="true" className="size-3.5" /> Hadiah
                </dt>
                <dd className="font-extrabold">{lesson.xp_reward} XP</dd>
              </div>
              <div className="rounded-xl bg-muted p-2">
                <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Target aria-hidden="true" className="size-3.5" /> Skor terbaik
                </dt>
                <dd className="font-extrabold">{lesson.state === "completed" ? `${lesson.bestScore}%` : "—"}</dd>
              </div>
            </dl>
            {lesson.state === "completed" ? <Stars value={lesson.stars} size="size-5" /> : null}
            {lesson.state === "locked" ? (
              <p className="flex items-center gap-2 rounded-xl border-2 border-dashed p-2 text-sm text-muted-foreground">
                <Lock aria-hidden="true" className="size-4 shrink-0" /> Selesaikan lesson sebelumnya untuk membuka.
              </p>
            ) : (
              <Button asChild block variant={lesson.state === "completed" ? "secondary" : "default"}>
                <Link href={href}>
                  {lesson.state === "completed" ? (
                    <>
                      <RotateCcw aria-hidden="true" /> Ulangi
                    </>
                  ) : (
                    <>
                      <Play aria-hidden="true" className="fill-current" /> Mulai
                    </>
                  )}
                </Link>
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
      <span className="mt-2 max-w-[9rem] text-center text-sm font-bold leading-tight" aria-hidden="true">
        {lesson.title}
      </span>
      {lesson.state === "completed" ? <Stars value={lesson.stars} className="mt-1" /> : null}
    </>
  );
}
