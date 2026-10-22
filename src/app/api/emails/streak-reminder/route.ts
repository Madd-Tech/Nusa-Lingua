import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { generateStreakReminderEmail } from "@/lib/email-templates";

/**
 * POST /api/emails/streak-reminder
 *
 * Endpoint untuk cron job — kirim email pengingat streak ke semua user
 * yang punya streak aktif tapi belum belajar hari ini.
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

    // Dapatkan waktu saat ini dalam WIB (UTC+7)
    const now = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const wibNow = new Date(now.getTime() + wibOffset);
    const todayWIB = wibNow.toISOString().split("T")[0]; // YYYY-MM-DD

    // Cari user yang punya streak > 0
    const { data: activeStreakUsers, error: usersError } = await supabase
      .from("profiles")
      .select("id, full_name, username, current_streak")
      .gt("current_streak", 0);

    if (usersError) {
      console.error("[streak-reminder] Error fetching users:", usersError);
      return NextResponse.json(
        { error: "Gagal mengambil data user" },
        { status: 500 },
      );
    }

    if (!activeStreakUsers || activeStreakUsers.length === 0) {
      return NextResponse.json({ sent: 0, message: "Tidak ada user dengan streak aktif" });
    }

    // Cek mana yang sudah belajar hari ini (ada xp_logs hari ini WIB)
    const userIds = activeStreakUsers.map((u) => u.id);

    const { data: todayLogs, error: logsError } = await supabase
      .from("xp_logs")
      .select("user_id")
      .in("user_id", userIds)
      .gte("created_at", `${todayWIB}T00:00:00+07:00`)
      .lt("created_at", `${todayWIB}T23:59:59+07:00`);

    if (logsError) {
      console.error("[streak-reminder] Error fetching logs:", logsError);
      return NextResponse.json(
        { error: "Gagal mengambil data aktivitas" },
        { status: 500 },
      );
    }

    const activeToday = new Set((todayLogs || []).map((l) => l.user_id));

    // Filter user yang belum belajar hari ini
    const usersToRemind = activeStreakUsers.filter(
      (u) => !activeToday.has(u.id),
    );

    if (usersToRemind.length === 0) {
      return NextResponse.json({
        sent: 0,
        message: "Semua user dengan streak sudah belajar hari ini",
      });
    }

    // Ambil email user dari auth.users (perlu admin client)
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nusalingua.id";

    let sentCount = 0;
    const errors: string[] = [];

    for (const profile of usersToRemind) {
      // Ambil email dari auth.users
      const { data: authUser, error: authError } =
        await supabase.auth.admin.getUserById(profile.id);

      if (authError || !authUser?.user?.email) {
        errors.push(`Skip ${profile.id}: no email`);
        continue;
      }

      const name =
        profile.full_name || profile.username || "Learner";

      const html = generateStreakReminderEmail({
        name,
        currentStreak: profile.current_streak,
        siteUrl,
      });

      const result = await sendEmail({
        to: authUser.user.email,
        subject: `🔥 Streak ${profile.current_streak} harimu hampir berakhir! — Nusa Lingua`,
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
      total: usersToRemind.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[api/emails/streak-reminder]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
