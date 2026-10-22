import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { generateWeeklyProgressEmail } from "@/lib/email-templates";

/**
 * POST /api/emails/weekly-progress
 *
 * Endpoint untuk cron job — kirim ringkasan progres mingguan ke semua user aktif.
 *
 * Headers: { Authorization: "Bearer <CRON_SECRET>" }
 */
export async function POST(request: NextRequest) {
  try {
    // Verifikasi cron secret
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");

    if (cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    const supabase = createAdminClient();

    // Hitung range 7 hari terakhir (WIB)
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibNow = new Date(now.getTime() + wibOffset);

    const weekAgo = new Date(wibNow.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoISO = weekAgo.toISOString();

    // Ambil semua user yang punya aktivitas (xp_logs) dalam 7 hari terakhir
    const { data: weeklyXpLogs, error: xpError } = await supabase
      .from("xp_logs")
      .select("user_id, amount")
      .gte("created_at", weekAgoISO);

    if (xpError) {
      console.error("[weekly-progress] Error fetching xp_logs:", xpError);
      return NextResponse.json(
        { error: "Gagal mengambil data XP" },
        { status: 500 },
      );
    }

    if (!weeklyXpLogs || weeklyXpLogs.length === 0) {
      return NextResponse.json({
        sent: 0,
        message: "Tidak ada user aktif minggu ini",
      });
    }

    // Kelompokkan XP per user
    const userXpMap = new Map<string, number>();
    for (const log of weeklyXpLogs) {
      const current = userXpMap.get(log.user_id) || 0;
      userXpMap.set(log.user_id, current + (log.amount || 0));
    }

    const userIds = Array.from(userXpMap.keys());

    // Ambil data profil user
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, username, current_streak")
      .in("id", userIds);

    if (profilesError) {
      console.error("[weekly-progress] Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Gagal mengambil profil" },
        { status: 500 },
      );
    }

    // Ambil jumlah lesson yang diselesaikan per user minggu ini
    const { data: weeklyLessons, error: lessonsError } = await supabase
      .from("user_lesson_progress")
      .select("user_id")
      .in("user_id", userIds)
      .eq("status", "completed")
      .gte("completed_at", weekAgoISO);

    if (lessonsError) {
      console.error("[weekly-progress] Error fetching lessons:", lessonsError);
    }

    const userLessonsMap = new Map<string, number>();
    for (const lesson of weeklyLessons || []) {
      const current = userLessonsMap.get(lesson.user_id) || 0;
      userLessonsMap.set(lesson.user_id, current + 1);
    }

    // Ambil jumlah vocab yang dikuasai per user (total, karena tabel tidak punya created_at)
    const { data: weeklyVocab, error: vocabError } = await supabase
      .from("user_vocab_mastery")
      .select("user_id")
      .in("user_id", userIds);

    if (vocabError) {
      console.error("[weekly-progress] Error fetching vocab:", vocabError);
    }

    const userVocabMap = new Map<string, number>();
    for (const vocab of weeklyVocab || []) {
      const current = userVocabMap.get(vocab.user_id) || 0;
      userVocabMap.set(vocab.user_id, current + 1);
    }

    // Ambil leaderboard mingguan untuk ranking
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from("weekly_leaderboard")
      .select("user_id, weekly_xp")
      .order("weekly_xp", { ascending: false });

    const rankMap = new Map<string, number>();
    if (!leaderboardError && leaderboard) {
      leaderboard.forEach((entry, idx) => {
        if (entry.user_id) {
          rankMap.set(entry.user_id, idx + 1);
        }
      });
    }

    // Kirim email ke setiap user
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nusalingua.id";

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of profiles || []) {
      // Ambil email dari auth.users
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (authError || !authUser?.user?.email) {
        errors.push(`Skip ${profile.id}: no email`);
        continue;
      }

      const name =
        profile.full_name || profile.username || "Learner";

      const html = generateWeeklyProgressEmail({
        name,
        xpGained: userXpMap.get(profile.id) || 0,
        lessonsCompleted: userLessonsMap.get(profile.id) || 0,
        wordsLearned: userVocabMap.get(profile.id) || 0,
        streak: profile.current_streak || 0,
        rank: rankMap.get(profile.id),
        siteUrl,
      });

      const result = await sendEmail({
        to: authUser.user.email,
        subject: `📊 Ringkasan Mingguanmu — Nusa Lingua`,
        html,
      });

      if (result.success) {
        sentCount++;
      } else {
        errors.push(`Failed ${profile.id}: ${result.error}`);
      }
    }

    return NextResponse.json({
      sent: sentCount,
      total: userIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[api/emails/weekly-progress]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
