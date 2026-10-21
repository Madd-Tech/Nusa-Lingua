"use client";

import { useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame } from "lucide-react";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import type { LearningMascotProfile } from "@/lib/learning-mascots";
import type { CelebrationTier } from "@/lib/streak-celebration";
import { cn } from "@/lib/utils";
import { FlameBurst } from "./flame-burst";

const DURATION: Record<CelebrationTier, number> = { fire: 2800, mega: 3800 };
const VIBRATION: Record<CelebrationTier, number[]> = {
  fire: [40, 40, 80, 40, 140],
  mega: [60, 40, 60, 40, 120, 60, 240],
};

const EMBERS = [
  { left: 12, top: 64, delay: 0, drift: 5, size: 5 },
  { left: 22, top: 58, delay: 0.3, drift: -7, size: 4 },
  { left: 33, top: 68, delay: 0.12, drift: 6, size: 6 },
  { left: 44, top: 55, delay: 0.45, drift: -5, size: 4 },
  { left: 55, top: 66, delay: 0.2, drift: 8, size: 5 },
  { left: 66, top: 57, delay: 0.55, drift: -8, size: 6 },
  { left: 76, top: 69, delay: 0.08, drift: 5, size: 4 },
  { left: 87, top: 60, delay: 0.38, drift: -6, size: 5 },
  { left: 17, top: 73, delay: 0.62, drift: 4, size: 3 },
  { left: 29, top: 50, delay: 0.25, drift: -4, size: 3 },
  { left: 48, top: 74, delay: 0.7, drift: 7, size: 3 },
  { left: 61, top: 48, delay: 0.15, drift: -7, size: 3 },
  { left: 72, top: 75, delay: 0.5, drift: 4, size: 3 },
  { left: 82, top: 52, delay: 0.32, drift: -5, size: 4 },
  { left: 38, top: 47, delay: 0.8, drift: 5, size: 3 },
  { left: 91, top: 72, delay: 0.18, drift: -4, size: 3 },
];

/**
 * Selebrasi streak bergaya api.
 *
 * - Tier `fire` (tepat streak 3): api + maskot di tengah layar.
 * - Tier `mega` (tepat streak 10): api raksasa, layar bergetar,
 *   sinar radial, dan ember beterbangan.
 */
