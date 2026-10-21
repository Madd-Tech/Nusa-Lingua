/**
 * Tingkatan efek streak jawaban benar.
 *
 * - `none` : streak < 3, tampilan biasa.
 * - `fire` : streak 3–9, bar progress menyala dan maskot ikut membara.
 * - `mega` : streak >= 10, bar progress lebih besar dan api lebih heboh.
 */
export type StreakTier = "none" | "fire" | "mega";

/** Tier tampilan yang dipakai bar progress dan kartu maskot. */
export function streakTier(count: number): StreakTier {
  if (count >= 10) return "mega";
  if (count >= 3) return "fire";
  return "none";
}

export type CelebrationTier = Exclude<StreakTier, "none">;

/**
 * Overlay selebrasi hanya muncul tepat di streak 3 dan 10.
 * Streak 4–9 dan 11+ tetap menyalakan bar, tanpa menghentikan permainan.
 */
export function celebrationFor(count: number): CelebrationTier | null {
  if (count === 10) return "mega";
  if (count === 3) return "fire";
  return null;
}
