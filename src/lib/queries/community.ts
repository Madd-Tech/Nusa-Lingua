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
