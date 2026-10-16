"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#1F8A4C", "#E3A008", "#C2410C", "#7E3AF2", "#0E7C7B", "#B91C1C"];

/** Konfeti ringan berbasis framer-motion (tanpa dependensi tambahan). Nonaktif bila reduced motion. */
export function Confetti({ count = 60 }: { count?: number }) {
  const reduce = useReducedMotion();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 2.2 + Math.random() * 1.6,
        rotate: Math.random() * 720 - 360,
        drift: Math.random() * 120 - 60,
        size: 6 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.6,
      })),
    [count],
  );
  if (reduce) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.6,
            background: p.color,
            borderRadius: p.round ? 999 : 2,
          }}
          initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "105vh", x: p.drift, rotate: p.rotate, opacity: [1, 1, 0.8] }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}
