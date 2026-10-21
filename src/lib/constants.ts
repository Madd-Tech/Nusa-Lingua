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

/** XP untuk kontributor saat usulannya disetujui (ditegakkan di RPC review_submission). */
export const CONTRIBUTION_XP = 15;

/** Batas usulan menunggu per user (ditegakkan trigger vocab_submission_limit). */
export const MAX_PENDING_SUBMISSIONS = 20;

/** Alasan penolakan + templat catatan untuk kontributor. */
export const REJECT_REASONS: { value: Enums<"reject_reason">; label: string; template: string }[] = [
  { value: "duplikat", label: "Sudah ada di kamus", template: "Kata ini sudah ada di kamus dengan arti yang sama. Terima kasih sudah membantu!" },
  { value: "ejaan", label: "Ejaan keliru", template: "Ejaannya belum tepat. Coba periksa lagi lalu kirim ulang, ya." },
  { value: "arti_keliru", label: "Arti kurang tepat", template: "Arti yang dituliskan belum sesuai. Coba periksa lagi lalu kirim ulang, ya." },
  { value: "bukan_bahasa_ini", label: "Bukan bahasa ini", template: "Kata ini sepertinya bukan dari bahasa yang dipilih." },
  { value: "tidak_pantas", label: "Tidak pantas", template: "Kata ini tidak sesuai untuk kamus pembelajaran." },
  { value: "audio_buruk", label: "Rekaman kurang jelas", template: "Rekamannya kurang jelas. Coba rekam ulang di tempat yang lebih tenang." },
  { value: "lainnya", label: "Lainnya", template: "" },
];

export const REJECT_REASON_LABEL = Object.fromEntries(REJECT_REASONS.map((r) => [r.value, r.label])) as Record<
  Enums<"reject_reason">,
  string
>;

/** Kata kerja untuk riwayat moderasi: "@budi {label} …". */
export const MODERATION_ACTION_LABEL: Record<Enums<"moderation_action">, string> = {
  submission_approved: "menyetujui usulan",
  submission_rejected: "menolak usulan",
  vocab_updated: "mengubah kata",
  vocab_hidden: "menyembunyikan kata",
  vocab_restored: "memulihkan kata",
  article_created: "membuat draf artikel",
  article_updated: "mengubah artikel",
  article_status_changed: "mengubah status artikel",
  article_deleted: "menghapus draf artikel",
  report_resolved: "menyelesaikan laporan",
  report_dismissed: "mengabaikan laporan",
  moderator_assigned: "menugaskan",
  moderator_removed: "melepas",
};

/** Filter jenis aktivitas di /moderasi/riwayat (param `aksi`). */
export const LOG_ACTION_FILTERS: {
  value: string;
  label: string;
  actions: Enums<"moderation_action">[];
  adminOnly?: boolean;
}[] = [
  { value: "disetujui", label: "Usulan disetujui", actions: ["submission_approved"] },
  { value: "ditolak", label: "Usulan ditolak", actions: ["submission_rejected"] },
  { value: "penugasan", label: "Penugasan moderator", actions: ["moderator_assigned", "moderator_removed"], adminOnly: true },
];

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
