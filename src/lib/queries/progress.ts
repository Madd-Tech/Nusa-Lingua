import type { DB } from "./_shared";
import { must } from "./_shared";
import { startOfTodayJakartaISO } from "@/lib/utils";

export const PROFILE_FIELDS =
  "id, username, full_name, avatar_url, home_region_id, xp_total, current_streak, longest_streak, last_active_date, hearts, role, gender, created_at" as const;

export async function getProfile(db: DB, userId: string) {
  return must("Gagal memuat profil", await db.from("profiles").select(PROFILE_FIELDS).eq("id", userId).maybeSingle());
}

export type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

export async function getUserLanguages(db: DB, userId: string) {
  return must(
    "Gagal memuat bahasa yang dipelajari",
    await db
      .from("user_languages")
      .select("language_id, xp, started_at, language:languages(id, name, code, icon_url, description)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false }),
  );
}

export type UserLanguage = Awaited<ReturnType<typeof getUserLanguages>>[number];

export async function getLessonProgress(db: DB, userId: string, lessonIds: number[]) {
  if (!lessonIds.length) return [];
  return must(
    "Gagal memuat progres lesson",
    await db
      .from("user_lesson_progress")
      .select("lesson_id, status, best_score, stars, attempts, completed_at")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds),
  );
}

export type LessonProgress = Awaited<ReturnType<typeof getLessonProgress>>[number];

/**
 * Ringkasan progres per bahasa: jumlah lesson selesai / total
 * serta lesson berikutnya yang belum selesai.
 */
export async function getLanguageProgressSummary(db: DB, userId: string, languageIds: number[]) {
  const summary = new Map<
    number,
    { total: number; completed: number; unitsTotal: number; unitsCompleted: number; nextLesson: { id: number; title: string } | null }
  >();
  if (!languageIds.length) return summary;

  const units = must(
    "Gagal memuat ringkasan unit",
    await db
      .from("units")
      .select("language_id, order_index, lessons(id, title, order_index)")
      .in("language_id", languageIds)
      .order("order_index")
      .order("order_index", { referencedTable: "lessons" }),
  );

  const allLessonIds = units.flatMap((u) => u.lessons.map((l) => l.id));
  const progress = await getLessonProgress(db, userId, allLessonIds);
  const completed = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));

  for (const languageId of languageIds) {
    const langUnits = units.filter((u) => u.language_id === languageId);
    const lessons = langUnits.flatMap((u) => u.lessons);
    const next = lessons.find((l) => !completed.has(l.id)) ?? null;
    summary.set(languageId, {
      total: lessons.length,
      completed: lessons.filter((l) => completed.has(l.id)).length,
      unitsTotal: langUnits.length,
      unitsCompleted: langUnits.filter((u) => u.lessons.length > 0 && u.lessons.every((l) => completed.has(l.id))).length,
      nextLesson: next ? { id: next.id, title: next.title } : null,
    });
  }
  return summary;
}

const REVIEW_FIELDS =
  "vocabulary_id, strength, correct_count, wrong_count, next_review_at, vocabulary:vocabularies(id, word, meaning_id, pronunciation, audio_url, example_sentence, speech_level, language_id)" as const;

export async function getDueReviews(db: DB, userId: string, limit = 20) {
  return must(
    "Gagal memuat kosakata untuk diulas",
    await db
      .from("user_vocab_mastery")
      .select(REVIEW_FIELDS)
      .eq("user_id", userId)
      .lte("next_review_at", new Date().toISOString())
      .order("next_review_at")
      .limit(limit),
  );
}

export type DueReview = Awaited<ReturnType<typeof getDueReviews>>[number];

export async function countDueReviews(db: DB, userId: string) {
  const res = await db
    .from("user_vocab_mastery")
    .select("vocabulary_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .lte("next_review_at", new Date().toISOString());
  if (res.error) return 0;
  return res.count ?? 0;
}

export async function getNextReviewAt(db: DB, userId: string) {
  const res = await db
    .from("user_vocab_mastery")
    .select("next_review_at")
    .eq("user_id", userId)
    .gt("next_review_at", new Date().toISOString())
    .order("next_review_at")
    .limit(1)
    .maybeSingle();
  return res.data?.next_review_at ?? null;
}

export async function getMasteryFor(db: DB, userId: string, vocabularyIds: number[]) {
  if (!vocabularyIds.length) return [];
  return must(
    "Gagal memuat penguasaan kosakata",
    await db
      .from("user_vocab_mastery")
      .select("vocabulary_id, strength, correct_count, wrong_count")
      .eq("user_id", userId)
      .in("vocabulary_id", vocabularyIds),
  );
}

export async function getMasteryCounts(db: DB, userId: string) {
  const [learned, mastered] = await Promise.all([
    db.from("user_vocab_mastery").select("vocabulary_id", { count: "exact", head: true }).eq("user_id", userId),
    db
      .from("user_vocab_mastery")
      .select("vocabulary_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("strength", 5),
  ]);
  return { learned: learned.count ?? 0, mastered: mastered.count ?? 0 };
}

export async function getTodayXp(db: DB, userId: string) {
  const rows = must(
    "Gagal memuat XP hari ini",
    await db.from("xp_logs").select("amount").eq("user_id", userId).gte("created_at", startOfTodayJakartaISO()),
  );
  return rows.reduce((sum, r) => sum + (r.amount ?? 0), 0);
}

/** Tanggal WIB (YYYY-MM-DD) dari timestamp. */
export function jakartaDate(iso: string | Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" }).format(new Date(iso));
}

/** Total XP per hari (WIB) untuk `days` hari terakhir, urut lama → baru. */
export async function getXpByDay(db: DB, userId: string, days: number) {
  const start = new Date(`${jakartaDate(new Date(Date.now() - (days - 1) * 86_400_000))}T00:00:00+07:00`);
  const rows = must(
    "Gagal memuat riwayat XP",
    await db.from("xp_logs").select("amount, created_at").eq("user_id", userId).gte("created_at", start.toISOString()),
  );
  const totals = new Map<string, number>();
  for (const r of rows) {
    const d = jakartaDate(r.created_at);
    totals.set(d, (totals.get(d) ?? 0) + (r.amount ?? 0));
  }
  return Array.from({ length: days }, (_, i) => {
    const date = jakartaDate(new Date(start.getTime() + i * 86_400_000 + 12 * 3_600_000));
    return { date, xp: totals.get(date) ?? 0 };
  });
}

export async function getLatestAchievements(db: DB, userId: string, limit = 4) {
  return must(
    "Gagal memuat lencana",
    await db
      .from("user_achievements")
      .select("achievement_id, earned_at, achievement:achievements(id, name, description, icon_url)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false })
      .limit(limit),
  );
}

/** Jumlah-jumlah untuk statistik profil (head count, ringan). */
export async function getProfileCounts(db: DB, userId: string) {
  const [lessons, reads, approved] = await Promise.all([
    db.from("user_lesson_progress").select("lesson_id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
    db.from("user_article_reads").select("article_id", { count: "exact", head: true }).eq("user_id", userId),
    db.from("vocab_submissions").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "approved"),
  ]);
  return { lessons: lessons.count ?? 0, reads: reads.count ?? 0, approved: approved.count ?? 0 };
}

export async function getRecentXpLogs(db: DB, userId: string, limit = 10) {
  return must(
    "Gagal memuat riwayat XP",
    await db
      .from("xp_logs")
      .select("id, amount, source, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function getUserAchievements(db: DB, userId: string) {
  return must(
    "Gagal memuat pencapaian",
    await db.from("user_achievements").select("achievement_id, earned_at").eq("user_id", userId),
  );
}
