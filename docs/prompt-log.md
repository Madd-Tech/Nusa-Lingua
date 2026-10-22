# Prompt Log — Nusa Lingua

Dokumen ini mencatat prompt yang diberikan kepada asisten AI selama pengembangan **Nusa Lingua**. Prompt dikelompokkan berdasarkan commit, mulai dari build awal, penambahan fitur, konfigurasi, deploy, hingga debugging.

| Keterangan | Isi |
| --- | --- |
| Pengembang | Deadlyzz021006 (`maddtch@gmail.com`) |
| Repositori / branch | `Madd-Tech/Nusa-Lingua` · `Madd` |
| Asisten AI | Claude Code (aplikasi desktop), model Claude Opus |
| Periode | 15–22 Oktober 2026 |
| Cakupan | 10 commit milik pengembang. Commit anggota tim lain tidak dicantumkan. |
| Zona waktu | WIB (UTC+7) |

> **Catatan penyuntingan.** Redaksi prompt telah dirapikan ke Bahasa Indonesia yang lebih formal dan lengkap. Maksud, urutan, dan cakupan setiap permintaan tetap sama dengan sesi aslinya. Prompt yang terulang atau terpotong digabung menjadi satu. Perintah teknis aplikasi (misalnya penggantian model) tidak dicantumkan.

**Label kategori**

| Label | Arti |
| --- | --- |
| `Build` | Membangun fitur atau modul baru |
| `Perubahan` | Mengubah atau menambah perilaku fitur yang sudah ada |
| `Debugging` | Menelusuri dan memperbaiki error |
| `Konfigurasi` | Menyiapkan environment, database, atau migrasi |
| `Git/Deploy` | Kolaborasi Git, merge, dan deploy ke Vercel |
| `Konsultasi` | Pertanyaan, perencanaan, atau rancangan tanpa perubahan kode langsung |
| `Kontrol` | Instruksi alur kerja, misalnya menunda commit |

---

## Daftar isi

| # | Commit | Waktu commit | Judul commit | Prompt | Fokus |
| --- | --- | --- | --- | --- | --- |
| 1 | `491bedd` | 16 Okt, 19:02 | frontend & backend init | 4 | Fondasi aplikasi, skema database, Google OAuth |
| 2 | `d3d05e2` | 19 Okt, 00:14 | add more language & culture | 9 | 8 bahasa baru, persona AI, artikel budaya |
| 3 | `cca80a5` | 20 Okt, 13:21 | feat: google sign-in (ID token flow) + deploy | 8 | Google Identity Services, font, deploy Vercel |
| 4 | `32fd253` | 21 Okt, 00:03 | set up ai chatbot | 8 | Integrasi Gemini, merge PR tim |
| 5 | `76439de` | 21 Okt, 10:01 | ai persona adjustment | 5 | Pemulihan endpoint AI, toggle terjemahan |
| 6 | `31b8638` | 21 Okt, 21:25 | Moderation flow | 8 | Rancangan moderator, Fase A (P1 & P2) |
| 7 | `b726bd0` | 21 Okt, 21:39 | Merge origin/Madd: resolve conflict layout.tsx | 3 | Resolusi konflik merge |
| 8 | `5bd5d0b` | 21 Okt, 22:38 | moderator dashboard & activity log | 5 | Fase B (P3), perbaikan build Vercel |
| 9 | `7c2cb6f` | 22 Okt, 09:05 | cms article & culture | 4 | Fase C (P4): CMS artikel budaya |
| 10 | `d46a4df` | 22 Okt, 09:38 | Dictionary Report & Management | 2 | Fase D (P5): laporan & kelola kamus |

**Pola kerja yang dipakai sepanjang proyek**
1. Spesifikasi ditulis dulu, lalu dibuat rancangan, lalu diimplementasikan per fase.
2. Setiap migrasi SQL diuji di Postgres lokal sebelum dijalankan ke Supabase lewat CLI (`psql`).
3. Pengembang memverifikasi hasil di aplikasi, lalu melakukan commit dan push sendiri.

---

## Commit 1 — `491bedd` · frontend & backend init

**16 Oktober 2026, 19:02 WIB** · 195 berkas, +23.599 baris

Fondasi Next.js 14 (App Router) dan Supabase: landing page publik, autentikasi, layout terproteksi, fitur Belajar, Ulasan, Kamus, Budaya, Asisten AI, Kontribusi, Peringkat, dan Profil, plus skema database (`0001_schema.sql`, `0002_storage.sql`) dan `seed.sql`.

