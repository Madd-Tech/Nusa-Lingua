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
          Kosakata dan rekaman suara yang kamu kirim akan ditinjau moderator. Moderator dapat merapikan ejaan atau arti sebelum
          menyetujuinya, atau menolaknya dengan alasan yang bisa kamu lihat di halaman Kontribusi. Jika disetujui, kontribusi
          ditampilkan kepada pengguna lain di kamus beserta username-mu sebagai kontributor, dan kamu mendapat XP.
        </p>
        <h2>Asisten AI</h2>
        <p>
          Jawaban asisten AI dihasilkan mesin dan bisa keliru. Jangan membagikan informasi pribadi yang sensitif dalam obrolan.
        </p>
        <h2>Perilaku pengguna</h2>
        <p>Gunakan bahasa yang sopan. Konten yang menyinggung SARA atau melanggar hukum akan dihapus.</p>
        <h2 id="sumber-data">Sumber data</h2>
        <p>
          Sebagian besar kosakata, lesson, dan soal untuk bahasa Aceh, Bali, Banjar, Batak Toba, Bugis, Dayak Ngaju, Jawa, Madura,
          Minangkabau, dan Sunda berasal dari <strong>Basanusa Dataset v1.0</strong>, yang disusun dari{" "}
          <a href="https://github.com/IndoNLP/nusax" target="_blank" rel="noopener noreferrer">
            NusaX
          </a>{" "}
          (Winata dkk., &ldquo;NusaX: Multilingual Parallel Sentiment Dataset for 10 Indonesian Local Languages&rdquo;, EACL 2023)
          dan kamus-sunda (KatowProject). Data turunan ini dibagikan dengan lisensi{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.id" target="_blank" rel="noopener noreferrer">
            CC BY-SA 4.0
          </a>
          .
        </p>
        <p>
          Data tersebut belum diverifikasi penutur asli. Jika menemukan kata atau arti yang keliru, bantu kami memperbaikinya
          lewat menu Kontribusi.
        </p>
      </div>
    </article>
  );
}
