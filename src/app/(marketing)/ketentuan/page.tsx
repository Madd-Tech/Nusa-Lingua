import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ketentuan & Privasi",
  description: `Ketentuan Layanan dan Kebijakan Privasi ${SITE.name}.`,
};

type Section = { id: string; title: string; body: React.ReactNode };

const MAIL = (
  <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>
);

const PARTS: { title: string; sections: Section[] }[] = [
  {
    title: "Ketentuan Layanan",
    sections: [
      {
        id: "tentang-layanan",
        title: "Tentang Layanan",
        body: (
          <p>
            {SITE.name} adalah platform pembelajaran bahasa daerah Indonesia yang menyediakan lesson interaktif, kamus dengan
            tingkat tutur, artikel sejarah dan budaya, papan peringkat, fitur kontribusi komunitas, serta asisten percakapan
            berbasis kecerdasan buatan (AI). Saat ini layanan disediakan tanpa biaya untuk tujuan edukasi.
          </p>
        ),
      },
      {
        id: "akun",
        title: "Akun Pengguna",
        body: (
          <>
            <p>Sebagian besar fitur memerlukan akun yang dibuat dengan alamat email atau akun Google. Dengan membuat akun, Anda setuju untuk:</p>
            <ul>
              <li>memberikan informasi yang benar dan memperbaruinya bila terjadi perubahan;</li>
              <li>menjaga kerahasiaan kata sandi serta bertanggung jawab atas seluruh aktivitas yang terjadi di akun Anda;</li>
              <li>tidak memindahtangankan akun kepada orang lain; dan</li>
              <li>segera menghubungi kami bila mencurigai adanya akses tanpa izin.</li>
            </ul>
            <p>
              Username Anda dapat dilihat pengguna lain. Hindari username yang memuat data pribadi atau kata yang tidak pantas.
            </p>
          </>
        ),
      },
      {
        id: "kontribusi",
        title: "Kontribusi Komunitas",
        body: (
          <>
            <p>
              Anda dapat mengusulkan kosakata, arti, dan rekaman pelafalan melalui halaman{" "}
              <Link href="/kontribusi">Kontribusi</Link>. Setiap usulan ditinjau moderator sebelum dipublikasikan. Moderator
              dapat merapikan ejaan atau arti, menyetujui, atau menolak usulan dengan menyertakan alasan yang dapat Anda lihat di
              halaman tersebut. Usulan yang masih menunggu tinjauan dapat Anda batalkan sendiri.
            </p>
            <p>
              Kontribusi yang disetujui akan ditampilkan di kamus beserta username Anda sebagai kontributor, dan Anda akan
              memperoleh XP. Dengan mengirimkan kontribusi, Anda menyatakan bahwa konten tersebut adalah karya Anda sendiri atau
              Anda berhak membagikannya, serta memberikan izin non-eksklusif dan bebas royalti kepada {SITE.name} untuk
              menyimpan, menyunting, menampilkan, dan menyebarluaskannya sebagai bagian dari layanan.
            </p>
          </>
        ),
      },
      {
        id: "perilaku",
        title: "Pedoman Perilaku",
        body: (
          <>
            <p>Demi menjaga komunitas yang aman dan saling menghormati, Anda dilarang:</p>
            <ul>
              <li>mengirim konten yang mengandung unsur SARA, ujaran kebencian, pornografi, kekerasan, atau melanggar hukum;</li>
              <li>melecehkan, mengancam, atau menyamar sebagai orang lain;</li>
              <li>mengirim spam, promosi, atau informasi yang sengaja menyesatkan;</li>
              <li>menyalahgunakan fitur pelaporan maupun sistem XP, termasuk dengan bot atau skrip otomatis; dan</li>
              <li>mencoba mengganggu, meretas, atau mengakses sistem maupun data pengguna lain tanpa izin.</li>
            </ul>
            <p>
              Konten yang melanggar pedoman ini akan dihapus. Jika menemukan kesalahan pada kamus atau artikel, gunakan tombol
              &ldquo;Laporkan kesalahan&rdquo;. Laporan Anda akan ditinjau moderator, dan hasilnya dapat dipantau di halaman
              Kontribusi.
            </p>
          </>
        ),
      },
      {
        id: "asisten-ai",
        title: "Asisten AI",
        body: (
          <p>
            Fitur Teman Ngobrol AI menggunakan model bahasa Gemini dari Google. Jawaban dihasilkan secara otomatis, dapat
            mengandung kekeliruan, dan tidak mewakili pandangan {SITE.name}. Mohon periksa kembali informasi penting melalui
            sumber tepercaya, dan jangan membagikan data pribadi yang sensitif—seperti NIK, nomor rekening, kata sandi, atau
            informasi kesehatan—dalam percakapan.
          </p>
        ),
      },
      {
        id: "hak-cipta",
        title: "Hak Kekayaan Intelektual",
        body: (
          <p>
            Nama, logo, desain, kode, materi lesson, dan artikel {SITE.name} dilindungi hak cipta, kecuali dinyatakan lain. Anda
            boleh menggunakannya untuk keperluan belajar pribadi, tetapi tidak untuk disalin, dijual, atau didistribusikan ulang
            secara komersial tanpa izin tertulis dari kami. Materi yang berasal dari data pihak ketiga tetap tunduk pada lisensi
            aslinya sebagaimana dijelaskan di bagian <a href="#sumber-data">Sumber Data &amp; Atribusi</a>.
          </p>
        ),
      },
      {
        id: "penangguhan",
        title: "Penangguhan & Penutupan Akun",
        body: (
          <p>
            Kami berhak membatasi, menangguhkan, atau menutup akun yang melanggar ketentuan ini, membahayakan pengguna lain, atau
            mengganggu jalannya layanan. Anda pun dapat berhenti menggunakan layanan kapan saja dan meminta penghapusan akun
            sebagaimana dijelaskan di bagian <a href="#hak-anda">Hak Anda</a>.
          </p>
        ),
      },
      {
        id: "tanggung-jawab",
        title: "Batasan Tanggung Jawab",
        body: (
          <p>
            {SITE.name} disediakan &ldquo;sebagaimana adanya&rdquo; untuk tujuan edukasi. Kami berupaya menjaga keakuratan
            materi dan ketersediaan layanan, namun tidak menjamin layanan selalu bebas gangguan, bebas galat, atau sepenuhnya
            akurat—terutama untuk materi yang belum diverifikasi penutur asli. Sejauh diizinkan oleh hukum, kami tidak
            bertanggung jawab atas kerugian yang timbul dari penggunaan atau ketidakmampuan menggunakan layanan.
          </p>
        ),
      },
    ],
  },
  {
    title: "Kebijakan Privasi",
    sections: [
      {
        id: "data-dikumpulkan",
        title: "Data yang Kami Kumpulkan",
        body: (
          <ul>
            <li>
              <strong>Data akun</strong> — nama, alamat email, username, dan kata sandi (disimpan dalam bentuk tersandi sehingga
              tidak dapat kami lihat), serta profil dasar dari Google bila Anda masuk dengan akun Google.
            </li>
            <li>
              <strong>Data profil</strong> — foto profil dan daerah asal.
            </li>
            <li>
              <strong>Data pembelajaran</strong> — XP, streak, hasil lesson, penguasaan kosakata, dan artikel yang dibaca.
            </li>
            <li>
              <strong>Konten yang Anda kirim</strong> — usulan kosakata, rekaman pelafalan, laporan kesalahan, dan riwayat
              percakapan dengan asisten AI.
            </li>
            <li>
              <strong>Data teknis</strong> — cookie sesi yang diperlukan agar Anda tetap masuk, serta preferensi aplikasi seperti
              mode gelap dan efek suara.
            </li>
          </ul>
        ),
      },
      {
        id: "penggunaan-data",
        title: "Cara Kami Menggunakan Data",
        body: (
          <>
            <p>Data Anda kami gunakan untuk:</p>
            <ul>
              <li>menjalankan fitur, menyimpan progres, dan menyesuaikan materi belajar;</li>
              <li>menampilkan papan peringkat dan atribusi kontributor;</li>
              <li>
                mengirim email layanan, seperti konfirmasi akun, ucapan selamat datang, notifikasi pencapaian, pengingat streak
                harian, dan ringkasan progres mingguan;
              </li>
              <li>meninjau kontribusi dan laporan kesalahan;</li>
              <li>menjaga keamanan akun dan mencegah penyalahgunaan; serta</li>
              <li>memperbaiki dan mengembangkan layanan.</li>
            </ul>
            <p>
              Kami <strong>tidak menjual</strong> data pribadi Anda dan tidak menggunakannya untuk keperluan iklan.
            </p>
          </>
        ),
      },
      {
        id: "data-publik",
        title: "Informasi yang Terlihat oleh Pengguna Lain",
        body: (
          <p>
            Nama atau username, foto profil, daerah asal, dan perolehan XP Anda dapat terlihat di papan peringkat. Username Anda
            juga tercantum sebagai kontributor pada entri kamus yang disetujui, dan rekaman pelafalan yang disetujui dapat
            diputar oleh pengguna lain. Alamat email dan riwayat percakapan AI Anda tidak pernah ditampilkan kepada pengguna lain.
          </p>
        ),
      },
      {
        id: "pihak-ketiga",
        title: "Penyedia Layanan Pihak Ketiga",
        body: (
          <>
            <p>
              Untuk menjalankan layanan, kami bekerja sama dengan penyedia berikut. Mereka hanya memproses data sesuai keperluan
              fungsinya:
            </p>
            <ul>
              <li>
                <strong>Supabase</strong> — basis data, autentikasi, dan penyimpanan berkas (foto profil, rekaman, dan gambar).
              </li>
              <li>
                <strong>Google</strong> — masuk dengan akun Google dan pemrosesan pesan oleh model AI Gemini.
              </li>
              <li>
                <strong>Resend</strong> — pengiriman email.
              </li>
              <li>
                <strong>Vercel</strong> — hosting dan infrastruktur situs.
              </li>
            </ul>
            <p>
              Latihan pengucapan memakai fitur pengenalan suara bawaan peramban Anda. Suara tersebut diproses oleh peramban dan
              penyedianya, dan tidak kami simpan. Sebagian data dapat diproses di server yang berlokasi di luar Indonesia.
            </p>
          </>
        ),
      },
      {
        id: "keamanan",
        title: "Penyimpanan & Keamanan Data",
        body: (
          <p>
            Data Anda disimpan selama akun Anda aktif atau selama diperlukan untuk menjalankan layanan. Kami menerapkan langkah
            pengamanan yang wajar, antara lain koneksi terenkripsi (HTTPS) dan pembatasan akses sehingga setiap pengguna hanya
            dapat mengubah datanya sendiri. Meski demikian, tidak ada sistem yang sepenuhnya aman, sehingga kami tidak dapat
            menjamin keamanan data secara mutlak.
          </p>
        ),
      },
      {
        id: "hak-anda",
        title: "Hak Anda",
        body: (
          <>
            <p>Sesuai peraturan pelindungan data pribadi yang berlaku, Anda berhak untuk:</p>
            <ul>
              <li>
                melihat dan memperbarui data profil maupun kata sandi melalui halaman{" "}
                <Link href="/profil/pengaturan">Pengaturan</Link>;
              </li>
              <li>
                menghapus riwayat percakapan dengan asisten AI kapan saja melalui halaman <Link href="/asisten">Asisten</Link>;
              </li>
              <li>membatalkan usulan kontribusi yang masih menunggu tinjauan;</li>
              <li>meminta salinan data pribadi Anda, atau penghapusan akun beserta datanya; dan</li>
              <li>berhenti menerima email pengingat dan ringkasan progres.</li>
            </ul>
            <p>
              Untuk dua permintaan terakhir, silakan hubungi kami di {MAIL}. Kami akan menindaklanjutinya dalam waktu yang wajar.
            </p>
          </>
        ),
      },
      {
        id: "pengguna-anak",
        title: "Pengguna di Bawah Umur",
        body: (
          <p>
            Pengguna yang belum berusia 18 tahun wajib mendapatkan persetujuan dan pendampingan orang tua atau wali saat membuat
            akun. Jika Anda adalah orang tua atau wali dan mengetahui anak Anda memberikan data pribadi tanpa persetujuan,
            hubungi kami agar data tersebut dapat dihapus.
          </p>
        ),
      },
    ],
  },
  {
    title: "Ketentuan Lainnya",
    sections: [
      {
        id: "sumber-data",
        title: "Sumber Data & Atribusi",
        body: (
          <>
            <p>
              Sebagian besar kosakata, lesson, dan soal untuk bahasa Aceh, Bali, Banjar, Batak Toba, Bugis, Dayak Ngaju, Jawa,
              Madura, Minangkabau, dan Sunda berasal dari <strong>Basanusa Dataset v1.0</strong>, yang disusun dari{" "}
              <a href="https://github.com/IndoNLP/nusax" target="_blank" rel="noopener noreferrer">
                NusaX
              </a>{" "}
              (Winata dkk., &ldquo;NusaX: Multilingual Parallel Sentiment Dataset for 10 Indonesian Local Languages&rdquo;, EACL
              2023) dan kamus-sunda (KatowProject). Data turunan tersebut dibagikan di bawah lisensi{" "}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.id" target="_blank" rel="noopener noreferrer">
                CC BY-SA 4.0
              </a>
              .
            </p>
            <p>
              Data tersebut belum diverifikasi oleh penutur asli. Jika Anda menemukan kata atau arti yang keliru, bantu kami
              memperbaikinya melalui halaman <Link href="/kontribusi">Kontribusi</Link>.
            </p>
          </>
        ),
      },
      {
        id: "perubahan",
        title: "Perubahan Ketentuan",
        body: (
          <p>
            Kami dapat memperbarui dokumen ini sewaktu-waktu untuk menyesuaikan perubahan fitur atau peraturan. Tanggal
            pembaruan terakhir tercantum di bagian atas halaman ini. Untuk perubahan yang signifikan, kami akan memberi tahu Anda
            melalui email atau pemberitahuan di aplikasi. Dengan tetap menggunakan layanan setelah perubahan berlaku, Anda
            dianggap menyetujui ketentuan yang telah diperbarui.
          </p>
        ),
      },
      {
        id: "hukum",
        title: "Hukum yang Berlaku",
        body: (
          <p>
            Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Republik Indonesia, termasuk Undang-Undang Nomor 27
            Tahun 2022 tentang Pelindungan Data Pribadi. Setiap perselisihan akan diupayakan untuk diselesaikan terlebih dahulu
            secara musyawarah.
          </p>
        ),
      },
      {
        id: "kontak",
        title: "Hubungi Kami",
        body: (
          <p>
            Jika Anda memiliki pertanyaan, keluhan, atau permintaan terkait ketentuan ini maupun data pribadi Anda, silakan
            hubungi kami melalui email {MAIL}.
          </p>
        ),
      },
    ],
  },
];

