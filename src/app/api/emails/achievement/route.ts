import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { generateAchievementEmail } from "@/lib/email-templates";

/**
 * POST /api/emails/achievement
 *
 * Kirim notifikasi email saat user mendapatkan pencapaian baru.
 * Body: { achievementId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Ambil user yang sedang login
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Tidak terautentikasi" },
        { status: 401 },
      );
    }

    // Parse body
    const body = await request.json().catch(() => null);
    const achievementId = body?.achievementId;

    if (!achievementId) {
      return NextResponse.json(
        { error: "achievementId diperlukan" },
        { status: 400 },
      );
    }

    // Ambil profil user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, username")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profil tidak ditemukan" },
        { status: 404 },
      );
    }

    // Ambil detail pencapaian dari database
    const { data: achievement, error: achievementError } = await supabase
      .from("achievements")
      .select("name, description, icon_url")
      .eq("id", achievementId)
      .single();

    if (achievementError || !achievement) {
      return NextResponse.json(
        { error: "Pencapaian tidak ditemukan" },
        { status: 404 },
      );
    }

    const name = profile.full_name || profile.username || "Learner";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nusalingua.id";

    // Generate dan kirim email
    const html = generateAchievementEmail({
      name,
      achievementName: achievement.name,
      achievementDescription: achievement.description ?? "",
      achievementIcon: achievement.icon_url ?? "🏅",
      siteUrl,
    });

    const result = await sendEmail({
      to: user.email!,
      subject: `🏅 Pencapaian Baru: ${achievement.name} — Nusa Lingua`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("[api/emails/achievement]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
