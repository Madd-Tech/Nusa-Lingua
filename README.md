# Nusa Lingua — Frontend

Platform belajar bahasa daerah Indonesia: lesson ala game, kamus, budaya, asisten AI, kontribusi komunitas, dan gamifikasi.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS + komponen gaya shadcn/ui · Supabase (`@supabase/ssr`) · react-hook-form + zod · sonner · framer-motion · lucide-react.

## Menjalankan

```bash
cp .env.example .env.local   # isi URL & anon key Supabase, service role (server saja)
npm install
npm run dev
```

| Variabel | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client Supabase (browser & server) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server saja.** Dipakai di `src/lib/queries/personas.ts` untuk membaca `ai_personas` |
| `NEXT_PUBLIC_SITE_URL` | Origin untuk redirect email/OAuth (opsional) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID OAuth Google (publik). Mengaktifkan tombol resmi Google + `signInWithIdToken` agar layar pilih akun menampilkan domain website, bukan `supabase.co`. Kosong = alur redirect OAuth. Lihat [docs/setup-google-oauth.md](docs/setup-google-oauth.md) |
| `NEXT_PUBLIC_USE_MOCK_CHAT` | `true` = pakai `src/lib/mock-chat.ts` selama `POST /api/chat` belum ada |

Tipe database: `npm run gen:types` (butuh `SUPABASE_PROJECT_ID` + `supabase login`) menimpa `src/types/database.ts`.

### Menyiapkan database

Jika proyek Supabase masih kosong, jalankan berkas-berkas ini **berurutan** di Supabase Dashboard → SQL Editor (masing-masing sekali, pada schema `public` yang kosong):