### Prompt 1.1 · `Build` · 15 Okt, 19:47
> Bertindaklah sebagai senior frontend engineer sekaligus UI designer. Bangun frontend untuk **Nusa Lingua**, platform belajar bahasa daerah Indonesia bergaya Duolingo yang dilengkapi konten sejarah dan budaya, asisten AI berbahasa daerah, kontribusi kosakata dari komunitas, dan gamifikasi. Seluruh teks antarmuka menggunakan Bahasa Indonesia.
>
> - **Stack wajib:** Next.js 14+ App Router dengan TypeScript (utamakan Server Components), Tailwind CSS + shadcn/ui, lucide-react, framer-motion secukupnya, Supabase (`@supabase/supabase-js` + `@supabase/ssr`), react-hook-form + zod, dan sonner. Tipe database dihasilkan dari `supabase gen types`. Service role key hanya boleh dipakai di server.
> - **Aturan akses:** landing page `/` bersifat publik, sedangkan semua fitur wajib login. Middleware harus menyegarkan sesi, mengarahkan tamu ke `/masuk?next=<path>`, mengarahkan pengguna yang sudah login dari `/masuk` atau `/daftar` ke `/beranda`, dan mengarahkan pengguna tanpa username ke `/onboarding`. Semua CTA di landing memakai helper `goToFeature(path)`. Parameter `next` hanya boleh berupa path internal.
> - **Skema database:** gunakan skema Supabase yang sudah ditetapkan (konten, profil, progres, AI, komunitas) tanpa mengubahnya. `system_prompt` persona AI tidak boleh terkirim ke browser. Progres dan XP hanya diubah lewat RPC `complete_lesson`. Jika endpoint chat belum tersedia, sediakan mock di balik flag `NEXT_PUBLIC_USE_MOCK_CHAT`.
> - **Arah visual:** ceria dan ramah dengan identitas Nusantara modern, aksen motif batik tipis, font Plus Jakarta Sans, design token warna per kategori fitur, mendukung dark mode, dan mobile-first.
> - **Standar kualitas:** setiap pengambilan data punya state loading (skeleton), kosong, dan error. Patuhi aksesibilitas WCAG AA, kumpulkan query bertipe di `src/lib/queries`, dan jangan menampilkan data palsu seolah-olah nyata.

**Hasil:** Fondasi proyek, lapisan Supabase, middleware, komponen UI dasar, dan seluruh route awal selesai dibangun. Typecheck, lint, dan build produksi lolos (22 route).

### Prompt 1.2 · `Build` · 15 Okt, 20:39
> Kerjakan implementasi lengkap berdasarkan konteks di atas dalam tiga fase:
>
> 1. **Fase 1 (Fondasi, Landing Page, dan Auth):** design token, komponen shadcn/ui, helper `useUser`/`getUser`/`goToFeature`, dan komponen `BatikPattern`. Landing page berisi navbar sticky, hero dengan mockup kartu soal, strip statistik dari database, kartu fitur, peta bahasa Nusantara interaktif, satu soal coba tanpa login, cara kerja, teaser budaya dan asisten AI, FAQ, CTA penutup, dan footer. Sertakan halaman masuk, daftar, lupa password, dan reset password, callback OAuth, serta layout aplikasi (sidebar desktop dan bottom nav mobile).
> 2. **Fase 2 (Onboarding, Dashboard, dan Belajar):** wizard onboarding tiga langkah, dashboard beranda, pemilihan bahasa, jalur belajar zig-zag, lesson player dengan enam tipe soal dan spaced repetition, halaman ulasan berbentuk flashcard, serta kamus dengan filter kategori dan tingkat tutur.
> 3. **Fase 3 (Budaya, Asisten AI, Komunitas, Peringkat, dan Profil):** daftar dan detail artikel budaya, daftar persona dan UI chat streaming, form kontribusi kosakata dengan rekaman audio, halaman moderasi, peringkat mingguan, profil dengan grafik XP dan koleksi lencana, serta halaman pengaturan.
>
> Setelah semua fase selesai, audit responsivitas (375, 768, dan 1280 px), state loading/kosong/error, aksesibilitas keyboard, dan pastikan tidak ada `system_prompt` maupun service role key yang bocor ke bundle client.

**Hasil:** Ketiga fase selesai dan build produksi lolos (27 route). Pengecekan bundle memastikan tidak ada rahasia yang bocor ke client.

### Prompt 1.3 · `Konfigurasi` · 15 Okt, 21:48
> Kerjakan langsung di sesi ini penyusunan skema SQL Supabase beserta data seed untuk Nusa Lingua, sesuai skema yang didefinisikan pada spesifikasi.

**Hasil:** Migrasi `0001_schema.sql` (tabel, enum, indeks, RLS, trigger profil, RPC `complete_lesson`, view leaderboard, pemberian lencana), `0002_storage.sql`, dan `seed.sql`. Semuanya lulus 57 skenario uji di Postgres lokal.

