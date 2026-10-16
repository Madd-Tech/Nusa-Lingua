import type { DB } from "./_shared";
import { must, sanitizeSearch } from "./_shared";

const LANGUAGE_FIELDS = "id, name, code, description, icon_url, region_id, region:regions(id, name, province, island)" as const;

export async function getActiveLanguages(db: DB) {
  return must(
    "Gagal memuat daftar bahasa",
    await db.from("languages").select(LANGUAGE_FIELDS).eq("is_active", true).order("name"),
  );
}

export type LanguageWithRegion = Awaited<ReturnType<typeof getActiveLanguages>>[number];

export async function getLanguageByCode(db: DB, code: string) {
  return must(
    "Gagal memuat bahasa",
    await db.from("languages").select(LANGUAGE_FIELDS).eq("code", code).eq("is_active", true).maybeSingle(),
  );
}

export async function getRegions(db: DB) {
  return must(
    "Gagal memuat daftar daerah",
    await db.from("regions").select("id, name, province, island").order("name"),
  );
}

/** Daerah + bahasa aktifnya — untuk peta bahasa di landing. */
export async function getRegionsWithLanguages(db: DB) {
  const rows = must(
    "Gagal memuat peta bahasa",
    await db
      .from("regions")
      .select("id, name, province, island, lat, lng, languages(id, name, code, icon_url, is_active)")
      .order("name"),
  );
  return rows.map((r) => ({ ...r, languages: r.languages.filter((l) => l.is_active) }));
}

export type RegionWithLanguages = Awaited<ReturnType<typeof getRegionsWithLanguages>>[number];

export async function getUnitsWithLessons(db: DB, languageId: number) {
  return must(
    "Gagal memuat unit",
    await db
      .from("units")
      .select("id, title, description, level, order_index, lessons(id, title, order_index, xp_reward)")
      .eq("language_id", languageId)
      .order("order_index")
      .order("order_index", { referencedTable: "lessons" }),
  );
}

export type UnitWithLessons = Awaited<ReturnType<typeof getUnitsWithLessons>>[number];

export async function getLessonForPlayer(db: DB, lessonId: number) {
  const lesson = must(
    "Gagal memuat lesson",
    await db
      .from("lessons")
      .select("id, title, xp_reward, unit:units(id, title, language:languages(id, code, name))")
      .eq("id", lessonId)
      .maybeSingle(),
  );
  if (!lesson) return null;

  const questions = must(
    "Gagal memuat soal",
    await db
      .from("questions")
      .select(
        "id, type, prompt, options, correct_answer, audio_url, order_index, vocabulary_id, vocabulary:vocabularies(id, word, meaning_id, audio_url, pronunciation)",
      )
      .eq("lesson_id", lessonId)
      .order("order_index"),
  );

  return { lesson, questions };
}

export const VOCAB_PAGE_SIZE = 24;

export async function getVocabularies(
  db: DB,
  languageId: number,
  opts: { q?: string; category?: string; speechLevel?: string; page?: number } = {},
) {
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * VOCAB_PAGE_SIZE;
  let query = db
    .from("vocabularies")
    .select("id, word, meaning_id, speech_level, pronunciation, audio_url, image_url, example_sentence, category", {
      count: "exact",
    })
    .eq("language_id", languageId)
    .order("word")
    .range(from, from + VOCAB_PAGE_SIZE - 1);

  const q = sanitizeSearch(opts.q);
  if (q) query = query.or(`word.ilike.%${q}%,meaning_id.ilike.%${q}%`);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.speechLevel) query = query.eq("speech_level", opts.speechLevel);

  const res = await query;
  const items = must("Gagal memuat kosakata", res);
  return { items, total: res.count ?? 0, page, pageSize: VOCAB_PAGE_SIZE };
}

export type VocabularyItem = Awaited<ReturnType<typeof getVocabularies>>["items"][number];

/** Nilai unik kategori & tingkat tutur untuk filter kamus. */
export async function getVocabFacets(db: DB, languageId: number) {
  const rows = must(
    "Gagal memuat filter kamus",
    await db.from("vocabularies").select("category, speech_level").eq("language_id", languageId).limit(2000),
  );
  const uniq = (values: (string | null)[]) =>
    Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, "id"));
  return { categories: uniq(rows.map((r) => r.category)), speechLevels: uniq(rows.map((r) => r.speech_level)) };
}

/** Statistik landing — semua angka dihitung dari database (count), bukan karangan. */
export async function getLandingStats(db: DB) {
  const [languages, vocabularies, articles, regions] = await Promise.all([
    db.from("languages").select("id", { count: "exact", head: true }).eq("is_active", true),
    db.from("vocabularies").select("id", { count: "exact", head: true }),
    db.from("cultural_articles").select("id", { count: "exact", head: true }).eq("is_published", true),
    db.from("regions").select("id", { count: "exact", head: true }),
  ]);
  // Request HEAD tidak membawa body error, jadi count === null juga dianggap gagal.
  const all = [languages, vocabularies, articles, regions];
  if (all.some((r) => r.error || r.count === null)) return null;
  return {
    languages: languages.count ?? 0,
    vocabularies: vocabularies.count ?? 0,
    articles: articles.count ?? 0,
    regions: regions.count ?? 0,
  };
}

export async function getAchievements(db: DB) {
  return must(
    "Gagal memuat pencapaian",
    await db.from("achievements").select("id, code, name, description, icon_url").order("id"),
  );
}
