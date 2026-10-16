import type { Enums } from "@/types/database";

export const APP_NAME = "Nusa Lingua";

/** Target harian bawaan (preferensi UI, bukan data). */
export const DAILY_XP_GOAL = 30;

export const ARTICLE_CATEGORIES: { value: Enums<"article_category">; label: string }[] = [
  { value: "sejarah", label: "Sejarah" },
  { value: "cerita_rakyat", label: "Cerita Rakyat" },
  { value: "tarian", label: "Tarian" },
  { value: "kuliner", label: "Kuliner" },
  { value: "pakaian_adat", label: "Pakaian Adat" },
  { value: "upacara", label: "Upacara" },
  { value: "aksara", label: "Aksara" },
  { value: "lainnya", label: "Lainnya" },
];

export function articleCategoryLabel(value: string) {
  return ARTICLE_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export const UNIT_LEVEL_LABEL: Record<Enums<"unit_level">, string> = {
  pemula: "Pemula",
  menengah: "Menengah",
  mahir: "Mahir",
};

export const SUBMISSION_STATUS_LABEL: Record<Enums<"submission_status">, string> = {
  pending: "Menunggu",
  approved: "Disetujui",
  rejected: "Ditolak",
};

export const ROLE_LABEL: Record<Enums<"user_role">, string> = {
  user: "Pelajar",
  moderator: "Moderator",
  admin: "Admin",
};

export const XP_SOURCE_LABEL: Record<string, string> = {
  lesson: "Menyelesaikan lesson",
  review: "Ulasan kosakata",
  article: "Membaca artikel budaya",
  contribution: "Kontribusi kosakata",
  achievement: "Pencapaian",
  streak: "Bonus streak",
};
