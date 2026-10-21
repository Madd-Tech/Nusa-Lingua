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