1. [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql) — enum, tabel, indeks, RLS, hak kolom, trigger profil, RPC `complete_lesson`, view `weekly_leaderboard`, lencana otomatis.
2. [`supabase/migrations/0002_storage.sql`](supabase/migrations/0002_storage.sql) — bucket publik `audio` & `avatars` + policy tulis hanya ke folder `<user_id>/`.
3. [`supabase/seed.sql`](supabase/seed.sql) — data demo: 3 daerah, Bahasa Jawa & Sunda, 6 lesson (28 soal, keenam tipe), kosakata bertingkat tutur, 2 artikel terbit + 1 draf, 7 lencana, 2 persona AI. Aman dijalankan ulang.
4. [`supabase/seed_basanusa.sql`](supabase/seed_basanusa.sql) — Basanusa Dataset v1.0: 8 bahasa baru (Aceh, Batak Toba, Minangkabau, Madura, Bali, Bugis, Dayak Ngaju, Banjar) + 7 daerah, dan unit tematik tambahan untuk Jawa & Sunda. Total 101 unit, 448 lesson, 7.111 kosakata, 5.853 soal pilihan ganda. Unit diurutkan sapaan → perasaan → kata kerja/sifat → manusia/alam/masyarakat. Harus setelah `seed.sql`; aman dijalankan ulang (menjalankan ulang ikut memperbarui urutan unit). Sumber NusaX (CC BY-SA 4.0, wajib atribusi — ditampilkan di `/ketentuan#sumber-data` dan kaki halaman kamus) — belum diverifikasi penutur asli.
5. [`supabase/seed_personas.sql`](supabase/seed_personas.sql) — 8 persona AI untuk bahasa baru (Nek Aminah, Amang Tigor, Uda Rizal, Kak Sitti, Luh Sari, Daeng Baso, Bapa Ambun, Acil Imah), dengan instruksi tambahan agar tidak mengarang kosakata. Belum ada maskot khusus, jadi `avatar_url` NULL dan aplikasi menampilkan inisial nama persona. Harus setelah `seed_basanusa.sql`; aman dijalankan ulang.
6. [`supabase/seed_budaya.sql`](supabase/seed_budaya.sql) — 8 artikel budaya terbit, satu per bahasa baru: Nyepi (Bali), Rumoh Aceh, Ulos & Dalihan Na Tolu (Batak Toba), asal-usul nama Minangkabau, Karapan Sapi (Madura), Aksara Lontara (Bugis), Huma Betang (Dayak Ngaju), Pasar Terapung (Banjar). Harus setelah `seed_basanusa.sql`; aman dijalankan ulang. Mohon ditinjau budayawan/penutur asli sebelum rilis.
7. [`supabase/migrations/0005_moderation_core.sql`](supabase/migrations/0005_moderation_core.sql) — moderasi inti: moderator per bahasa (`moderator_languages`), RPC `review_submission` (alasan penolakan, edit sebelum setuju, cek duplikat, XP kontributor), `get_submission_queue`, `set_moderator_languages` (admin), `moderation_log`, batas 20 usulan menunggu per user. Jalankan sekali, setelah semua berkas di atas. Moderator yang sudah ada otomatis ditugaskan ke semua bahasa. Rancangan lengkap: [docs/rancangan-moderator.md](docs/rancangan-moderator.md).
8. [`supabase/migrations/0006_moderation_dashboard.sql`](supabase/migrations/0006_moderation_dashboard.sql) — RPC dashboard `/moderasi`: `get_moderation_overview` (antrean per bahasa, kiriman tertua, tinjauan 7 hari, jumlah moderator) dan `get_my_moderation_stats`. Harus setelah 0005; aman dijalankan ulang.
9. [`supabase/migrations/0007_articles_cms.sql`](supabase/migrations/0007_articles_cms.sql) — CMS artikel budaya: `status` (`draft` → `review` → `published` → `archived`), penulis, rujukan, jejak terbit, bucket publik `budaya` untuk sampul/gambar (maks. 5 MB), dan hitungan artikel di dashboard. Setelah migrasi ini `is_published` menjadi **kolom turunan** dan tidak bisa diisi lagi; seed (`seed.sql`, `seed_budaya.sql`) dan `npm run seed:artikel` sudah memakai `status`. Jalankan sekali, setelah 0006.
10. [`supabase/migrations/0008_reports_vocab.sql`](supabase/migrations/0008_reports_vocab.sql) — laporan pengguna (`content_reports`, RPC `get_report_queue` & `resolve_reports`) dan kelola kamus: moderator mengedit atau menyembunyikan entri `vocabularies` di bahasanya (`is_hidden`, `hidden_reason`, jejak perubahan). Kata yang dipakai soal tidak bisa disembunyikan; kata tersembunyi hilang dari kamus publik dan tidak dihitung sebagai duplikat saat meninjau usulan. Jalankan sekali, setelah 0007.
11. [`supabase/migrations/0009_profile_gender.sql`](supabase/migrations/0009_profile_gender.sql) — jenis kelamin pengguna (`profiles.gender`: `male`/`female`, diisi saat onboarding dan bisa diubah di Pengaturan) serta panggilan per persona (`ai_personas.address_male` / `address_female`, mis. "Lae"/"Ito" untuk Amang Tigor, "Bli"/"Mbok" untuk Luh Sari). `/api/chat` menyisipkan panggilan yang sesuai ke system prompt; gender kosong atau panggilan kosong (Dayak Ngaju) → sapaan netral. Panggilan belum diverifikasi penutur asli. Jalankan sekali, setelah 0008.

Peta bahasa di landing otomatis menampilkan rumah adat tiap daerah baru (Rumoh Aceh, Rumah Bolon, Rumah Gadang, Tanean Lanjhang, Saoraja, Rumah Betang, Bubungan Tinggi) — lihat `src/components/landing/rumah-adat.tsx`.

Lalu daftar lewat `/daftar`. Untuk mencoba halaman moderasi, jadikan akunmu admin (admin memoderasi semua bahasa dan bisa menugaskan moderator lain di `/moderasi/tim`):

```sql
update public.profiles set role = 'admin' where username = 'username_kamu';
```

Atau langsung jadikan moderator untuk bahasa tertentu (mis. Jawa `jv`):

```sql
update public.profiles set role = 'moderator' where username = 'username_kamu';
insert into public.moderator_languages (user_id, language_id)
select p.id, l.id from public.profiles p, public.languages l
where p.username = 'username_kamu' and l.code = 'jv';
```

