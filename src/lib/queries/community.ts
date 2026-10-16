import type { DB } from "./_shared";
import { must } from "./_shared";
import type { Enums } from "@/types/database";

const SUBMISSION_FIELDS =
  "id, user_id, language_id, word, meaning_id, audio_url, status, reviewed_by, created_at, language:languages(id, name, code)" as const;

export async function getMySubmissions(db: DB, userId: string) {
  return must(
    "Gagal memuat kontribusimu",
    await db
      .from("vocab_submissions")
      .select(SUBMISSION_FIELDS)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
  );
}

export type Submission = Awaited<ReturnType<typeof getMySubmissions>>[number];

/** Untuk moderator/admin (RLS mengizinkan melihat semua kiriman). */
export async function getSubmissionsByStatus(db: DB, status: Enums<"submission_status">) {
  const rows = must(
    "Gagal memuat kiriman komunitas",
    await db
      .from("vocab_submissions")
      .select(SUBMISSION_FIELDS)
      .eq("status", status)
      .order("created_at", { ascending: status !== "pending" ? false : true })
      .limit(100),
  );

  // Ambil username pengirim terpisah (tidak bergantung pada FK ke profiles).
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const names = new Map<string, string>();
  if (userIds.length) {
    const res = await db.from("profiles").select("id, username").in("id", userIds);
    res.data?.forEach((p) => p.username && names.set(p.id, p.username));
  }
  return rows.map((r) => ({ ...r, submitter: names.get(r.user_id) ?? null }));
}

export type ModerationItem = Awaited<ReturnType<typeof getSubmissionsByStatus>>[number];

export async function countSubmissionsByStatus(db: DB, status: Enums<"submission_status">) {
  const res = await db.from("vocab_submissions").select("id", { count: "exact", head: true }).eq("status", status);
  return res.count ?? 0;
}
