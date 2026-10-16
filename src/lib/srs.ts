/**
 * Spaced repetition sederhana (Leitner 0–5) untuk user_vocab_mastery.
 * Benar: strength+1, correct_count+1. Salah: strength-1 (min 0), wrong_count+1.
 * next_review_at = sekarang + interval sesuai strength baru.
 */

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export const INTERVALS_MS = [
  10 * MINUTE, // 0 → 10 menit
  1 * DAY, // 1 → 1 hari
  3 * DAY, // 2 → 3 hari
  7 * DAY, // 3 → 7 hari
  14 * DAY, // 4 → 14 hari
  30 * DAY, // 5 → 30 hari
];

export const MAX_STRENGTH = 5;

export type MasteryState = {
  strength: number;
  correct_count: number;
  wrong_count: number;
};

export function nextMastery(prev: MasteryState | null | undefined, correct: boolean, now = new Date()) {
  const base = prev ?? { strength: 0, correct_count: 0, wrong_count: 0 };
  const strength = correct ? Math.min(MAX_STRENGTH, base.strength + 1) : Math.max(0, base.strength - 1);
  return {
    strength,
    correct_count: base.correct_count + (correct ? 1 : 0),
    wrong_count: base.wrong_count + (correct ? 0 : 1),
    next_review_at: new Date(now.getTime() + INTERVALS_MS[strength]).toISOString(),
  };
}

export function strengthLabel(strength: number) {
  if (strength >= 5) return "Hafal";
  if (strength >= 3) return "Kuat";
  if (strength >= 1) return "Berkembang";
  return "Baru";
}
