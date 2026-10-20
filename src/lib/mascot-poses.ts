/**
 * Daftar pose animasi tiap maskot.
 * Aset ada di /public/media/animasi-maskot/<maskot>/<pose>.svg.
 *
 * File ini sengaja bebas dari "use client" supaya bisa dipakai
 * komponen server, data, dan tes.
 */
export const MASCOT_POSES = {
  "eyang-nusa": ["melambai-jawa", "melambai-sunda", "melambai-bali", "mengangguk", "tertawa", "bercerita", "merayakan"],
  "mbah-darmo": ["menyapa", "mengetik", "mendengarkan", "menjawab", "berpikir", "memuji", "kurang-yakin"],
  "teh-euis": ["menyapa", "melambai-jawa", "melambai-sunda", "melambai-bali", "mengangguk", "tertawa", "merayakan"],
  "teh-euis-ai": [
    "menyapa-sunda",
    "menyapa-jawa",
    "menyapa-bali",
    "mengetik",
    "mendengarkan",
    "menjawab",
    "berpikir",
    "memuji",
    "kurang-yakin",
  ],
  "kak-sitti": [
    "napas",
    "menyapa",
    "salam",
    "mendengarkan",
    "berpikir",
    "mengetik",
    "menjawab",
    "memuji",
    "kurang-yakin",
    "gangguan-koneksi",
    "berpetatah",
    "tidur",
  ],
  "nenek-aminah": [
    "napas",
    "menyapa",
    "salam",
    "mendengarkan",
    "berpikir",
    "mengetik",
    "menjawab",
    "memuji",
    "kurang-yakin",
    "gangguan-koneksi",
    "bercerita",
    "tidur",
  ],
  "uda-rizal": [
    "napas",
    "menyapa",
    "salam",
    "mendengarkan",
    "berpikir",
    "mengetik",
    "menjawab",
    "memuji",
    "kurang-yakin",
    "gangguan-koneksi",
    "berpetatah",
    "tidur",
  ],
} as const;

export type MascotId = keyof typeof MASCOT_POSES;
export type PoseOf<M extends MascotId> = (typeof MASCOT_POSES)[M][number];

export const DEFAULT_POSES: Record<MascotId, string> = {
  "eyang-nusa": "melambai-jawa",
  "mbah-darmo": "menyapa",
  "teh-euis": "menyapa",
  "teh-euis-ai": "menyapa-sunda",
  "kak-sitti": "napas",
  "nenek-aminah": "napas",
  "uda-rizal": "napas",
};

/** Pose yang valid untuk maskot tertentu (fallback ke pose default). */
export function resolvePose(mascot: MascotId, pose?: string): string {
  if (!pose) return DEFAULT_POSES[mascot];
  const poses: readonly string[] = MASCOT_POSES[mascot];
  return poses.includes(pose) ? pose : DEFAULT_POSES[mascot];
}
