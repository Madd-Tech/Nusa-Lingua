import type { DB } from "./_shared";
import { must, sanitizeSearch } from "./_shared";
import type { Enums } from "@/types/database";

const ARTICLE_CARD_FIELDS =
  "id, title, slug, category, summary, cover_url, region:regions(id, name), language:languages(id, name, code)" as const;

export async function getArticles(
  db: DB,
  opts: { category?: Enums<"article_category">; regionId?: number; q?: string; limit?: number } = {},
) {
  let query = db
    .from("cultural_articles")
    .select(ARTICLE_CARD_FIELDS)
    .eq("is_published", true)
    .order("id", { ascending: false })
    .limit(opts.limit ?? 60);

  if (opts.category) query = query.eq("category", opts.category);
  if (opts.regionId) query = query.eq("region_id", opts.regionId);
  const q = sanitizeSearch(opts.q);
  if (q) query = query.or(`title.ilike.%${q}%,summary.ilike.%${q}%`);

  return must("Gagal memuat artikel budaya", await query);
}

export type ArticleCardData = Awaited<ReturnType<typeof getArticles>>[number];

export const ARTICLE_PAGE_SIZE = 12;

/** Daftar artikel berhalaman untuk /budaya. */
export async function getArticlesPage(
  db: DB,
  opts: { category?: Enums<"article_category">; regionId?: number; languageId?: number; q?: string; page?: number },
) {
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * ARTICLE_PAGE_SIZE;
  let query = db
    .from("cultural_articles")
    .select(ARTICLE_CARD_FIELDS, { count: "exact" })
    .eq("is_published", true)
    .order("id", { ascending: false })
    .range(from, from + ARTICLE_PAGE_SIZE - 1);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.regionId) query = query.eq("region_id", opts.regionId);
  if (opts.languageId) query = query.eq("language_id", opts.languageId);
  const q = sanitizeSearch(opts.q);
  if (q) query = query.ilike("title", `%${q}%`);
  const res = await query;
  const items = must("Gagal memuat artikel budaya", res);
  return { items, total: res.count ?? 0, page, pageSize: ARTICLE_PAGE_SIZE };
}

/** Rekomendasi: artikel dari bahasa aktif atau daerah asal; jika kosong, artikel terbaru. */
export async function getRecommendedArticles(db: DB, opts: { languageId?: number | null; regionId?: number | null; limit?: number }) {
  const limit = opts.limit ?? 2;
  const filters = [
    opts.languageId ? `language_id.eq.${Number(opts.languageId)}` : null,
    opts.regionId ? `region_id.eq.${Number(opts.regionId)}` : null,
  ].filter(Boolean);
  if (filters.length) {
    const res = await db
      .from("cultural_articles")
      .select(ARTICLE_CARD_FIELDS)
      .eq("is_published", true)
      .or(filters.join(","))
      .order("id", { ascending: false })
      .limit(limit * 3);
    if (!res.error && res.data.length) return res.data;
  }
  return getArticles(db, { limit: limit * 3 });
}

export async function getArticleBySlug(db: DB, slug: string) {
  return must(
    "Gagal memuat artikel",
    await db
      .from("cultural_articles")
      .select(
        "id, title, slug, category, summary, content, cover_url, region_id, language_id, region:regions(id, name, province), language:languages(id, name, code)",
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle(),
  );
}

export async function getRelatedArticles(db: DB, article: { id: number; category: string; region_id: number | null }) {
  // Kategori ATAU daerah yang sama.
  const filters = [`category.eq.${article.category}`, article.region_id ? `region_id.eq.${Number(article.region_id)}` : null].filter(Boolean);
  const res = await db
    .from("cultural_articles")
    .select(ARTICLE_CARD_FIELDS)
    .eq("is_published", true)
    .neq("id", article.id)
    .or(filters.join(","))
    .order("id", { ascending: false })
    .limit(3);
  return res.data ?? [];
}

export async function getReadArticleIds(db: DB, userId: string) {
  const rows = must(
    "Gagal memuat riwayat baca",
    await db.from("user_article_reads").select("article_id").eq("user_id", userId),
  );
  return new Set(rows.map((r) => r.article_id));
}
