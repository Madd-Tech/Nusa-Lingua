"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PRAISE = ["Benar! Mantap.", "Hebat!", "Tepat sekali!", "Luar biasa!", "Keren!"];

/**
 * Panel bawah. Mode periksa: tombol "Periksa".
 * Mode umpan balik: ikon + teks (bukan hanya warna) + jawaban benar bila salah.
 */
export function FeedbackBar({
  verdict,
  correctText,
  canCheck,
  onCheck,
  onContinue,
}: {
  verdict: boolean | null;
  correctText: string | null;
  canCheck: boolean;
  onCheck: () => void;
  onContinue: () => void;
}) {
  const showing = verdict !== null;
  const praise = PRAISE[Math.floor((correctText?.length ?? 0) % PRAISE.length)];

  return (
    <motion.div
      key={showing ? "feedback" : "check"}
      initial={showing ? { y: 48, opacity: 0.6 } : false}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className={cn(
        "pb-safe rounded-t-3xl border-t-2 transition-colors sm:rounded-none",
        verdict === true && "border-success/40 bg-success/12",
        verdict === false && "border-danger/40 bg-danger/10",
        !showing && "bg-background",
      )}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:py-6">
        <div aria-live="assertive" className="min-h-0 flex-1">
          {showing ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
              {verdict ? (
                <CheckCircle2 aria-hidden="true" className="size-9 shrink-0 fill-success text-white" />
              ) : (
                <XCircle aria-hidden="true" className="size-9 shrink-0 fill-danger text-white" />
              )}
              <div>
                <p className={cn("text-xl font-extrabold", verdict ? "text-success-700 dark:text-success" : "text-danger-700 dark:text-danger")}>
                  {verdict ? praise : "Kurang tepat"}
                </p>
                {!verdict && correctText ? (
                  <p className="text-sm">
                    <span className="font-semibold">Jawaban benar:</span> <span className="font-extrabold">{correctText}</span>
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}
        </div>
        {showing ? (
          <Button size="lg" variant={verdict ? "default" : "destructive"} className="sm:min-w-44" onClick={onContinue} autoFocus>
            Lanjut
          </Button>
        ) : (
          <Button size="lg" className="sm:min-w-44" disabled={!canCheck} onClick={onCheck}>
            Periksa
          </Button>
        )}
      </div>
    </motion.div>
  );
}
