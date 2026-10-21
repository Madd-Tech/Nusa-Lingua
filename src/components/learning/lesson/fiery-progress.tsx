"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { MiniFlame } from "@/components/learning/lesson/flame-burst";
import { streakTier } from "@/lib/streak-celebration";
import { cn } from "@/lib/utils";

const EMBERS = [
  { left: 6, delay: 0, drift: 3 },
  { left: 18, delay: 0.25, drift: -4 },
  { left: 31, delay: 0.1, drift: 4 },
  { left: 45, delay: 0.4, drift: -3 },
  { left: 58, delay: 0.18, drift: 5 },
  { left: 71, delay: 0.5, drift: -5 },
  { left: 84, delay: 0.08, drift: 3 },
  { left: 94, delay: 0.34, drift: -2 },
];

/**
 * Bar progress lesson yang ikut "terbakar" saat pengguna mendapat
 * streak jawaban benar. Tier 3–9 = api biasa, tier 10+ = api besar.
 */
export function FieryProgress({
  value,
  max,
  streak,
  "aria-label": ariaLabel,
}: {
  value: number;
  max: number;
  streak: number;
  "aria-label": string;
}) {
  const reduce = useReducedMotion();
  const tier = streakTier(streak);
  const hot = tier !== "none";
  const mega = tier === "mega";
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;

  return (
    <div className="relative min-w-0 flex-1">
      {hot ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute -inset-1 rounded-full blur-md",
            mega ? "animate-pulse bg-orange-500/50" : "bg-orange-500/30",
          )}
        />
      ) : null}

      <Progress
        value={value}
        max={max}
        aria-label={ariaLabel}
        className={cn(
          "relative z-10 transition-[height] duration-500",
          tier === "none" && "h-4",
          tier === "fire" && "h-5 ring-1 ring-orange-400/50",
          mega && "h-7 ring-2 ring-orange-400/70",
        )}
        indicatorClassName={cn(
          tier === "fire" &&
            "bg-[linear-gradient(100deg,#dc2626,#f97316,#facc15,#f97316,#dc2626)] bg-[length:200%_100%] shadow-[0_0_14px_rgba(249,115,22,0.75)] animate-flame-shimmer",
          mega &&
            "bg-[linear-gradient(100deg,#b91c1c,#dc2626,#f97316,#facc15,#f97316,#dc2626,#b91c1c)] bg-[length:250%_100%] shadow-[0_0_24px_rgba(239,68,68,0.9)] animate-flame-shimmer [animation-duration:0.65s]",
        )}
      />

      {hot ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20"
          style={{ width: `${Math.max(pct, 2)}%` }}
        >
          <FlameCluster mega={mega} reduce={!!reduce} className="right-0" />
          {mega ? <FlameCluster mega reduce={!!reduce} className="left-0" /> : null}
          {mega && !reduce
            ? EMBERS.map((ember, i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-1 size-1 rounded-full bg-yellow-300 shadow-[0_0_6px_#fde047]"
                  style={{ left: `${ember.left}%` }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -24, opacity: [0, 1, 0], x: [0, ember.drift, 0] }}
                  transition={{
                    duration: 1.1 + (i % 3) * 0.2,
                    repeat: Infinity,
                    delay: ember.delay,
                    ease: "easeOut",
                  }}
                />
              ))
            : null}
        </div>
      ) : null}
    </div>
  );
}

function FlameCluster({
  mega,
  reduce,
  className,
}: {
  mega: boolean;
  reduce: boolean;
  className?: string;
}) {
  return (
    <div className={cn("absolute top-0 flex -translate-y-1/2 items-end", className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className={cn(
            "block origin-bottom",
            i === 0 && "-mr-2 text-red-600",
            i === 1 && "-mr-2 text-orange-500",
            i === 2 && "text-yellow-300",
          )}
          animate={
            reduce
              ? undefined
              : {
                  scaleY: [1, 1.22, 0.92, 1.08, 1],
                  scaleX: [1, 0.95, 1.05, 0.97, 1],
                  rotate: [-2, 2, -1, 1, -2],
                  opacity: [0.85, 1, 0.9, 1, 0.85],
                }
          }
          transition={{
            duration: 0.55 + i * 0.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.05,
          }}
        >
          <MiniFlame
            className={cn(
              mega ? "h-9 w-7" : "h-6 w-5",
              i === 2 && (mega ? "h-11 w-8" : "h-7 w-6"),
            )}
          />
        </motion.span>
      ))}
    </div>
  );
}