### Prompt 1.4 · `Konfigurasi` · 15 Okt, 22:49
> Lanjutkan penyiapan dan konfigurasi fitur Google OAuth untuk alur pendaftaran dan login, termasuk langkah-langkah yang perlu saya lakukan di Google Cloud Console dan dashboard Supabase.

**Hasil:** Tombol Google kini mengenali status provider. Callback menangani kasus batal, kedaluwarsa, dan beda browser. Panduan konfigurasi ditulis di `docs/setup-google-oauth.md`.

---

## Commit 2 — `d3d05e2` · add more language & culture

**19 Oktober 2026, 00:14 WIB** · 11 berkas, +14.358 baris

Delapan bahasa baru dari Basanusa Dataset v1 (Aceh, Batak Toba, Minangkabau, Madura, Bali, Bugis, Dayak Ngaju, Banjar), persona AI untuk setiap bahasa baru, artikel budaya, ilustrasi rumah adat, dan atribusi data.

### Prompt 2.1 · `Git/Deploy` · 18 Okt, 19:15
> Rekan tim saya telah membuat pull request, dan sudah saya setujui serta merge sehingga perubahannya kini ada di branch utama. Langkah apa yang perlu saya lakukan agar perubahan tersebut juga masuk ke repositori lokal saya?

**Hasil:** Panduan `git fetch` lalu merge `origin/main` ke branch `Madd`.

### Prompt 2.2 · `Debugging` · 18 Okt, 19:20
> Aplikasi mengalami error ketika saya jalankan. Tolong periksa log error-nya, temukan akar masalahnya, dan perbaiki.

**Hasil:** Lima paket font aksara `@fontsource/*` dari perubahan tim sudah tercantum di `package.json` tetapi belum terpasang, sehingga setiap halaman gagal dimuat (500). Masalah selesai dengan `npm install`, dan halaman kembali merespons 200.

### Prompt 2.3 · `Konsultasi` · 18 Okt, 19:31
> Bagaimana cara masuk menggunakan akun dengan role moderator?

**Hasil:** Tidak ada akun moderator bawaan. Role dinaikkan lewat SQL pada tabel `profiles`, karena pengguna memang tidak diizinkan mengubah role-nya sendiri.

### Prompt 2.4 · `Perubahan` · 18 Okt, 19:49
> Saat ini aplikasi baru memuat dua bahasa, yaitu Jawa dan Sunda. Tambahkan seluruh bahasa yang tersedia pada berkas `basanusa-dataset-v1.zip` ke dalam aplikasi.

**Hasil:** `supabase/seed_basanusa.sql` menambahkan 8 bahasa beserta daerah, unit, lesson, kosakata, dan soal. Berkas ini sudah diuji berurutan di Postgres lokal.

### Prompt 2.5 · `Perubahan` · 18 Okt, 19:55 *(sub-tugas turunan, dikerjakan di sesi paralel)*
> Tambahkan satu persona AI untuk setiap bahasa baru dari Basanusa dengan pola yang sama seperti persona yang sudah ada (Mbah Darmo untuk Jawa dan Teh Euis untuk Sunda). Instruksikan setiap persona agar tidak mengarang kosakata dan mengakui ketidaktahuan bila ragu, karena data bahasa tersebut belum diverifikasi penutur asli.

**Hasil:** `supabase/seed_personas.sql` berisi 8 persona baru, yaitu Nek Aminah, Amang Tigor, Uda Rizal, Kak Sitti, Luh Sari, Daeng Baso, Bapa Ambun, dan Acil Imah.

### Prompt 2.6 · `Perubahan` · 18 Okt, 22:04
> Saat ini baru tersedia tiga konten budaya (Sunda, Jawa, dan Bali) dan dua bahasa yang dapat dipelajari. Integrasikan seluruh bahasa dari dataset Basanusa ke fitur Belajar serta fitur-fitur lainnya, seperti kamus, budaya, peta, dan asisten.

**Hasil:**
- Artikel budaya untuk 8 bahasa baru (`seed_budaya.sql`).
- Ilustrasi rumah adat untuk daerah baru dan dukungan aksara tambahan.
- Perbaikan urutan unit.
- Atribusi data NusaX (CC BY-SA 4.0) di halaman Ketentuan dan Kamus.

### Prompt 2.7 · `Konfigurasi` · 18 Okt, 23:34
> Jalankan seluruh berkas seed satu per satu ke database Supabase melalui CLI.