Yang ditegakkan database (bukan hanya UI):
- Client **tidak bisa** mengubah `xp_total`, streak, `hearts`, atau `role` (hak kolom), maupun menulis `user_lesson_progress`, `xp_logs`, `user_achievements`. Semua lewat `complete_lesson`.
- `complete_lesson`: XP penuh × skor pada penyelesaian pertama, setengahnya saat mengulang (min. 1); bintang 3/2/1 untuk skor ≥90/≥70/lainnya; streak memakai tanggal WIB; menambah XP profil + per bahasa, `xp_logs`, dan lencana.
- `ai_personas` sama sekali tidak terjangkau `anon`/`authenticated`.
- Usulan kosakata wajib `pending` saat dikirim (maks. 20 menunggu per user) dan bisa dibatalkan pengusulnya selama masih menunggu. Client **tidak bisa** meng-update usulan; keputusan hanya lewat RPC `review_submission`, yang mengisi `reviewed_by = auth.uid()`, menolak usulan milik sendiri, membatasi moderator ke bahasa di `moderator_languages` (admin: semua bahasa), mewajibkan alasan penolakan, menolak duplikat persis, lalu memasukkan kata ke `vocabularies` (sumber `kontribusi`, `contributed_by`), memberi 15 XP + lencana, dan mencatat di `moderation_log`. Mengubah `status` langsung lewat SQL Editor **tidak** lagi memasukkan kata ke kamus.
- Lencana diberikan otomatis berdasarkan `achievements.condition` (`lessons_completed`, `perfect_lesson`, `streak`, `xp_total`, `articles_read`, `contributions_approved`).
- Artikel budaya ditulis moderator lewat `/moderasi/artikel`. Database mengisi `author_id` dari `auth.uid()` dan memaksa status awal `draft`; transisi status dijaga trigger (draf tidak bisa langsung terbit, slug terkunci setelah pernah terbit), penulis tidak bisa menerbitkan tulisannya sendiri (kecuali admin), pengembalian ke draf oleh peninjau wajib disertai catatan, dan moderator hanya bisa menulis/mengubah artikel di bahasa yang ia pegang. Perubahan lewat service role/SQL Editor tidak dibatasi aturan ini.
- Pengguna melaporkan kesalahan kata/artikel lewat tombol **Laporkan kesalahan** (maks. 10 laporan terbuka per user, satu laporan terbuka per target). Database mengisi pelapor & bahasa dari targetnya; pelapor tidak bisa mengubah status. Moderator menangani laporan per target lewat `resolve_reports` (mengabaikan wajib disertai catatan) dan hanya untuk bahasa yang ia pegang. Edit kamus dibatasi ke kolom isi (bukan bahasa/sumber), dan setiap perubahan tercatat di `moderation_log` beserta nilai sebelum/sesudahnya.

Skrip ini diuji dengan 57 skenario (RLS, hak kolom, RPC, streak, leaderboard, moderasi, storage) di Postgres 16 (PGlite) dengan stub `auth`/`storage` ala Supabase — belum dijalankan di proyek Supabase sungguhan. `0005`–`0008` diuji terpisah dengan 62 + 25 + 45 + 52 skenario (cakupan bahasa, hak kolom, RPC, XP, lencana, batas usulan, backfill, statistik dashboard, alur status artikel, empat mata, storage, laporan, edit/sembunyikan kamus, anon) di Postgres 18 dengan stub serupa.

