"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, HeartCrack, RotateCcw, Volume2, VolumeX, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuestionView } from "@/components/learning/questions/question-view";
import {
  correctAnswerText,
  gradeAnswer,
  isAnswerReady,
  parseCompleteLesson,
  type AnswerValue,
  type CompleteLessonResult,
} from "@/components/learning/questions/types";
import { useSoundEffects } from "@/hooks/use-sound-effects";
import { useLearningMascot } from "@/hooks/use-learning-mascot";
import { createClient } from "@/lib/supabase/client";
import { nextMastery, type MasteryState } from "@/lib/srs";
import type { LessonQuestion } from "@/lib/questions";
import { pickLine } from "@/lib/learning-mascots";
import { celebrationFor, type CelebrationTier } from "@/lib/streak-celebration";
import { FeedbackBar } from "./feedback-bar";
import { FieryProgress } from "./fiery-progress";
import { LearningMascot, type MascotMood } from "./learning-mascot";
import { StreakCelebration } from "./streak-celebration";
import { LessonResult } from "./lesson-result";

type QueueItem = { q: LessonQuestion; retry: boolean; key: string };
type Phase = "playing" | "submitting" | "submit-error" | "result" | "out-of-hearts";

const toQueue = (qs: LessonQuestion[]): QueueItem[] => qs.map((q) => ({ q, retry: false, key: `${q.id}` }));

const THINKING_MESSAGES = [
  "Sudah yakin? Tekan Periksa kalau sudah.",
  "Pilih dengan tenang, aku temani.",
  "Kalau sudah mantap, periksa jawabannya, ya!",
];

/** Bandingkan dua jawaban agar efek suara pilih hanya berbunyi saat pilihan benar-benar berubah. */
function isSameAnswer(a: AnswerValue | null, b: AnswerValue | null) {
  if (a === b) return true;
  if (!a || !b || a.kind !== b.kind) return false;
  switch (a.kind) {
    case "choice":
      return a.value === (b as { value: string }).value;
    case "text":
      return a.value === (b as { value: string }).value;
    case "speak":
      return a.transcript === (b as { transcript: string }).transcript;
    case "arrange":
      return a.tokens.join(" ") === (b as { tokens: string[] }).tokens.join(" ");
    case "match":
      return a.complete === (b as { complete: boolean }).complete && a.mistakes === (b as { mistakes: number }).mistakes;
  }
}

