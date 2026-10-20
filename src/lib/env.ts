export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const USE_MOCK_CHAT = process.env.NEXT_PUBLIC_USE_MOCK_CHAT === "true";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";
/** Client ID OAuth Google (publik). Mengaktifkan tombol resmi Google + signInWithIdToken. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

/**
 * Peringatan dini untuk kesalahan konfigurasi yang umum:
 * URL dashboard (supabase.com/dashboard/…) atau salah ketik domain (.supabase.com).
 * URL API yang benar: https://<project-ref>.supabase.co (atau http://127.0.0.1:54321 untuk lokal).
 */
if (process.env.NODE_ENV !== "production" && typeof window === "undefined" && SUPABASE_URL) {
  const ok = /^https:\/\/[a-z0-9]{20}\.supabase\.co\/?$/.test(SUPABASE_URL) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(SUPABASE_URL);
  if (!ok) {
    console.warn(
      `\n[Nusa Lingua] NEXT_PUBLIC_SUPABASE_URL tampak tidak valid: "${SUPABASE_URL}".\n` +
        "  Gunakan URL API proyek, contoh: https://abcdefghijklmnopqrst.supabase.co\n" +
        "  (Dashboard → Project Settings → Data API → Project URL)\n",
    );
  }
}