export function StreakCelebration({
  mascot,
  count,
  tier,
  onClose,
}: {
  mascot: LearningMascotProfile;
  count: number;
  tier: CelebrationTier | null;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const mega = tier === "mega";

  useEffect(() => {
    if (!tier) return;
    const timer = window.setTimeout(onClose, DURATION[tier]);
    return () => window.clearTimeout(timer);
  }, [count, onClose, tier]);

  // Getar perangkat (haptic) — hanya berjalan di perangkat yang mendukung.
  useEffect(() => {
    if (!tier) return;
    if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
    try {
      navigator.vibrate(VIBRATION[tier]);
    } catch {
      /* abaikan bila perangkat menolak */
    }
  }, [count, tier]);

  useEffect(() => {
    if (!tier) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, tier]);

  return (
    <AnimatePresence>
      {tier ? (
        <motion.div
          key={`${tier}-${count}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            "fixed inset-0 z-[60] grid place-items-center overflow-hidden px-4",
            mega ? "bg-ink/75" : "bg-ink/60",
          )}
          onClick={onClose}
        >
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0",
              mega
                ? "bg-[radial-gradient(circle_at_50%_62%,rgba(249,115,22,0.4),transparent_58%)]"
                : "bg-[radial-gradient(circle_at_50%_62%,rgba(249,115,22,0.24),transparent_55%)]",
            )}
          />

          {!reduce ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
              {(mega ? [0, 0.18, 0.36] : [0, 0.18]).map((delay) => (
                <motion.span
                  key={delay}
                  initial={{ scale: 0.45, opacity: 0.55 }}
                  animate={{ scale: mega ? 2.15 : 1.7, opacity: 0 }}
                  transition={{ duration: mega ? 1.45 : 1.1, delay, ease: "easeOut" }}
                  className={cn(
                    "absolute rounded-full border-4 border-orange-400/50",
                    mega ? "size-80 sm:size-[28rem]" : "size-64 sm:size-80",
                  )}
                />
              ))}
            </div>
          ) : null}

          {mega && !reduce ? (
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-[44vh] w-2 origin-bottom"
                  style={{ transform: `translate(-50%, -100%) rotate(${i * 36}deg)` }}
                >
                  <motion.span
                    className="block h-full w-full rounded-full bg-gradient-to-t from-transparent via-orange-400/35 to-yellow-200/0"
                    animate={{ opacity: [0.15, 0.55, 0.15], scaleY: [0.85, 1.06, 0.85] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
                  />
                </span>
              ))}
            </div>
          ) : null}

          {!reduce
            ? EMBERS.slice(0, mega ? EMBERS.length : 8).map((ember, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="pointer-events-none absolute rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047]"
                  style={{ left: `${ember.left}%`, top: `${ember.top}%`, width: ember.size, height: ember.size }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: [0, 1, 0], y: -80, x: ember.drift }}
                  transition={{ duration: 1.25, repeat: Infinity, delay: ember.delay, ease: "easeOut" }}
                />
              ))
            : null}

          <motion.div
            role="status"
            aria-live="assertive"
            initial={reduce ? false : { scale: 0.7, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.92, opacity: 0 }}
            transition={reduce ? undefined : { type: "spring", stiffness: 260, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex w-full max-w-xl flex-col items-center text-center"
          >
            <motion.div
              animate={
                mega && !reduce
                  ? { x: [0, -8, 8, -5, 5, 0], y: [0, -5, 5, -3, 3, 0] }
                  : undefined
              }
              transition={{ duration: 0.45, repeat: 2, ease: "easeInOut" }}
              className="flex w-full flex-col items-center"
            >
              <div
                className="relative flex items-center justify-center"
                style={{ height: mega ? "clamp(200px, 52vh, 540px)" : "clamp(180px, 40vh, 380px)" }}
              >
                <motion.div
                  animate={
                    reduce
                      ? undefined
                      : {
                          scaleY: [1, 1.04, 0.98, 1.03, 1],
                          scaleX: [1, 0.98, 1.02, 0.99, 1],
                          rotate: [-1, 1.2, -0.6, 0.8, -1],
                        }
                  }
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-full"
                >
                  <FlameBurst className="h-full drop-shadow-[0_0_30px_rgba(249,115,22,0.55)]" />
                  <div className="absolute inset-x-0 bottom-[10%] flex justify-center">
                    <motion.div
                      animate={reduce ? undefined : { y: [0, -10, 0], scale: [1, 1.04, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <AnimatedMascot
                        mascot={mascot.id}
                        pose={mascot.poses.celebrate}
                        size={mega ? 300 : 220}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div className="relative mt-1 space-y-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/15 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-orange-200 ring-1 ring-orange-400/40">
                  <Flame aria-hidden="true" className="size-4 fill-current" />
                  Streak {count}
                </span>

                {mega ? (
                  <>
                    <p className="pt-1 text-sm font-black uppercase tracking-[0.35em] text-orange-200 sm:text-base">
                      Super Duper
                    </p>
                    <h2 className="bg-gradient-to-b from-yellow-100 via-orange-300 to-orange-500 bg-clip-text text-5xl font-black uppercase leading-none tracking-tight text-transparent drop-shadow-[0_2px_0_rgba(120,53,15,0.35)] sm:text-7xl">
                      Gokil 10
                    </h2>
                  </>
                ) : (
                  <h2 className="bg-gradient-to-b from-yellow-100 via-orange-300 to-orange-500 bg-clip-text text-5xl font-black uppercase leading-none tracking-tight text-transparent drop-shadow-[0_2px_0_rgba(120,53,15,0.35)] sm:text-6xl">
                    Gokil 3
                  </h2>
                )}

                <p className="mx-auto max-w-sm text-sm font-semibold text-orange-50/90">
                  {count} jawaban benar berturut-turut. {mascot.name} ikut membara!
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.span
            aria-hidden="true"
            initial={{ width: "100%" }}
            animate={{ width: 0 }}
            transition={{ duration: DURATION[tier] / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-orange-500 via-yellow-300 to-orange-500"
          />
          <span className="sr-only">Selebrasi akan tertutup otomatis. Tekan Escape untuk menutup.</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