### Konfigurasi Supabase yang perlu dicek
- **Login Google:** ikuti [docs/setup-google-oauth.md](docs/setup-google-oauth.md) (Google Cloud Console + Supabase).
- **Auth → URL Configuration:** tambahkan `http://localhost:3000/**` (dan domain produksi) ke Redirect URLs — dipakai OAuth Google, konfirmasi email, dan reset password.
- **Storage bucket `audio`:** kontribusi diunggah ke `<user_id>/<timestamp>.webm` dan `audio_url` diisi dengan *public URL*. Jika bucket privat, ganti `getPublicUrl` di `src/components/community/submission-form.tsx` dengan signed URL.
- **RLS `profiles`:** onboarding & pengaturan meng-update `username`, `full_name`, `home_region_id` milik sendiri. Pastikan ada policy update untuk `auth.uid() = id`, dan constraint unik `username` (kode error `23505` ditampilkan sebagai "username sudah dipakai").
- **Moderasi:** area `/moderasi` (route lama `/kontribusi/moderasi` di-redirect lewat `next.config.mjs`). Antrean dibaca lewat RPC `get_submission_queue` (security definer), jadi nama pengusul & peninjau tetap tampil walau policy `profiles` diperketat. Atribusi "Kontribusi @username" di kamus membaca `profiles` lewat relasi `vocabularies.contributed_by`.
- **Storage bucket `avatars` (asumsi, tidak ada di brief; dibuat oleh `0002_storage.sql`):** foto profil unggahan disimpan di `<user_id>/<timestamp>.<ext>` (maks. 2 MB) dan dipakai sebagai public URL. Avatar bawaan ada di `public/avatars/*.svg` dan disimpan sebagai path relatif (`/avatars/peci.svg`).
- **Cek username real-time** membaca `profiles` milik user lain (`select id where username = …`). Jika policy select `profiles` hanya mengizinkan baris sendiri, status "tersedia" tidak bisa diandalkan — constraint UNIQUE tetap menolak saat simpan (pesan ramah ditampilkan).
- **Hapus sesi obrolan** butuh policy delete `chat_sessions` untuk pemiliknya dan FK `chat_messages.session_id` dengan `on delete cascade`.

## Aturan akses
- `/` publik. Semua route di grup `(app)` wajib login.
- `src/middleware.ts` → `src/lib/supabase/middleware.ts`: refresh session tiap request; tamu ke route app → `/masuk?next=<path>`; user login di `/masuk`/`/daftar` → `/beranda`; `username` kosong → `/onboarding?next=<path>`.
- CTA landing memakai `goToFeature(path)` (`src/hooks/use-go-to-feature.ts`, dibungkus `FeatureLink`).
- `next` divalidasi oleh `sanitizeNext` (`src/lib/routes.ts`): hanya path internal berawalan `/` (menolak `//host`, `/\host`, URL absolut).

## Struktur
```
src/app/(marketing)      landing publik
src/app/(auth)           masuk, daftar, lupa-password, reset-password
src/app/auth/callback    exchange code / verifikasi token email
src/app/(app)/...        fitur terproteksi (lesson & onboarding tampil tanpa navigasi)
src/components/{ui,layout,learning,culture,chat,gamification,community,auth,illustrations}
src/lib/queries/*.ts     semua query Supabase, bertipe penuh (melempar error → error.tsx "Coba lagi")
src/lib/supabase/        client (browser), server, admin (service role), middleware
```

## Fitur per fase
- **Fase 1:** landing (navbar blur + Sheet mobile, hero mockup, statistik dari `count`, 5 kartu fitur, peta bahasa SVG dari `regions.lat/lng` + popover + filter pulau, coba 1 soal tanpa login, cara kerja, teaser budaya & AI, FAQ accordion, CTA, footer, OpenGraph image), auth (banner `?next`, Google, kekuatan & konfirmasi kata sandi, checkbox ketentuan), layout app (sidebar, bottom nav 5 item, pemilih bahasa aktif, chip streak/XP/nyawa).
- **Fase 2:** onboarding 3 langkah (cek username debounce 400 ms, avatar bawaan/unggah, cari daerah, pilih bahasa), beranda (streak + kalender 7 hari, lanjutkan bahasa aktif, cincin target harian, ulasan, bahasa diikuti, mini peringkat, rekomendasi budaya, lencana terbaru), jalur zig-zag dengan popover lesson, lesson player (6 renderer di `components/learning/questions/`, audio 0,75x, word bank, efek suara, mastery per jawaban, konfeti 3 bintang), ulasan flashcard (maks. 15), kamus (filter kategori & tingkat tutur, titik penguasaan 0–5, detail di Sheet).
- **Fase 3:** budaya (filter kategori/daerah/bahasa/judul + paginasi), artikel (daftar isi sticky, tandai dibaca di 80% gulir, "Tanya asisten AI" → sesi dengan persona bahasa terkait), asisten (riwayat + hapus, sidebar/Sheet, markdown, saran prompt, auto-grow, stop, kirim ulang & pesan limit 429), kontribusi (rekam ≤10 dtk, tabel usulan), moderasi (403 ramah), peringkat (Nasional/Daerah saya, podium medali, baris saya sticky), profil (6 statistik, grafik XP 30 hari recharts, progres unit, koleksi lencana), pengaturan (avatar, username, daerah, ubah kata sandi, mode gelap, efek suara).

