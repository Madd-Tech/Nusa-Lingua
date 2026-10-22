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

export const GENDER_OPTIONS: { value: Enums<"user_gender">; label: string }[] = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];

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

export const ARTICLE_STATUSES: { value: Enums<"article_status">; label: string; tab: string }[] = [
  { value: "draft", label: "Draf", tab: "Draf" },
  { value: "review", label: "Menunggu tinjauan", tab: "Ditinjau" },
  { value: "published", label: "Terbit", tab: "Terbit" },
  { value: "archived", label: "Arsip", tab: "Arsip" },
];

export const ARTICLE_STATUS_LABEL = Object.fromEntries(ARTICLE_STATUSES.map((s) => [s.value, s.label])) as Record<
  Enums<"article_status">,
  string
>;

/** Alasan laporan & jenis konten yang relevan untuk tiap alasan. */
export const REPORT_REASONS: { value: Enums<"report_reason">; label: string; targets: Enums<"report_target">[] }[] = [
  { value: "ejaan", label: "Ejaan keliru", targets: ["vocabulary", "article"] },
  { value: "arti_keliru", label: "Arti kurang tepat", targets: ["vocabulary"] },
  { value: "tingkat_tutur", label: "Tingkat tutur keliru", targets: ["vocabulary"] },
  { value: "audio", label: "Rekaman/pelafalan keliru", targets: ["vocabulary"] },
  { value: "fakta_budaya", label: "Fakta budaya keliru", targets: ["article"] },
  { value: "tidak_pantas", label: "Tidak pantas", targets: ["vocabulary", "article"] },
  { value: "lainnya", label: "Lainnya", targets: ["vocabulary", "article"] },
];

export const REPORT_REASON_LABEL = Object.fromEntries(REPORT_REASONS.map((r) => [r.value, r.label])) as Record<
  Enums<"report_reason">,
  string
>;

export const REPORT_STATUSES: { value: Enums<"report_status">; label: string }[] = [
  { value: "open", label: "Terbuka" },
  { value: "resolved", label: "Selesai" },
  { value: "dismissed", label: "Diabaikan" },
];

export const REPORT_STATUS_LABEL = Object.fromEntries(REPORT_STATUSES.map((s) => [s.value, s.label])) as Record<
  Enums<"report_status">,
  string
>;

/** Batas laporan terbuka per user (ditegakkan trigger reports_before_insert). */
export const MAX_OPEN_REPORTS = 10;

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
  {
    value: "artikel",
    label: "Artikel",
    actions: ["article_created", "article_updated", "article_status_changed", "article_deleted"],
  },
  { value: "kamus", label: "Kamus", actions: ["vocab_updated", "vocab_hidden", "vocab_restored"] },
  { value: "laporan", label: "Laporan", actions: ["report_resolved", "report_dismissed"] },
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
