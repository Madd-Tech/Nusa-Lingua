import type { DB } from "./_shared";
import { must } from "./_shared";
import type { Enums } from "@/types/database";

export const QUEUE_PAGE_SIZE = 20;

export type ScopeLanguage = { id: number; name: string; code: string };

/** Bahasa yang boleh dimoderasi user ini. Admin = semua bahasa. */
export async function getModerationScope(db: DB, userId: string, role: Enums<"user_role">): Promise<ScopeLanguage[]> {
  if (role === "admin") {
    return must("Gagal memuat daftar bahasa", await db.from("languages").select("id, name, code").order("name"));
  }
  if (role !== "moderator") return [];
  const rows = must(
    "Gagal memuat bahasa yang kamu moderasi",
    await db.from("moderator_languages").select("language:languages(id, name, code)").eq("user_id", userId),
  );
  return rows
    .map((r) => r.language)
    .filter((l): l is ScopeLanguage => !!l)
    .sort((a, b) => a.name.localeCompare(b.name, "id"));
}

export type DuplicateCandidate = { id: number; word: string; meaning_id: string };
export type SubmissionOriginal = { word: string; meaning_id: string };

/** Antrean usulan (RPC get_submission_queue sudah membatasi ke bahasa yang dimoderasi). */
export async function getSubmissionQueue(
  db: DB,
  opts: { status: Enums<"submission_status">; languageId?: number | null; page?: number },
) {
  const page = Math.max(1, opts.page ?? 1);
  const rows = must(
    "Gagal memuat antrean usulan",
    await db.rpc("get_submission_queue", {
      p_status: opts.status,
      p_language_id: opts.languageId ?? null,
      p_limit: QUEUE_PAGE_SIZE,
      p_offset: (page - 1) * QUEUE_PAGE_SIZE,
    }),
  );
  const items = rows.map((r) => ({
    ...r,
    duplicates: (r.duplicates ?? []) as unknown as DuplicateCandidate[],
    original: r.original as unknown as SubmissionOriginal | null,
  }));
  return { items, total: Number(rows[0]?.total_count ?? 0), page, pageSize: QUEUE_PAGE_SIZE };
}

export type QueueItem = Awaited<ReturnType<typeof getSubmissionQueue>>["items"][number];

/** Usulan menunggu yang bisa ditindak user ini: RLS membatasi ke bahasa yang dimoderasi, milik sendiri dikecualikan. */
export async function countActionablePending(db: DB, userId: string) {
  const res = await db
    .from("vocab_submissions")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending")
    .neq("user_id", userId);
  return res.count ?? 0;
}

/** Antrean per bahasa yang dimoderasi (admin: semua bahasa), terbanyak di atas. */
export async function getModerationOverview(db: DB) {
  return must("Gagal memuat ringkasan moderasi", await db.rpc("get_moderation_overview"));
}

export type OverviewRow = Awaited<ReturnType<typeof getModerationOverview>>[number];

export type MyModerationStats = {
  days: number;
  reviewed: number;
  approved: number;
  rejected: number;
  /** Rata-rata jarak kirim → diputuskan (jam); null bila belum ada tinjauan. */
  avg_wait_hours: number | null;
};

export async function getMyModerationStats(db: DB, days = 7) {
  const stats = must("Gagal memuat statistik tinjauanmu", await db.rpc("get_my_moderation_stats", { p_days: days }));
  return stats as unknown as MyModerationStats;
}

export const LOG_PAGE_SIZE = 30;