### Prompt 2.8 · `Konfigurasi` · 18 Okt, 23:38–19 Okt, 00:04
> Variabel `SUPABASE_DB_URL` sudah saya tambahkan ke `.env.local`, tetapi belum terbaca. Jelaskan nilai apa yang seharusnya diisikan pada variabel tersebut. *(Setelah diperbarui:)* Konfigurasi sudah saya perbaiki, silakan lanjutkan eksekusi seed.

**Hasil:** Connection string harus memakai format Session Pooler. Parser skrip diperlonggar karena ada spasi di sekitar `=`. Ketiga seed berhasil dijalankan, dan peta landing kini menampilkan 10 daerah.

### Prompt 2.9 · `Kontrol` · 19 Okt, 00:09
> Jangan lakukan commit terlebih dahulu. Saya akan memverifikasi halaman Belajar dan Budaya secara manual.

---

## Commit 3 — `cca80a5` · feat: google sign-in (ID token flow) + deploy

**20 Oktober 2026, 13:21 WIB** · 21 berkas, +291/−50 baris

Login Google memakai Google Identity Services (ID token flow), font utama di-self-host, kode yang tidak terpakai dibersihkan agar build produksi lolos, dan proyek disiapkan untuk deploy ke Vercel.

### Prompt 3.1 · `Debugging` · 16 Okt, 21:24
> Login dengan Google menampilkan **Error 400: redirect_uri_mismatch**. Bagaimana cara menyelesaikannya?

**Hasil:** Kode tidak perlu diubah. URI callback Supabase (`…supabase.co/auth/v1/callback`) perlu didaftarkan pada OAuth client di Google Cloud Console.

### Prompt 3.2 · `Konsultasi` · 16 Okt, 22:07
> Layar login Google masih menampilkan domain proyek Supabase, bukan nama website kami. Bagaimana agar yang tampil adalah nama atau domain Nusa Lingua?

**Hasil:** Ada tiga opsi: (1) mengisi Branding Google, (2) memakai Custom Domain Supabase (berbayar), dan (3) memakai tombol resmi Google yang meneruskan ID token ke Supabase (gratis, perlu perubahan kode).

### Prompt 3.3 · `Debugging` · 19 Okt, 13:28
> Font utama tidak ter-render, dan halaman masih memakai font default Times New Roman. Tolong telusuri penyebabnya dan perbaiki.

**Hasil:** `next/font/google` gagal mengunduh Plus Jakarta Sans dari jaringan lokal. Font kini di-self-host lewat `@fontsource-variable/plus-jakarta-sans`.

### Prompt 3.4 · `Kontrol` · 19 Okt, 13:34
> Tunda commit. Saya akan melanjutkan pengecekan halaman Belajar, Kamus, Budaya, dan Asisten.

### Prompt 3.5 · `Perubahan` · 19 Okt, 13:41
> Terapkan opsi 3: ganti tombol Google di halaman Masuk dan Daftar dengan tombol resmi Google Identity Services, lalu teruskan ID token ke Supabase melalui `signInWithIdToken`, agar layar Google menampilkan domain website kita sendiri.

