"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, CheckCircle2, RotateCcw, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { cn } from "@/lib/utils";

/** Satu soal statis yang bisa dicoba tanpa login (tidak menyimpan apa pun). */
const QUESTION = {
  language: "Bahasa Jawa",
  prompt: "Apa arti “Matur nuwun”?",
  options: ["Sampai jumpa", "Terima kasih", "Permisi", "Selamat datang"],
  answer: "Terima kasih",
  note: "“Matur nuwun” adalah ungkapan terima kasih yang sopan dalam bahasa Jawa.",
};

export function TryQuestion({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = picked === QUESTION.answer;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-center">
      <div className="relative overflow-hidden rounded-3xl border-2 border-b-[6px] bg-card p-5 sm:p-7">
        <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.04} />
        <div className="relative space-y-5">
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary-700 dark:text-primary">
            {QUESTION.language} · Pilih jawaban yang benar
          </p>
          <h3 id="coba-soal" className="text-2xl sm:text-3xl">
            {QUESTION.prompt}
          </h3>
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
                    "flex min-h-14 items-center gap-3 rounded-2xl border-2 border-b-4 bg-card px-4 py-3 text-left font-bold transition-colors",
                    !checked && "hover:bg-muted",
                    isPicked && !checked && "border-primary bg-primary/10",
                    isAnswer && "border-success bg-success/12",
                    isWrong && "animate-shake border-danger bg-danger/10",
                    checked && !isAnswer && !isWrong && "opacity-60",
                  )}
                >
                  <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-lg border-2 text-xs text-muted-foreground">
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
                    {correct ? "Benar!" : `Kurang tepat. Jawaban benar: ${QUESTION.answer}`}
                  </p>
                  <p className="text-sm">{QUESTION.note}</p>
                </div>
              </motion.div>
            ) : null}
          </div>

          <div className="flex gap-2">
            {checked ? (
              <Button
                variant="outline"
                onClick={() => {
                  setPicked(null);
                  setChecked(false);
                }}
              >
                <RotateCcw aria-hidden="true" /> Coba lagi
              </Button>
            ) : (
              <Button onClick={() => setChecked(true)} disabled={!picked} size="lg">
                Periksa
              </Button>
            )}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border-2 border-dashed p-6 transition-colors",
          checked && "border-solid border-primary bg-primary/8",
        )}
      >
        <h3 className="text-2xl">Lanjutkan 1 pelajaran penuh?</h3>
        <p className="mt-2 text-muted-foreground">
          Satu lesson berisi 6 tipe soal — pilihan ganda, terjemahan, menyimak, pasangkan kata, susun kalimat, dan bicara. Progresmu
          tersimpan, XP terkumpul, streak terjaga.
        </p>
        <Button asChild size="lg" className="mt-5">
          <Link href={isLoggedIn ? "/belajar" : "/daftar"}>
            {isLoggedIn ? "Lanjut belajar" : "Daftar gratis"} <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
