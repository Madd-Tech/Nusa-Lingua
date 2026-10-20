"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import type { LearningMascotProfile } from "@/lib/learning-mascots";

const AUTO_DISMISS_MS = 2800;

/**
 * Selebrasi combo ala Duolingo: muncul saat pengguna menjawab benar
 * 3 kali berturut-turut (dan setiap kelipatan 3 berikutnya).
 * Efeknya getar/guncang kartu + haptic perangkat — tanpa konfeti.
 */
export function StreakCelebration({
  mascot,
  count,
  onClose,
}: {
  mascot: LearningMascotProfile;
  count: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (count <= 0) return;
    const timer = window.setTimeout(onClose, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [count, onClose]);

  // Getar perangkat (haptic) — hanya berjalan di perangkat yang mendukung.
  useEffect(() => {
    if (count <= 0) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    try {
      navigator.vibrate([40, 40, 80, 40, 140]);
    } catch {
      /* abaikan bila perangkat menolak */
    }
  }, [count]);

  useEffect(() => {
    if (count <= 0) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, onClose]);

  return (
    <AnimatePresence>
      {count > 0 ? (
        <motion.div
          key={count}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/55 px-4 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Denyut gelombang sebagai pengganti konfeti */}
          {reduce ? null : (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
              {[0, 0.18].map((delay) => (
                <motion.span
                  key={delay}
                  initial={{ scale: 0.45, opacity: 0.5 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 1.1, delay, ease: "easeOut" }}
                  className="absolute size-64 rounded-full border-4 border-accent/50 sm:size-80"
                />
              ))}
            </div>
          )}
          <motion.div
            role="status"
            aria-live="assertive"
            initial={reduce ? false : { scale: 0.7, y: 40, opacity: 0 }}
            animate={
              reduce
                ? { scale: 1, y: 0, opacity: 1 }
                : {
                    scale: 1,
                    y: 0,
                    opacity: 1,
                    x: [0, -12, 12, -9, 9, -5, 5, 0],
                    rotate: [0, -1.4, 1.4, -1, 1, -0.5, 0],
                  }
            }
            exit={reduce ? undefined : { scale: 0.9, opacity: 0 }}
            transition={
              reduce
                ? undefined
                : {
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    x: { duration: 0.6, ease: "easeInOut" },
                    rotate: { duration: 0.6, ease: "easeInOut" },
                  }
            }
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border-2 border-b-[6px] border-accent-700 bg-card p-5 text-center shadow-lift sm:p-6"
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-accent/12 to-transparent" />

            <div className="relative mx-auto -mt-2">
              <motion.div
                animate={reduce ? undefined : { scale: [1, 1.07, 1], rotate: [-3, 3, -3] }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut" }}
                className="mx-auto w-fit"
              >
                <AnimatedMascot mascot={mascot.id} pose={mascot.poses.celebrate} size={200} />
              </motion.div>
            </div>

            <div className="relative space-y-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-600 px-3 py-1 text-sm font-extrabold uppercase tracking-wide text-white">
                <Flame aria-hidden="true" className="size-4 fill-current" />
                Combo {count}
              </span>
              <h2 className="text-3xl">Luar biasa!</h2>
              <p className="text-sm font-semibold text-muted-foreground">
                {count} jawaban benar berturut-turut. {mascot.name} ikut bangga!
              </p>
            </div>

            <motion.span
              aria-hidden="true"
              initial={{ width: "100%" }}
              animate={{ width: 0 }}
              transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
              className="absolute bottom-0 left-0 h-1.5 bg-accent"
            />
            <span className="sr-only">Selebrasi akan tertutup otomatis. Tekan Escape untuk menutup.</span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