**Hasil:** Komponen `google-sign-in.tsx`, deklarasi tipe GIS, variabel `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, dan pembaruan panduan setup.

### Prompt 3.6 · `Kontrol` · 19 Okt, 13:48
> Dev server akan saya restart sendiri, lalu saya uji login Google secara langsung.

### Prompt 3.7 · `Git/Deploy` · 20 Okt, 13:17
> Buatkan panduan deploy proyek ini ke Vercel. Integrasi chatbot AI dengan Gemini API (versi gratis) memang belum selesai, tetapi saya ingin melakukan deploy terlebih dahulu agar semua fitur bisa diuji secara publik. Sertakan langkah konfigurasi ulang Supabase, Google OAuth, dan layanan terkait untuk lingkungan produksi.

**Hasil:** Panduan langkah demi langkah: push, import repo, environment variables, Site URL dan Redirect URL Supabase, origin Google OAuth, lalu redeploy. Asisten juga menemukan berkas auth Google yang belum di-commit, sehingga semuanya di-commit pada commit ini.

### Prompt 3.8 · `Git/Deploy` · 20 Okt, 13:46 *(setelah commit)*
> Pada langkah 4 dan 5, Vercel menampilkan peringatan *"Remove the public framework prefix to keep this value private"*. Apakah peringatan ini perlu diikuti?

**Hasil:** Peringatan ini boleh diabaikan untuk `NEXT_PUBLIC_SITE_URL`. Nilainya memang publik, dan prefix tersebut wajib agar variabel bisa dibaca di browser.

---

## Commit 4 — `32fd253` · set up ai chatbot

**21 Oktober 2026, 00:03 WIB** · merge commit

Branch `ui-ux-adjustment` milik rekan tim (maskot baru dan jalur belajar interaktif) digabung ke `Madd`. Konflik di `README.md`, `animated-mascot.tsx`, dan `.env.example` diselesaikan.

> **Catatan:** Kode integrasi Gemini dari prompt 4.1–4.2 sempat tersimpan di *stash* saat konflik diselesaikan, sehingga tidak ikut dalam commit ini. Kode tersebut dipulihkan pada Commit 5.

### Prompt 4.1 · `Build` · 20 Okt, 22:03
> Saya ingin mengintegrasikan chatbot AI memakai Gemini API agar tetap gratis. Bagaimana langkah implementasinya? Apakah ada alternatif yang lebih baik?

**Hasil:** Gemini dipilih. Endpoint `POST /api/chat` dibuat dengan `@google/genai`: respons streaming, riwayat percakapan diambil dari database, dan `system_prompt` persona hanya dibaca di server.

### Prompt 4.2 · `Debugging` · 20 Okt, 22:39
> Pengujian di lokal masih gagal dengan error di sisi server, padahal `NEXT_PUBLIC_USE_MOCK_CHAT` sudah diatur ke `false` dan `GEMINI_API_KEY` sudah ditambahkan. Tolong telusuri penyebabnya.

**Hasil:**
- Model `gemini-2.5-flash` sudah tidak tersedia untuk akun baru, sehingga Gemini membalas 404. Model diganti ke alias `gemini-flash-latest`, dengan opsi override lewat `GEMINI_MODEL`.
- Pesan pengguna tidak lagi tersimpan ganda.
- Permintaan dari tamu kini mendapat respons 401.

### Prompt 4.3 · `Git/Deploy` · 20 Okt, 22:58
> Deployment Vercel diblokir setelah rekan saya melakukan commit sebagai kontributor. Apakah paket Hobby Vercel tidak mendukung repositori dengan dua kontributor atau lebih? Apakah solusinya adalah memutus integrasi Vercel dengan GitHub, menyelesaikan semua commit rekan saya, lalu melakukan deploy ulang?

**Hasil:** Paket Hobby memblokir deploy dari commit yang dibuat orang lain. Solusinya, perubahan rekan di-merge oleh pemilik proyek sehingga merge commit tercatat atas nama pemilik.

### Prompt 4.4 · `Git/Deploy` · 20 Okt, 23:05
> Commit rekan saya belum diajukan sebagai pull request. Apakah saya harus me-merge-nya terlebih dahulu ke branch utama agar terdeteksi oleh Vercel?

### Prompt 4.5 · `Git/Deploy` · 20 Okt, 23:09
> Saya mencoba membuat pull request dari branch rekan saya. Apakah kondisi pada tangkapan layar ini menandakan pull request tersebut gagal?

**Hasil:** Pull request tidak gagal. Status *blocked* hanya berlaku untuk preview deployment, sedangkan masalah sebenarnya adalah konflik pada `README.md`.

### Prompt 4.6 · `Git/Deploy` · 20 Okt, 23:12
> Apakah ini berarti saya tidak dapat melakukan merge? Bantu saya menyelesaikannya.

**Hasil:** Perubahan lokal diamankan ke stash, lalu merge dijalankan di lokal. Konflik `animated-mascot.tsx` diselesaikan dengan memakai versi rekan, karena konstanta lama sudah dipindah ke `mascot-poses.ts`.

### Prompt 4.7 · `Git/Deploy` · 20 Okt, 23:33–21 Okt, 00:00
> Untuk `README.md`, gunakan versi branch `Madd` yang berisi panduan seed lengkap, tetapi jangan lakukan commit. *(Kemudian:)* Hentikan proses di sini, dan jangan lakukan commit maupun push apa pun. Proses commit akan saya lanjutkan sendiri.

### Prompt 4.8 · `Git/Deploy` · 21 Okt, 00:08 *(setelah commit)*
> Merge sudah berhasil dan saya ingin melakukan redeploy manual, tetapi deployment tetap diblokir.

**Hasil:** Tombol *Redeploy* membangun ulang commit sumber yang sama, yaitu commit rekan, sehingga tetap diblokir. Solusinya memakai deployment dari merge commit `4e7f2e6` yang dibuat oleh pemilik proyek.

---

## Commit 5 — `76439de` · ai persona adjustment

**21 Oktober 2026, 10:01 WIB** · 6 berkas, +643 baris

Endpoint chat Gemini (`src/app/api/chat/route.ts`) dipulihkan, dan setiap balasan chatbot kini dwibahasa dengan toggle terjemahan.

### Prompt 5.1 · `Git/Deploy` · 21 Okt, 09:06
> Saat mengubah variabel `NEXT_PUBLIC_USE_MOCK_CHAT` di Vercel, muncul peringatan *"Remove the public framework prefix…"*. Bagaimana sebaiknya saya menanganinya?

**Hasil:** Pilih tipe **Config**, bukan Secret. Variabel yang sudah tersimpan sebagai Secret harus dihapus lalu dibuat ulang.

### Prompt 5.2 · `Git/Deploy` · 21 Okt, 09:09
> Apakah pengaturan pada tangkapan layar ini sudah benar?

### Prompt 5.3 · `Debugging` · 21 Okt, 09:14
> Semua persona chatbot memberikan respons yang sama, tidak sesuai konteks percakapan, dan belum memakai bahasa daerah yang semestinya. Tolong telusuri penyebabnya.

**Hasil:** Deployment masih memakai mock. Akar masalahnya, `route.ts` dan dependensi `@google/genai` tertinggal di stash saat Commit 4, sehingga tidak pernah sampai ke GitHub. Ketiganya dipulihkan bersama catatan `.env.example`, dan branch lokal disinkronkan dengan remote.

### Prompt 5.4 · `Perubahan` · 21 Okt, 09:30
> Saya ingin setiap respons chatbot punya dua tampilan dalam satu bubble. Chatbot cukup menjawab sepenuhnya dalam bahasa daerah. Di pojok kanan bawah setiap bubble ada toggle **Terjemahkan**. Jika diklik, isi bubble berganti menjadi terjemahan Bahasa Indonesia dalam huruf miring.

**Hasil:** Modul `src/lib/bilingual.ts` dengan penanda `[[TERJEMAHAN]]`, sehingga cukup satu panggilan Gemini per pesan dan kuota gratis tetap hemat. Toggle *Terjemahkan / Teks asli* ditambahkan di `chat-window.tsx`.

### Prompt 5.5 · `Git/Deploy` · 21 Okt, 10:05 *(setelah commit)*
> Perintah `git push origin Madd` ditolak dengan pesan *non-fast-forward*. Bagaimana cara menyelesaikannya?

**Hasil:** Branch sudah divergen: lokal unggul 1 commit, sedangkan remote unggul 2 commit dari PR #4. Solusinya `git pull --rebase origin Madd`, lalu push.

---

## Commit 6 — `31b8638` · Moderation flow

**21 Oktober 2026, 21:25 WIB** · 37 berkas, +2.792/−210 baris

Rancangan sistem moderator (`docs/rancangan-moderator.md`) dan Fase A: alur moderasi lewat RPC (P1), moderator per bahasa (P2), area `/moderasi/antrean` dan `/moderasi/tim`, serta migrasi `0005_moderation_core.sql`.

### Prompt 6.1 · `Konsultasi` · 21 Okt, 13:15
> Di platform edukasi bahasa ini ada role Moderator yang bertugas meninjau dan mengonfirmasi kontribusi kosakata dari pengguna. Menurut Anda, perlukah fitur tambahan terkait otoritas moderator, misalnya dashboard khusus moderator atau kemampuan membuat artikel budaya?

**Hasil:** Analisis celah alur moderasi yang ada, misalnya penolakan tanpa alasan dan tidak adanya edit sebelum persetujuan. Lima prioritas diusulkan: P1 alur moderasi, P2 moderator per bahasa, P3 dashboard, P4 CMS artikel, dan P5 laporan & kelola kamus.

### Prompt 6.2 · `Konsultasi` · 21 Okt, 13:37
> Sebelum mulai coding, buatkan rancangan lengkap untuk semua prioritas: skema database, kebijakan RLS, dan halaman-halaman yang dibutuhkan.

**Hasil:** Dokumen `docs/rancangan-moderator.md` berisi skema, RLS, fungsi database, struktur halaman, pembagian fase, risiko, dan daftar keputusan.

### Prompt 6.3 · `Build` · 21 Okt, 14:23
> Mulai pengerjaan Fase A sesuai dokumen rancangan.

**Hasil:**
- Migrasi `0005_moderation_core.sql` dengan RPC `review_submission`, alasan penolakan, edit sebelum setuju, XP kontributor, dan tabel `moderator_languages`. Migrasi lulus 62 skenario uji SQL.
- Halaman `/moderasi/antrean` dan `/moderasi/tim`, dialog Tolak dan Edit & Setujui.
- Redirect dari route lama.

### Prompt 6.4 · `Kontrol` · 21 Okt, 14:44
> Jangan commit dulu. Saya akan menjalankan migrasinya dan mencobanya langsung di aplikasi.

### Prompt 6.5 · `Konfigurasi` · 21 Okt, 20:59
> Jalankan migrasi tersebut melalui CLI di proyek ini.

**Hasil:** CLI memerlukan connection string Postgres (`SUPABASE_DB_URL`) agar bisa menjalankan SQL dengan `psql`.

### Prompt 6.6 · `Konsultasi` · 21 Okt, 21:07
> Bagaimana cara mengetahui password database Supabase?

**Hasil:** Password tidak bisa dilihat ulang dan hanya bisa di-reset lewat Project Settings → Database. Reset tidak memengaruhi aplikasi, karena aplikasi memakai API key.

### Prompt 6.7 · `Konfigurasi` · 21 Okt, 21:12
> Kredensial database sudah saya tambahkan ke `.env.local`. Silakan lanjutkan.

**Hasil:** Pengecekan awal menemukan migrasi `0003_vocab_columns.sql` belum pernah dijalankan di database produksi.

### Prompt 6.8 · `Konfigurasi` · 21 Okt, 21:16
> Jalankan `0003_vocab_columns.sql` terlebih dahulu, kemudian `0005_moderation_core.sql`.

**Hasil:** Kedua migrasi berhasil. Kolom, tabel, enum, fungsi, dan policy baru sudah diverifikasi di Supabase.

---

## Commit 7 — `b726bd0` · Merge origin/Madd: resolve conflict layout.tsx

**21 Oktober 2026, 21:39 WIB** · merge commit

Perubahan terbaru dari remote (PR #5: animasi streak dan layar loading) digabung dengan pekerjaan moderasi lokal.

### Prompt 7.1 · `Git/Deploy` · 21 Okt, 21:28
> Saat menggabungkan perubahan terbaru dari remote, terjadi konflik merge pada `src/app/(app)/layout.tsx` karena saya lupa melakukan fetch sebelum membuat perubahan. Bantu saya menyelesaikan konflik tersebut.

**Hasil:** Kedua sisi dipertahankan: logika badge moderator dari lokal dan preload maskot loading dari rekan. Tidak ada marker konflik yang tersisa.

### Prompt 7.2 · `Kontrol` · 21 Okt, 21:33
> Langkah `git add`, `commit`, dan `push` akan saya jalankan sendiri.

### Prompt 7.3 · `Debugging` · 21 Okt, 21:37
> Setelah saya menjalankan perintah Git, terminal menampilkan layar seperti pada tangkapan layar ini. Apa yang harus saya lakukan?

**Hasil:** Layar tersebut adalah peringatan *swap file* Vim dari sesi commit sebelumnya yang tertutup paksa. Solusinya: pilih Abort, hapus berkas swap, lalu commit dengan `git commit -m`.

---

## Commit 8 — `5bd5d0b` · moderator dashboard & activity log

**21 Oktober 2026, 22:38 WIB** · 17 berkas, +774/−62 baris

Fase B (P3): dashboard `/moderasi` (antrean per bahasa, statistik pribadi), halaman `/moderasi/riwayat`, migrasi `0006_moderation_dashboard.sql`, dan perbaikan build yang rusak setelah merge.

### Prompt 8.1 · `Perubahan` · 21 Okt, 22:03
> Lanjutkan ke P2: Moderator per Bahasa, yang mencakup tabel `moderator_languages`, pembatasan semua hak moderator ke bahasa yang dipegang, dan halaman admin untuk menugaskan moderator.

**Hasil:** P2 ternyata sudah selesai bersama P1 di Fase A, dan migrasinya sudah aktif, sehingga tidak ada pekerjaan ulang.

### Prompt 8.2 · `Build` · 21 Okt, 22:04
> Lanjutkan ke Fase B: dashboard moderator dan riwayat aktivitas (P3).

**Hasil:**
- Migrasi `0006` dengan fungsi `get_moderation_overview` dan `get_my_moderation_stats`, lulus 25 skenario uji.
- Halaman dashboard dan riwayat aktivitas.
- Perbaikan build: komponen `NativeSelect` yang terhapus saat merge diganti dengan `param-select.tsx` berbasis `SelectFilter`.

### Prompt 8.3 · `Konfigurasi` · 21 Okt, 22:30
> Jalankan `0006_moderation_dashboard.sql` di Supabase melalui CLI seperti sebelumnya.

**Hasil:** Migrasi berhasil. Hak akses fungsi dan uji asap sudah diverifikasi di dalam transaksi yang di-rollback.

### Prompt 8.4 · `Debugging` · 21 Okt, 22:57 *(setelah commit)*
> Redeploy di Vercel gagal karena type error: `language-filter.tsx` mengimpor `NativeSelect` dari `@/components/ui/input`, padahal komponen tersebut tidak diekspor di sana. Tolong analisis dan perbaiki.

### Prompt 8.5 · `Debugging` · 21 Okt, 23:02
> Berikut log build lengkap dari Vercel untuk dianalisis.

**Hasil:** Log menunjukkan Vercel membangun commit lama `b726bd0`. Perbaikannya sudah ada di `5bd5d0b`, jadi solusinya men-deploy commit terbaru, bukan me-*redeploy* deployment lama.

---

## Commit 9 — `7c2cb6f` · cms article & culture

**22 Oktober 2026, 09:05 WIB** · 29 berkas, +2.112/−46 baris

Fase C (P4): CMS artikel budaya dengan alur status, editor Markdown, pratinjau, unggah sampul, rujukan, dan penulis, plus migrasi `0007_articles_cms.sql`.

### Prompt 9.1 · `Build` · 22 Okt, 08:47
> Kerjakan P4: CMS artikel budaya, yang mencakup:
> - alur status draf → tinjauan → terbit → arsip;
> - editor Markdown dengan pratinjau;
> - unggah gambar sampul;
> - daftar rujukan;
> - atribusi penulis.

**Hasil:**
- Migrasi `0007` dengan transisi status yang dijaga trigger dan prinsip empat mata. Migrasi lulus 45 skenario uji.
- Halaman `/moderasi/artikel` (daftar, baru, dan edit) beserta editor Markdown, daftar periksa, dan dialog pengembalian.
- Pembaruan halaman publik `/budaya/[slug]`.

### Prompt 9.2 · `Konsultasi` · 22 Okt, 08:47
> Bagaimana cara mengundang rekan tim ke proyek Supabase?

**Hasil:** Undangan dikirim di tingkat *organization* lewat Organization settings → Team → Invite member.

### Prompt 9.3 · `Konsultasi` · 22 Okt, 08:55
> Email undangan tidak diterima oleh rekan saya. Apa kemungkinan penyebab dan solusinya?

**Hasil:** Cek folder spam, pastikan ejaan email benar, lalu kirim ulang atau batalkan dan buat ulang undangan.

### Prompt 9.4 · `Konfigurasi` · 22 Okt, 09:02
> Jalankan `0007_articles_cms.sql` di Supabase melalui CLI seperti sebelumnya.

**Hasil:** Migrasi berhasil. Ke-18 artikel lama termigrasi (17 terbit, 1 draf). Policy, trigger, indeks, dan hak akses sudah diverifikasi.

---

## Commit 10 — `d46a4df` · Dictionary Report & Management

**22 Oktober 2026, 09:38 WIB** · 28 berkas, +2.445/−41 baris

Fase D (P5): tombol **Laporkan** di kamus dan artikel, antrean laporan moderator, kelola kamus (edit dan sembunyikan entri), dan migrasi `0008_reports_vocab.sql`.

### Prompt 10.1 · `Build` · 22 Okt, 09:10
> Kerjakan P5: Laporan & Kelola Kamus, yang mencakup:
> - tombol **Laporkan** di halaman kamus dan artikel;
> - antrean laporan untuk moderator;
> - fitur untuk mengedit dan menyembunyikan entri kamus.

**Hasil:**
- Migrasi `0008` dengan tabel `content_reports` dan kolom `is_hidden`, lulus 52 skenario uji.
- Komponen tombol lapor, dialog edit kata, dan tombol sembunyikan/pulihkan.
- Halaman `/moderasi/laporan` dan `/moderasi/kamus`, serta bagian "Laporan saya" di Kontribusi.

### Prompt 10.2 · `Konfigurasi` · 22 Okt, 09:35
> Jalankan `0008_reports_vocab.sql` di Supabase melalui CLI seperti sebelumnya.

**Hasil:** Migrasi berhasil. Migrasi 0003 sampai 0008 kini aktif semua di Supabase, dengan 7.141 entri kamus dan policy baru yang sudah diverifikasi.

---

## Lampiran — Merge pull request tim di GitHub

Pull request dari branch `ui-ux-adjustment` milik rekan tim di-merge oleh pengembang lewat GitHub. Prompt yang berkaitan tercantum di bagian commit masing-masing.

| PR | Merge commit | Waktu | Prompt terkait |
| --- | --- | --- | --- |
| #1 | `484c897` | 18 Okt, 19:10 | 2.1, 2.2 |
| #2 | `4e7f2e6` | 21 Okt, 00:06 | 4.3–4.8 |
| #3 | `0535ad0` | 21 Okt, 00:16 | — |
| #4 | `9b66524` | 21 Okt, 09:58 | 5.5 |
| #5 | `73c08fd` | 21 Okt, 14:09 | 7.1, 8.4–8.5 |

**Total:** 56 prompt dalam 10 commit. Rinciannya: Build 7, Perubahan 6, Debugging 8, Konfigurasi 10, Git/Deploy 13, Konsultasi 7, dan Kontrol 5.
