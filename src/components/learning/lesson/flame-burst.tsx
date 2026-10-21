"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Ilustrasi api berlapis untuk selebrasi streak.
 * Warna memakai gradien SVG, bukan aset eksternal, agar tetap tajam
 * di semua ukuran dan tidak menambah request.
 */
export function FlameBurst({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const outer = `flame-outer-${uid}`;
  const mid = `flame-mid-${uid}`;
  const core = `flame-core-${uid}`;
  const glow = `flame-glow-${uid}`;

  return (
    <svg
      viewBox="0 0 200 300"
      className={cn("h-full w-auto", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={outer} x1="100" y1="0" x2="100" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="45%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
        <linearGradient id={mid} x1="100" y1="45" x2="100" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id={core} x1="100" y1="110" x2="100" y2="230" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="55%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="68%" r="50%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="60%" stopColor="#f97316" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="100" cy="200" r="100" fill={`url(#${glow})`} />
      <path
        d="M100 6c12 52 64 78 68 144 3 40-20 56-12 88 8 34-22 58-56 58s-62-24-54-58c8-32-15-48-12-88 4-66 56-92 66-144Z"
        fill={`url(#${outer})`}
      />
      <path
        d="M100 52c8 40 46 60 46 114 0 36-18 50-14 76 4 24-14 36-32 36s-36-12-32-36c4-26-14-40-14-76 0-54 38-74 46-114Z"
        fill={`url(#${mid})`}
      />
      <path
        d="M100 118c6 28 26 40 26 72 0 24-12 36-26 36s-26-12-26-36c0-32 20-44 26-72Z"
        fill={`url(#${core})`}
      />
    </svg>
  );
}

/** Lidah api kecil untuk ditempel di tepi bar progress. */
export function MiniFlame({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={cn("h-6 w-5", className)} aria-hidden="true" focusable="false">
      <path
        d="M12 1c1.3 5 6 7.2 6 13a6 6 0 1 1-12 0c0-2.7 1.3-4.6 2.8-6.7.3 1.7 1.1 2.8 1.9 3.4C11.2 7.3 12 3.8 12 1Z"
        fill="currentColor"
      />
    </svg>
  );
}
