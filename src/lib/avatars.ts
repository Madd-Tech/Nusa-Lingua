import type { BrowserSupabase } from "@/lib/supabase/client";

/** Avatar bawaan (public/avatars). Disimpan ke profiles.avatar_url sebagai path relatif. */
export const PRESET_AVATARS = [
  { src: "/avatars/blangkon.svg", label: "Blangkon" },
  { src: "/avatars/kerudung.svg", label: "Kerudung" },
  { src: "/avatars/peci.svg", label: "Peci" },
  { src: "/avatars/sanggul.svg", label: "Sanggul" },
  { src: "/avatars/ikat.svg", label: "Ikat kepala" },
  { src: "/avatars/rambut-pendek.svg", label: "Rambut pendek" },
  { src: "/avatars/caping.svg", label: "Caping" },
  { src: "/avatars/bunga.svg", label: "Bunga" },
];

/** Bucket untuk foto profil unggahan. Asumsi: bucket publik "avatars", path <user_id>/<timestamp>.<ext>. */
export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;

export async function uploadAvatar(supabase: BrowserSupabase, userId: string, file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Berkas harus berupa gambar.");
  if (file.size > AVATAR_MAX_BYTES) throw new Error("Ukuran gambar maksimal 2 MB.");
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error("Gagal mengunggah foto. Coba lagi.");
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}
