import { z } from "zod";

export const emailSchema = z
  .string({ required_error: "Email wajib diisi" })
  .trim()
  .min(1, "Email wajib diisi")
  .email("Format email belum benar");

export const passwordSchema = z
  .string({ required_error: "Kata sandi wajib diisi" })
  .min(8, "Kata sandi minimal 8 karakter")
  .max(72, "Kata sandi maksimal 72 karakter");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
    email: emailSchema,
    password: passwordSchema,
    confirm: z.string().min(1, "Ulangi kata sandi"),
    agree: z.boolean().refine((v) => v, "Kamu perlu menyetujui ketentuan untuk mendaftar"),
  })
  .refine((v) => v.password === v.confirm, { message: "Konfirmasi kata sandi tidak sama", path: ["confirm"] });

/** Skor kekuatan kata sandi 0–4 (heuristik sederhana). */
export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 0.5;
  return Math.min(4, Math.floor(score));
}

export const forgotSchema = z.object({ email: emailSchema });

export const resetSchema = z
  .object({ password: passwordSchema, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "Konfirmasi kata sandi tidak sama", path: ["confirm"] });

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username minimal 3 karakter")
  .max(20, "Username maksimal 20 karakter")
  .regex(/^[a-z0-9_]+$/, "Hanya huruf kecil, angka, dan garis bawah (_)");

export const onboardingSchema = z.object({
  username: usernameSchema,
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
  avatarUrl: z.string().nullable(),
  /** 0 = belum memilih (opsional). */
  homeRegionId: z.coerce.number().int().nonnegative(),
  languageId: z.coerce.number().int().nonnegative(),
});

export const profileSettingsSchema = z.object({
  username: usernameSchema,
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(80, "Nama terlalu panjang"),
  avatarUrl: z.string().nullable(),
  homeRegionId: z.coerce.number().int().nonnegative(),
});

export const changePasswordSchema = resetSchema;

export const submissionSchema = z.object({
  languageId: z.coerce.number({ invalid_type_error: "Pilih bahasa" }).int().positive("Pilih bahasa"),
  word: z.string().trim().min(1, "Kata wajib diisi").max(80, "Kata terlalu panjang"),
  meaningId: z.string().trim().min(1, "Arti wajib diisi").max(200, "Arti terlalu panjang"),
});

const optionalText = (max: number, label: string) =>
  z.string().trim().max(max, `${label} maksimal ${max} karakter`).optional().or(z.literal(""));

export const rejectSchema = z.object({
  reason: z.enum(["duplikat", "ejaan", "arti_keliru", "bukan_bahasa_ini", "tidak_pantas", "audio_buruk", "lainnya"], {
    required_error: "Pilih alasan penolakan",
    invalid_type_error: "Pilih alasan penolakan",
  }),
  note: optionalText(500, "Catatan"),
});

export const approveEditSchema = z.object({
  word: z.string().trim().min(1, "Kata wajib diisi").max(80, "Kata terlalu panjang"),
  meaningId: z.string().trim().min(1, "Arti wajib diisi").max(200, "Arti terlalu panjang"),
  speechLevel: optionalText(40, "Tingkat tutur"),
  exampleSentence: optionalText(300, "Contoh kalimat"),
  exampleMeaning: optionalText(300, "Terjemah contoh"),
  note: optionalText(500, "Catatan"),
});

export const ARTICLE_SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const articleSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(160, "Judul maksimal 160 karakter"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug minimal 3 karakter")
    .max(80, "Slug maksimal 80 karakter")
    .regex(ARTICLE_SLUG_PATTERN, "Hanya huruf kecil, angka, dan tanda hubung (-)"),
  category: z.enum(["sejarah", "cerita_rakyat", "tarian", "kuliner", "pakaian_adat", "upacara", "aksara", "lainnya"]),
  languageId: z.coerce.number({ invalid_type_error: "Pilih bahasa" }).int().positive("Pilih bahasa"),
  /** 0 = tanpa daerah. */
  regionId: z.coerce.number().int().nonnegative(),
  summary: optionalText(300, "Ringkasan"),
  content: z.string().max(60000, "Isi artikel terlalu panjang"),
  sources: optionalText(4000, "Rujukan"),
  coverUrl: z.string().nullable(),
});

export const returnArticleSchema = z.object({
  note: z.string().trim().min(1, "Tulis catatan untuk penulis").max(500, "Catatan maksimal 500 karakter"),
});

/** Terjemahkan pesan error Supabase Auth ke Bahasa Indonesia yang ramah. */
export function authErrorMessage(message: string | undefined | null) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau kata sandi salah.";
  if (m.includes("email not confirmed")) return "Email belum dikonfirmasi. Cek kotak masuk emailmu.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Email ini sudah terdaftar. Silakan masuk.";
  if (m.includes("rate limit") || m.includes("too many")) return "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.";
  if (m.includes("password should be") || m.includes("weak password")) return "Kata sandi terlalu lemah. Gunakan minimal 8 karakter.";
  if (m.includes("same password") || m.includes("different from the old")) return "Kata sandi baru harus berbeda dari yang lama.";
  if (m.includes("session") && m.includes("missing")) return "Sesi sudah berakhir. Minta tautan reset baru.";
  if (m.includes("audience") || m.includes("nonce") || m.includes("id_token") || m.includes("id token"))
    return "Gagal memverifikasi akun Google. Muat ulang halaman lalu coba lagi.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider"))
    return "Masuk dengan Google belum diaktifkan. Gunakan email dan kata sandi untuk sementara.";
  if (m.includes("network") || m.includes("fetch")) return "Koneksi bermasalah. Periksa internetmu.";
  return "Terjadi kesalahan. Coba lagi sebentar lagi.";
}
