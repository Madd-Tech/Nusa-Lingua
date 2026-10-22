import type { DB } from "./_shared";
import { must } from "./_shared";

const SUBMISSION_FIELDS =
  "id, user_id, language_id, word, meaning_id, audio_url, status, reviewed_by, reviewed_at, reject_reason, review_note, original, vocabulary_id, created_at, language:languages(id, name, code)" as const;

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

/** Laporan kesalahan yang dikirim user ini (terbaru dulu). */
export async function getMyReports(db: DB, userId: string) {
  return must(
    "Gagal memuat laporanmu",
    await db
      .from("content_reports")
      .select(
        "id, target_type, reason, message, status, resolution_note, created_at, resolved_at, vocabulary:vocabularies(word, language:languages(code, name)), article:cultural_articles(title, slug)",
      )
      .eq("reporter_id", userId)
      .order("created_at", { ascending: false })
      .limit(30),
  );
}

export type MyReport = Awaited<ReturnType<typeof getMyReports>>[number];