export default function KetentuanPage() {
  let n = 0;
  const numbered = PARTS.map((part) => ({
    ...part,
    sections: part.sections.map((s) => ({ ...s, no: ++n })),
  }));

  return (
    <article className="container max-w-3xl pb-16 pt-28">
      <header>
        <p className="text-sm font-bold uppercase tracking-wider text-primary-700 dark:text-primary">Dokumen Legal</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Ketentuan Layanan &amp; Kebijakan Privasi</h1>
        <p className="mt-3 text-sm text-muted-foreground">Terakhir diperbarui: {SITE.termsUpdatedAt}</p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          Selamat datang di {SITE.name}. Dokumen ini menjelaskan aturan penggunaan layanan kami, serta bagaimana kami
          mengumpulkan, menggunakan, dan melindungi data pribadi Anda. Dengan membuat akun atau menggunakan {SITE.name}, Anda
          menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan berikut.
        </p>
      </header>

      <nav aria-label="Daftar isi" className="mt-8 rounded-2xl border-2 bg-card p-5 sm:p-6">
        <p className="font-bold">Daftar Isi</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {numbered.map((part) => (
            <div key={part.title}>
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{part.title}</p>
              <ol className="mt-2 space-y-1.5 text-sm">
                {part.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:text-primary-700 hover:underline dark:hover:text-primary">
                      {s.no}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </nav>

      <div className="prose prose-stone mt-10 max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary-700 dark:prose-a:text-primary">
        {numbered.map((part, i) => (
          <section key={part.title} aria-labelledby={`bagian-${i}`}>
            <p
              id={`bagian-${i}`}
              className={`!mb-0 border-b-2 pb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground ${i === 0 ? "mt-0" : "mt-14"}`}
            >
              Bagian {String.fromCharCode(65 + i)} · {part.title}
            </p>
            {part.sections.map((s) => (
              <div key={s.id}>
                <h2 id={s.id}>
                  {s.no}. {s.title}
                </h2>
                {s.body}
              </div>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
