import type { DB } from "./_shared";
import { must } from "./_shared";

export async function getWeeklyLeaderboard(db: DB, opts: { regionId?: number; limit?: number } = {}) {
  let query = db
    .from("weekly_leaderboard")
    .select("user_id, username, avatar_url, home_region_id, weekly_xp")
    .order("weekly_xp", { ascending: false })
    .limit(opts.limit ?? 50);
  if (opts.regionId) query = query.eq("home_region_id", opts.regionId);
  return must("Gagal memuat peringkat", await query);
}

export type LeaderboardRow = Awaited<ReturnType<typeof getWeeklyLeaderboard>>[number];

/** Posisi user saat ini (1-based) dan XP mingguannya; null bila belum ada XP minggu ini. */
export async function getMyWeeklyRank(db: DB, userId: string, opts: { regionId?: number } = {}) {
  const mine = await db
    .from("weekly_leaderboard")
    .select("user_id, username, avatar_url, home_region_id, weekly_xp")
    .eq("user_id", userId)
    .maybeSingle();
  if (mine.error || !mine.data) return null;

  let ahead = db
    .from("weekly_leaderboard")
    .select("user_id", { count: "exact", head: true })
    .gt("weekly_xp", mine.data.weekly_xp ?? 0);
  if (opts.regionId) ahead = ahead.eq("home_region_id", opts.regionId);
  const res = await ahead;
  if (res.error) return null;
  return { row: mine.data, rank: (res.count ?? 0) + 1 };
}