**Bahasa aktif** disimpan di cookie `nl_active_lang` (dipilih dari top bar), dipakai beranda untuk "Lanjutkan belajar" & rekomendasi.

## Sumber data & lisensi

Konten learning path di luar data seed (unit, lesson, kosakata, dan soal Bahasa Jawa & Sunda) diimpor dari [`basanusa-dataset/`](basanusa-dataset/) oleh generator `scripts/generate_basanusa_migration.py` yang menulis `supabase/migrations/0004_basanusa_content.sql`.

- **NusaX** — *Multilingual Parallel Sentiment Dataset for 10 Indonesian Local Languages* (EACL 2023) — <https://github.com/IndoNLP/nusax>, **lisensi CC BY-SA 4.0**. Hanya baris ber-sumber `NusaX` yang diimpor; atribusi wajib disebutkan (tercantum di header migration dan di footer situs).
- Baris **`kamus-sunda (KatowProject)`** tidak disertakan karena lisensinya tidak dinyatakan. Akibatnya 39 lesson Sunda dan sebagian soal ikut dibuang; unit "Kosakata Umum" gugur seluruhnya karena tak punya kata inti NusaX.
- Contoh kalimat NusaX berasal dari unggahan media sosial/ulasan produk — gaya bicaranya nonformal; terjemah Indonesianya disimpan di `vocabularies.example_meaning` dan ditampilkan di detail kamus.
- Asal tiap kosakata tercatat di kolom `vocabularies.source` (`seed` / `NusaX`); peran kata di `vocabularies.peran` (`inti` = materi pelajaran & sumber soal, `varian` = padanan untuk kamus).
- Setelah dataset berubah, jalankan ulang `python scripts/generate_basanusa_migration.py` lalu `python scripts/verify_basanusa_migration.py` — file SQL dibangun ulang deterministik, verifier memastikan struktur & aturan soal tetap sah, dan keduanya aman dieksekusi berulang (`on conflict do nothing`).

## Catatan & asumsi
- **ID konten** (`regions`, `languages`, `lessons`, …) diasumsikan `bigint` → `number`; parsing param route ada di satu tempat (`parseId` di `src/lib/utils.ts`). Jika skema memakai uuid, ubah `parseId` dan regenerasi tipe.
- **`questions.options`** (jsonb) dibaca secara toleran di `src/lib/questions.ts`: array string, `{choices|options|words}`, atau pasangan `[{left,right}]` / `{pairs}` / objek `{kata: arti}`. `correct_answer` boleh berisi alternatif dipisah `|`.
- **Progres & XP** hanya lewat `rpc('complete_lesson')`. Client hanya meng-upsert `user_vocab_mastery`, `user_languages`, dan meng-insert `user_article_reads`.
- **Spaced repetition:** benar → strength+1; salah → strength−1 (min 0); interval 0→10 mnt, 1→1 hr, 2→3 hr, 3→7 hr, 4→14 hr, 5→30 hr (`src/lib/srs.ts`).
- **Placeholder** `[ISI: nama tim]` dan `[ISI: nama lomba]` ada di `src/lib/site.ts`; halaman `/ketentuan` berlabel draf.
- **Nyawa (hearts)** dihitung lokal per lesson, mulai dari `profiles.hearts`. Brief tidak menyediakan RPC untuk mengurangi nyawa, jadi nilainya tidak ditulis ke database.
- **Soal bicara** memakai Web Speech API dengan `id-ID` (bahasa daerah belum didukung mesin pengenal suara); selalu ada tombol lewati tanpa penalti.
- **Mock chat** diberi label "Mode demo" di UI dan tidak menyimpan pesan.
- **Warna tombol utama:** brand `#1F8A4C` dipakai untuk ikon/aksen; muka tombol solid memakai `#1A7A43` agar teks putih memenuhi kontras WCAG AA (≥4.5:1). `#1F8A4C` dengan teks putih hanya ±4.4:1.
- Statistik di landing dihitung dari database (`count`); bagian yang datanya kosong disembunyikan. Tidak ada testimoni atau angka karangan.