/** Riwayat moderasi (RLS: bahasa yang dimoderasi; admin juga melihat penugasan moderator). */
export async function getModerationLog(
  db: DB,
  opts: {
    actions?: Enums<"moderation_action">[];
    languageId?: number | null;
    actorId?: string | null;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = opts.pageSize ?? LOG_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  let query = db
    .from("moderation_log")
    .select(
      "id, action, target_type, target_id, detail, created_at, actor_id, actor:profiles!moderation_log_actor_id_fkey(username, avatar_url), language:languages(id, name, code)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);
  if (opts.actions?.length) query = query.in("action", opts.actions);
  if (opts.languageId) query = query.eq("language_id", opts.languageId);
  if (opts.actorId) query = query.eq("actor_id", opts.actorId);

  const res = await query;
  const rows = must("Gagal memuat riwayat moderasi", res);

  // Nama moderator yang ditugaskan/dilepas (target_id = id profil).
  const targetIds = Array.from(new Set(rows.filter((r) => r.target_type === "moderator").map((r) => r.target_id)));
  const targetNames = new Map<string, string>();
  if (targetIds.length) {
    const names = await db.from("profiles").select("id, username").in("id", targetIds);
    names.data?.forEach((p) => p.username && targetNames.set(p.id, p.username));
  }

  const items = rows.map((r) => ({
    ...r,
    detail: (r.detail ?? {}) as LogDetail,
    targetUsername: r.target_type === "moderator" ? targetNames.get(r.target_id) ?? null : null,
  }));
  return { items, total: res.count ?? 0, page, pageSize };
}

/** Isi `moderation_log.detail` yang ditulis RPC (semua opsional). */
export type LogDetail = {
  word?: string;
  vocabulary_id?: number;
  edited?: boolean;
  reason?: Enums<"reject_reason">;
  note?: string | null;
  language_ids?: number[];
  /** Entri artikel. */
  title?: string;
  from?: Enums<"article_status">;
  to?: Enums<"article_status">;
  fields?: string[];
};

export type LogEntry = Awaited<ReturnType<typeof getModerationLog>>["items"][number];

// ---------------------------------------------------------------------
// Artikel budaya (CMS)
// ---------------------------------------------------------------------

export const MOD_ARTICLE_PAGE_SIZE = 20;

const MOD_ARTICLE_FIELDS =
  "id, title, slug, status, category, language_id, author_id, created_at, updated_at, published_at, review_note, language:languages(id, name, code), author:profiles!cultural_articles_author_id_fkey(username)" as const;

/**
 * Artikel di area moderasi. Artikel terbit terbaca semua orang lewat RLS, jadi
 * daftar dibatasi eksplisit ke bahasa yang dimoderasi (`languageIds` null = admin, semua).
 */
export async function getModerationArticles(
  db: DB,
  opts: { status: Enums<"article_status">; languageIds: number[] | null; page?: number },
) {
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * MOD_ARTICLE_PAGE_SIZE;
  let query = db
    .from("cultural_articles")
    .select(MOD_ARTICLE_FIELDS, { count: "exact" })
    .eq("status", opts.status)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .range(from, from + MOD_ARTICLE_PAGE_SIZE - 1);
  if (opts.languageIds) query = query.in("language_id", opts.languageIds);
  const res = await query;
  const items = must("Gagal memuat daftar artikel", res);
  return { items, total: res.count ?? 0, page, pageSize: MOD_ARTICLE_PAGE_SIZE };
}

export type ModerationArticle = Awaited<ReturnType<typeof getModerationArticles>>["items"][number];

export async function countArticlesByStatus(db: DB, languageIds: number[] | null) {
  const statuses: Enums<"article_status">[] = ["draft", "review", "published", "archived"];
  const counts = await Promise.all(
    statuses.map(async (status) => {
      let query = db.from("cultural_articles").select("id", { count: "exact", head: true }).eq("status", status);
      if (languageIds) query = query.in("language_id", languageIds);
      const res = await query;
      return [status, res.count ?? 0] as const;
    }),
  );
  return Object.fromEntries(counts) as Record<Enums<"article_status">, number>;
}

/** Artikel lengkap untuk editor (RLS: hanya bahasa yang dimoderasi, atau yang sudah terbit). */
export async function getArticleForEdit(db: DB, id: number) {
  return must(
    "Gagal memuat artikel",
    await db
      .from("cultural_articles")
      .select(
        "*, language:languages(id, name, code), author:profiles!cultural_articles_author_id_fkey(username), editor:profiles!cultural_articles_updated_by_fkey(username), publisher:profiles!cultural_articles_published_by_fkey(username)",
      )
      .eq("id", id)
      .maybeSingle(),
  );
}

export type EditableArticle = NonNullable<Awaited<ReturnType<typeof getArticleForEdit>>>;

/** Bahasa (dengan region_id) yang bisa dipilih di editor artikel. */
export async function getScopeLanguagesWithRegion(db: DB, languageIds: number[]) {
  if (!languageIds.length) return [];
  return must(
    "Gagal memuat daftar bahasa",
    await db.from("languages").select("id, name, code, region_id").in("id", languageIds).order("name"),
  );
}

/** Khusus admin: moderator beserta bahasa & aktivitas tinjauan 30 hari terakhir. */
export async function getModeratorTeam(db: DB) {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [profiles, assignments, reviews] = await Promise.all([
    db.from("profiles").select("id, username, full_name, avatar_url, role").eq("role", "moderator").order("username"),
    db.from("moderator_languages").select("user_id, language_id"),
    db
      .from("vocab_submissions")
      .select("reviewed_by, reviewed_at")
      .gte("reviewed_at", since)
      .not("reviewed_by", "is", null)
      .limit(5000),
  ]);
  const members = must("Gagal memuat daftar moderator", profiles);
  const langs = must("Gagal memuat penugasan bahasa", assignments);
  const recent = must("Gagal memuat aktivitas moderator", reviews);

  return members.map((m) => {
    const mine = recent.filter((r) => r.reviewed_by === m.id);
    return {
      ...m,
      languageIds: langs.filter((a) => a.user_id === m.id).map((a) => a.language_id),
      reviews30d: mine.length,
      lastReviewAt: mine.reduce<string | null>((max, r) => (r.reviewed_at && (!max || r.reviewed_at > max) ? r.reviewed_at : max), null),
    };
  });
}

export type TeamMember = Awaited<ReturnType<typeof getModeratorTeam>>[number];
