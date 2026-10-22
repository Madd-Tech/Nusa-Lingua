import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import { generateWelcomeEmail } from "@/lib/email-templates";

/**
 * POST /api/emails/welcome
 *
 * Kirim email selamat datang setelah user menyelesaikan onboarding.
 * Dipanggil dari client setelah proses onboarding selesai.
 */
export async function POST() {
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

    // Ambil profil user dari database
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

    const name = profile.full_name || profile.username || "Learner";
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://nusalingua.id";

    // Generate dan kirim email
    const html = generateWelcomeEmail({ name, siteUrl });

    const result = await sendEmail({
      to: user.email!,
      subject: `Selamat Datang di Nusa Lingua, ${name}! 🎉`,
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
    console.error("[api/emails/welcome]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
