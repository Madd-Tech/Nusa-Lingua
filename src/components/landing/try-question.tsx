"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Satu soal statis yang bisa dicoba tanpa login (tidak menyimpan apa pun). */
const QUESTION = {
  language: "Bahasa Jawa",
  prompt: 'Apa arti "Matur nuwun" dalam bahasa Indonesia?',
  options: ["Sampai jumpa", "Terima kasih", "Permisi", "Selamat datang"],
  answer: "Terima kasih",
  note: '"Matur nuwun" adalah ungkapan terima kasih yang sopan dalam bahasa Jawa.',
};

export function TryQuestion({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === QUESTION.answer;

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-b-[6px] bg-white p-6 shadow-lg dark:bg-card sm:p-8">
        <div className="space-y-5">
          {/* Header with mascot */}
          <div className="flex items-center gap-4">
            <Image
              src="/media/maskot/gerakan-berpikir.png"
              alt="Maskot berpikir"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                {QUESTION.language}
              </p>
              <p className="text-sm text-muted-foreground">Pilih jawaban yang benar</p>
            </div>
          </div>

          {/* Question */}
          <h3 id="coba-soal" className="text-2xl sm:text-3xl">
            {QUESTION.prompt}
          </h3>

          {/* Options */}
          <div role="radiogroup" aria-labelledby="coba-soal" className="grid gap-3 sm:grid-cols-2">
            {QUESTION.options.map((o, i) => {
              const isPicked = picked === o;
              const isAnswer = checked && o === QUESTION.answer;
              const isWrong = checked && isPicked && !correct;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={isPicked}
                  disabled={checked}
                  onClick={() => setPicked(o)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-2xl border-2 border-b-4 bg-white px-4 py-3 text-left font-bold transition-all dark:bg-card",
                    !checked && "hover:bg-primary/5 hover:border-primary/30",
                    isPicked && !checked && "border-primary bg-primary/10",
                    isAnswer && "border-success bg-success/12",
                    isWrong && "animate-shake border-danger bg-danger/10",
                    checked && !isAnswer && !isWrong && "opacity-60",
                  )}
                >
                  <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg border-2 text-sm text-muted-foreground">
                    {i + 1}
                  </span>
                  <span className="flex-1">{o}</span>
                  {isAnswer ? (
                    <>
                      <Check aria-hidden="true" className="size-5 text-success-700 dark:text-success" />
                      <span className="sr-only">(jawaban benar)</span>
                    </>
                  ) : null}
                  {isWrong ? (
                    <>
                      <X aria-hidden="true" className="size-5 text-danger-700 dark:text-danger" />
                      <span className="sr-only">(pilihanmu, salah)</span>
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          <div aria-live="polite">
            {checked ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-3 rounded-2xl p-4", correct ? "bg-success/12" : "bg-danger/10")}
              >
                {correct ? (
                  <CheckCircle2 aria-hidden="true" className="size-8 shrink-0 fill-success text-white" />
                ) : (
                  <XCircle aria-hidden="true" className="size-8 shrink-0 fill-danger text-white" />
                )}
                <div className="space-y-1">
                  <p className={cn("text-lg font-extrabold", correct ? "text-success-700 dark:text-success" : "text-danger-700 dark:text-danger")}>
                    {correct ? "Benar! 🎉" : `Kurang tepat. Jawaban benar: ${QUESTION.answer}`}
                  </p>
                  <p className="text-sm">{QUESTION.note}</p>
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {checked ? (
              <>
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setPicked(null);
                    setChecked(false);
                  }}
                >
                  <RotateCcw aria-hidden="true" /> Coba lagi
                </Button>
                <Button asChild className="landing-btn-primary">
                  <Link href={isLoggedIn ? "/belajar" : "/daftar"}>
                    {isLoggedIn ? "Lanjut belajar" : "Daftar gratis"} <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button onClick={() => setChecked(true)} disabled={!picked} size="lg" className="landing-btn-primary">
                Periksa
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
