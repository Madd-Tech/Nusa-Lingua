import "server-only";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Provider login yang aktif di proyek Supabase (endpoint publik /auth/v1/settings).
 * `null` = status tidak diketahui (jaringan/konfigurasi bermasalah) → UI tetap menampilkan tombol.
 * Di-cache 5 menit agar tidak membebani halaman masuk/daftar.
 */
export async function getOAuthProviders(): Promise<{ google: boolean | null }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { google: null };
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_ANON_KEY },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { google: null };
    const json = (await res.json()) as { external?: Record<string, boolean> };
    return { google: typeof json.external?.google === "boolean" ? json.external.google : null };
  } catch {
    return { google: null };
  }
}
