import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Ketentuan & Privasi" };

export default function KetentuanPage() {
  return (
    <article className="container max-w-3xl pb-16 pt-28">
      <p className="mb-6 rounded-2xl border-2 border-dashed border-secondary/60 bg-secondary/10 px-4 py-3 text-sm font-semibold">
        Draf — ringkasan ini perlu ditinjau tim {SITE.team} sebelum aplikasi dirilis untuk umum.
      </p>
      <h1 className="text-3xl sm:text-4xl">Ketentuan Layanan & Privasi</h1>
      <div className="prose prose-stone mt-6 max-w-none dark:prose-invert">
        <h2>Data yang kami simpan</h2>
        <p>
          Nama, email, username, foto profil, daerah asal, serta progres belajar (XP, streak, hasil lesson, penguasaan kosakata,
          artikel yang dibaca, dan riwayat obrolan dengan asisten AI). Data dipakai hanya untuk menjalankan fitur {SITE.name}.
        </p>
        <h2>Kontribusi komunitas</h2>
        <p>
          Kosakata dan rekaman suara yang kamu kirim akan ditinjau moderator. Jika disetujui, kontribusi dapat ditampilkan kepada
          pengguna lain di kamus.
        </p>
        <h2>Asisten AI</h2>
        <p>
          Jawaban asisten AI dihasilkan mesin dan bisa keliru. Jangan membagikan informasi pribadi yang sensitif dalam obrolan.
        </p>
        <h2>Perilaku pengguna</h2>
        <p>Gunakan bahasa yang sopan. Konten yang menyinggung SARA atau melanggar hukum akan dihapus.</p>
      </div>
    </article>
  );
}