export function LessonPlayer({
  userId,
  lessonId,
  languageId,
  languageCode,
  lessonTitle,
  questions,
  initialHearts,
  mastery,
}: {
  userId: string;
  lessonId: number;
  languageId: number;
  languageCode: string;
  lessonTitle: string;
  questions: LessonQuestion[];
  initialHearts: number;
  mastery: Record<number, MasteryState>;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const sfx = useSoundEffects();
  const maxHearts = Math.max(1, initialHearts);
  const { mascot } = useLearningMascot(languageCode);

  const [queue, setQueue] = useState<QueueItem[]>(() => toQueue(questions));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [firstTry, setFirstTry] = useState<Map<number, boolean>>(new Map());
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [hearts, setHearts] = useState(maxHearts);
  const [phase, setPhase] = useState<Phase>("playing");
  const [result, setResult] = useState<CompleteLessonResult | null>(null);
  const [exitOpen, setExitOpen] = useState(false);

  // Maskot pendamping: streak jawaban benar berturut-turut + reaksi.
  const [streak, setStreak] = useState(0);
  const [mascotMood, setMascotMood] = useState<MascotMood>("idle");
  const [mascotMessage, setMascotMessage] = useState(() => mascot.greeting);
  const [celebration, setCelebration] = useState<{ count: number; tier: CelebrationTier } | null>(null);

  // Efek suara pilih: simpan jawaban sebelumnya + waktu bunyi terakhir (anti-spam).
  const previousAnswerRef = useRef<AnswerValue | null>(null);
  const lastSelectRef = useRef(0);

  // Soal berganti → pilihan sebelumnya tidak relevan lagi.
  useEffect(() => {
    previousAnswerRef.current = null;
  }, [index]);

  // Ikuti maskot pilihan pengguna (disimpan di localStorage oleh halaman jalur).
  useEffect(() => {
    setMascotMood("idle");
    setMascotMessage(mascot.greeting);
  }, [mascot]);

  // Status penguasaan kosakata terbaru (berantai dalam satu lesson).
  const masteryRef = useRef<Record<number, MasteryState>>({ ...mastery });
  const masteryErrorShown = useRef(false);

  const current = queue[index];
  const graded = questions.filter((q) => !skipped.has(q.id));
  const correctFirst = graded.filter((q) => firstTry.get(q.id) === true).length;
  const score = graded.length ? Math.round((correctFirst / graded.length) * 100) : 100;
  const progressValue = index + (verdict !== null ? 1 : 0);

  // Pastikan bahasa tercatat di user_languages (agar XP per bahasa tersimpan oleh backend).
  useEffect(() => {
    void supabase
      .from("user_languages")
      .upsert({ user_id: userId, language_id: languageId }, { onConflict: "user_id,language_id", ignoreDuplicates: true });
  }, [supabase, userId, languageId]);

  /** Upsert user_vocab_mastery setiap kali soal berkosakata dijawab. */
  const recordMastery = useCallback(
    async (vocabularyId: number, ok: boolean) => {
      const next = nextMastery(masteryRef.current[vocabularyId], ok);
      masteryRef.current[vocabularyId] = next;
      const { error } = await supabase
        .from("user_vocab_mastery")
        .upsert({ user_id: userId, vocabulary_id: vocabularyId, ...next }, { onConflict: "user_id,vocabulary_id" });
      if (error && !masteryErrorShown.current) {
        masteryErrorShown.current = true;
        toast.error("Progres kosakata belum tersimpan. Lesson tetap bisa dilanjutkan.");
      }
    },
    [supabase, userId],
  );

  const reset = () => {
    setQueue(toQueue(questions));
    setIndex(0);
    setAnswer(null);
    setVerdict(null);
    setFirstTry(new Map());
    setSkipped(new Set());
    setHearts(maxHearts);
    setResult(null);
    setPhase("playing");
    setStreak(0);
    setCelebration(null);
    setMascotMood("idle");
    setMascotMessage(mascot.greeting);
  };

  const submit = useCallback(
    async (finalScore: number) => {
      setPhase("submitting");
      const { data, error } = await supabase.rpc("complete_lesson", { p_lesson_id: lessonId, p_score: finalScore });
      if (error) {
        setPhase("submit-error");
        return;
      }
      const parsed = parseCompleteLesson(data);
      setResult(parsed);
      setPhase("result");
      sfx.finish();
      router.refresh();

      // Kirim email notifikasi achievement baru (fire-and-forget)
      const before = Date.now();
      supabase.auth.getUser().then(({ data: { user: u } }) => {
        if (!u) return;
        supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", u.id)
          .gte("earned_at", new Date(before - 10_000).toISOString())
          .then(({ data: fresh }) => {
            fresh?.forEach((a) =>
              fetch("/api/emails/achievement", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ achievementId: a.achievement_id }),
              }).catch(() => {}),
            );
          });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lessonId, router, supabase, sfx.enabled],
  );

  const check = useCallback(() => {
    if (!current || !answer || !isAnswerReady(answer) || verdict !== null) return;
    const ok = gradeAnswer(current.q, answer);
    setVerdict(ok);

    const nextStreak = ok ? streak + 1 : 0;
    setStreak(nextStreak);

    const tier = celebrationFor(nextStreak);
    if (ok && nextStreak >= 3) {
      setMascotMood("celebrate");
      setMascotMessage(
        nextStreak === 3
          ? pickLine(mascot.lines.streak, index)
          : nextStreak === 10
            ? `Super duper gokil! ${nextStreak} jawaban benar berturut-turut. ${mascot.name} bangga!`
            : `${nextStreak} jawaban benar berturut-turut. ${mascot.name} bangga!`,
      );
    } else {
      setMascotMood(ok ? "correct" : "wrong");
      setMascotMessage(pickLine(ok ? mascot.lines.correct : mascot.lines.wrong, index + 1));
    }

    if (tier) {
      setCelebration({ count: nextStreak, tier });
      if (tier === "mega") sfx.streakMega();
      else sfx.streak();
    } else if (ok) {
      sfx.correct();
    } else {
      sfx.wrong();
    }

    if (!current.retry && !firstTry.has(current.q.id)) {
      setFirstTry((m) => new Map(m).set(current.q.id, ok));
    }
    if (current.q.vocabulary_id) void recordMastery(current.q.vocabulary_id, ok);
    if (!ok) {
      setHearts((h) => h - 1);
      // Soal salah dimasukkan ulang di akhir antrean (sekali).
      if (!current.retry) setQueue((qs) => [...qs, { q: current.q, retry: true, key: `${current.q.id}-r` }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer, current, firstTry, index, mascot, recordMastery, streak, verdict, sfx.enabled]);

  const advance = useCallback(
    (opts?: { skip?: boolean }) => {
      let nextSkipped = skipped;
      if (opts?.skip && current) {
        nextSkipped = new Set(skipped).add(current.q.id);
        setSkipped(nextSkipped);
        setStreak(0);
      }
      setCelebration(null);
      setMascotMood("idle");
      setMascotMessage(pickLine(mascot.lines.idle, index));
      if (hearts <= 0) {
        setPhase("out-of-hearts");
        return;
      }
      setAnswer(null);
      setVerdict(null);
      if (index + 1 >= queue.length) {
        const g = questions.filter((q) => !nextSkipped.has(q.id));
        const c = g.filter((q) => firstTry.get(q.id) === true).length;
        void submit(g.length ? Math.round((c / g.length) * 100) : 100);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [current, firstTry, hearts, index, mascot, queue.length, questions, skipped, submit],
  );

  // Enter = Periksa / Lanjut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || phase !== "playing" || exitOpen || celebration !== null) return;
      if (e.target instanceof HTMLButtonElement) return; // tombol yang sedang fokus menangani sendiri
      e.preventDefault();
      if (verdict === null) check();
      else advance();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, celebration, check, exitOpen, phase, verdict]);

  const closeCelebration = useCallback(() => setCelebration(null), []);

  /** Saat pengguna mulai memilih/mengetik, maskot ikut "berpikir". */
  const handleAnswer = useCallback(
    (value: AnswerValue | null) => {
      // Bunyikan ketukan pilih hanya saat pilihan berubah (mengetik teks tidak dibunyikan).
      const isPick = value !== null && value.kind !== "text" && value.kind !== "speak";
      if (isPick && !isSameAnswer(value, previousAnswerRef.current)) {
        const now = performance.now();
        if (now - lastSelectRef.current > 40) {
          sfx.select();
          lastSelectRef.current = now;
        }
      }
      previousAnswerRef.current = value;

      setAnswer(value);
      if (verdict !== null) return;
      if (value && isAnswerReady(value)) {
        setMascotMood("thinking");
        setMascotMessage(pickLine(THINKING_MESSAGES, index));
      } else {
        setMascotMood("idle");
        setMascotMessage(pickLine(mascot.lines.idle, index));
      }
    },
    [index, mascot, sfx, verdict],
  );

  const backToPath = () => router.push(`/belajar/${languageCode}`);

  if (questions.length === 0) {
    return (
      <FocusFrame onExit={backToPath}>
        <div className="mx-auto max-w-md py-16">
          <ErrorState
            title="Lesson ini belum punya soal"
            description="Materi sedang disiapkan oleh tim kami. Coba lesson lain dulu, ya."
            onRetry={() => router.refresh()}
          />
        </div>
      </FocusFrame>
    );
  }

  if (phase === "result" && result) {
    return <LessonResult mascot={mascot} result={result} score={score} onContinue={backToPath} onRetry={reset} />;
  }

  if (phase === "out-of-hearts") {
    return (
      <FocusFrame onExit={backToPath}>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
          <span className="flex size-24 items-center justify-center rounded-full bg-danger/10">
            <HeartCrack aria-hidden="true" className="size-12 text-danger" />
          </span>
          <h1 className="text-3xl">Nyawa habis</h1>
          <p className="text-muted-foreground">Tidak apa-apa, salah itu bagian dari belajar. Ulangi kosakatanya dulu, lalu coba lagi.</p>
          <div className="mt-2 flex w-full flex-col gap-3">
            <Button size="lg" block onClick={() => router.push("/ulasan")}>
              Latihan ulasan kosakata
            </Button>
            <Button size="lg" block variant="outline" onClick={reset}>
              <RotateCcw aria-hidden="true" /> Ulangi lesson
            </Button>
            <Button size="lg" block variant="ghost" onClick={backToPath}>
              Kembali ke jalur
            </Button>
          </div>
        </div>
      </FocusFrame>
    );
  }

  if (phase === "submitting" || phase === "submit-error") {
    return (
      <FocusFrame onExit={backToPath}>
        <div className="mx-auto max-w-md py-16">
          {phase === "submitting" ? (
            <div role="status" className="flex flex-col items-center gap-4 text-center">
              <span className="size-16 animate-spin rounded-full border-[6px] border-muted border-t-primary" aria-hidden="true" />
              <p className="font-bold">Menyimpan hasil lesson…</p>
            </div>
          ) : (
            <ErrorState
              title="Hasil lesson belum tersimpan"
              description="Koneksi terputus saat menyimpan. Jawabanmu masih ada — tekan Coba lagi."
              onRetry={() => submit(score)}
            />
          )}
        </div>
      </FocusFrame>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 pt-4 sm:gap-4 sm:pt-6">
        <Button variant="ghost" size="icon" onClick={() => setExitOpen(true)} aria-label="Keluar dari lesson">
          <X />
        </Button>
        <FieryProgress
          value={progressValue}
          max={queue.length}
          streak={streak}
          aria-label={`Progres lesson: soal ${Math.min(index + 1, queue.length)} dari ${queue.length}`}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => sfx.setEnabled(!sfx.enabled)}
          aria-label={sfx.enabled ? "Matikan efek suara" : "Nyalakan efek suara"}
          aria-pressed={sfx.enabled}
        >
          {sfx.enabled ? <Volume2 /> : <VolumeX />}
        </Button>
        <span className="inline-flex items-center gap-1 font-extrabold" aria-label={`${hearts} nyawa tersisa`}>
          <Heart aria-hidden="true" className={hearts > 0 ? "size-6 fill-danger text-danger" : "size-6 text-muted-foreground"} />
          {hearts}
        </span>
      </header>

      <main id="konten" aria-labelledby="soal" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <p className="sr-only">Lesson: {lessonTitle}</p>
        <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          {/* Maskot selalu terlihat: lengket di atas (mobile) / di samping soal (desktop). */}
          <div className="sticky top-0 z-20 -mx-4 bg-background/95 px-4 py-2 backdrop-blur-sm sm:-mx-4 lg:top-6 lg:z-auto lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <LearningMascot mascot={mascot} mood={mascotMood} message={mascotMessage} streak={streak} />
          </div>

          <div className="min-w-0">
            {current?.retry ? (
              <p className="mb-4 inline-flex rounded-xl bg-accent/12 px-3 py-1 text-sm font-bold text-accent-700 dark:text-accent">
                Ulangi soal yang tadi keliru
              </p>
            ) : null}
            <AnimatePresence mode="wait">
              <motion.div
                key={current?.key}
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -32 }}
                transition={{ duration: 0.2 }}
              >
                {current ? (
                  <QuestionView
                    question={current.q}
                    answer={answer}
                    onAnswer={handleAnswer}
                    locked={verdict !== null}
                    verdict={verdict}
                    onSkip={() => advance({ skip: true })}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <div className="sticky bottom-0">
        <FeedbackBar
          verdict={verdict}
          correctText={current ? correctAnswerText(current.q) : null}
          canCheck={isAnswerReady(answer)}
          onCheck={check}
          onContinue={() => advance()}
        />
      </div>

      <StreakCelebration
        mascot={mascot}
        count={celebration?.count ?? 0}
        tier={celebration?.tier ?? null}
        onClose={closeCelebration}
      />

      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Keluar dari lesson?</DialogTitle>
            <DialogDescription>Progres lesson ini belum disimpan dan akan hilang jika kamu keluar sekarang.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={backToPath}>
              Keluar
            </Button>
            <Button onClick={() => setExitOpen(false)} autoFocus>
              Lanjut belajar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FocusFrame({ children, onExit }: { children: React.ReactNode; onExit: () => void }) {
  return (
    <div className="min-h-dvh px-4">
      <header className="mx-auto flex max-w-3xl pt-4">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="Kembali ke jalur belajar">
          <X />
        </Button>
      </header>
      <main id="konten">{children}</main>
    </div>
  );
}
