import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Pesan ramah untuk error RPC moderasi & kontribusi.
 * Kode khusus NLxxx berasal dari supabase/migrations/0005_moderation_core.sql;
 * pesan NL422/NL429 sudah ditulis dalam Bahasa Indonesia oleh database.
 */
export function moderationErrorMessage(
  error: Pick<PostgrestError, "code" | "message"> | null | undefined,
  fallback = "Gagal menyimpan. Coba lagi.",
) {
  switch (error?.code) {
    case "NL409":
      return "Usulan ini sudah ditinjau moderator lain.";
    case "NL422":
    case "NL429":
      return error.message;
    case "42501":
      return "Kamu tidak punya wewenang untuk tindakan ini.";
    case "P0002":
      return "Data tidak ditemukan, mungkin sudah dihapus.";
    case "28000":
      return "Sesi berakhir. Silakan masuk lagi.";
    default:
      return fallback;
  }
}
