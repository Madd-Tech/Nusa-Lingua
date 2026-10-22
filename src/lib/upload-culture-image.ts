import { createClient } from "@/lib/supabase/client";

export const CULTURE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const EXTENSION: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };

/**
 * Unggah sampul/gambar artikel ke bucket publik `budaya` (<user_id>/<timestamp>.<ext>).
 * Batas & tipe sama dengan bucket di 0007_articles_cms.sql; hanya moderator yang diizinkan policy.
 */
export async function uploadCultureImage(file: File, userId: string): Promise<{ url: string } | { error: string }> {
  const ext = EXTENSION[file.type];
  if (!ext) return { error: "Format gambar harus PNG, JPG, atau WebP." };
  if (file.size > CULTURE_IMAGE_MAX_BYTES) return { error: "Ukuran gambar maksimal 5 MB." };

  const supabase = createClient();
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("budaya").upload(path, file, { contentType: file.type, upsert: false });
  if (error) return { error: "Gambar gagal diunggah. Coba lagi." };
  return { url: supabase.storage.from("budaya").getPublicUrl(path).data.publicUrl };
}
