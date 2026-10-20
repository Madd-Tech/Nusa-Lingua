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
| `NEXT_PUBLIC_USE_MOCK_CHAT` | `true` = pakai `src/lib/mock-chat.ts` selama `POST /api/chat` belum ada |

Tipe database: `npm run gen:types` (butuh `SUPABASE_PROJECT_ID` + `supabase login`) menimpa `src/types/database.ts`.

### Menyiapkan database

Jika proyek Supabase masih kosong, jalankan lima berkas ini **berurutan** di Supabase Dashboard → SQL Editor (masing-masing sekali, pada schema `public` yang kosong):

1. [`supabase/migrations/0001_schema.sql`](supabase/migrations/0001_schema.sql) — enum, tabel, indeks, RLS, hak kolom, trigger profil, RPC `complete_lesson`, view `weekly_leaderboard`, lencana otomatis.
2. [`supabase/migrations/0002_storage.sql`](supabase/migrations/0002_storage.sql) — bucket publik `audio` & `avatars` + policy tulis hanya ke folder `<user_id>/`.
3. [`supabase/seed.sql`](supabase/seed.sql) — data demo: 3 daerah, Bahasa Jawa & Sunda, 6 lesson (28 soal, keenam tipe), kosakata bertingkat tutur, 2 artikel terbit + 1 draf, 7 lencana, 2 persona AI. Aman dijalankan ulang.
4. [`supabase/migrations/0003_vocab_columns.sql`](supabase/migrations/0003_vocab_columns.sql) — kolom tambahan `vocabularies` (`meaning_en`, `example_meaning`, `peran`, `source`) untuk data dataset. Aman dijalankan ulang.
5. [`supabase/migrations/0004_basanusa_content.sql`](supabase/migrations/0004_basanusa_content.sql) — konten learning path Jawa & Sunda dari `basanusa-dataset/` (sumber NusaX): 20 unit, 82 lesson, 1.242 kosakata, 799 soal. Dibuat otomatis oleh `scripts/generate_basanusa_migration.py`, aman dijalankan ulang. Lihat "Sumber data & lisensi" di bawah.

Lalu daftar lewat `/daftar`. Untuk mencoba halaman moderasi:

```sql
update public.profiles set role = 'moderator' where username = 'username_kamu';
```

Yang ditegakkan database (bukan hanya UI):
- Client **tidak bisa** mengubah `xp_total`, streak, `hearts`, atau `role` (hak kolom), maupun menulis `user_lesson_progress`, `xp_logs`, `user_achievements`. Semua lewat `complete_lesson`.
- `complete_lesson`: XP penuh × skor pada penyelesaian pertama, setengahnya saat mengulang (min. 1); bintang 3/2/1 untuk skor ≥90/≥70/lainnya; streak memakai tanggal WIB; menambah XP profil + per bahasa, `xp_logs`, dan lencana.
- `ai_personas` sama sekali tidak terjangkau `anon`/`authenticated`.
- Usulan kosakata wajib `pending` saat dikirim; hanya moderator/admin yang bisa mengubah `status`/`reviewed_by`. Usulan yang disetujui otomatis masuk `vocabularies` (kategori `kontribusi`).
- Lencana diberikan otomatis berdasarkan `achievements.condition` (`lessons_completed`, `perfect_lesson`, `streak`, `xp_total`, `articles_read`, `contributions_approved`).

Skrip ini diuji dengan 57 skenario (RLS, hak kolom, RPC, streak, leaderboard, moderasi, storage) di Postgres 16 (PGlite) dengan stub `auth`/`storage` ala Supabase — belum dijalankan di proyek Supabase sungguhan.

### Konfigurasi Supabase yang perlu dicek
- **Login Google:** ikuti [docs/setup-google-oauth.md](docs/setup-google-oauth.md) (Google Cloud Console + Supabase).
- **Auth → URL Configuration:** tambahkan `http://localhost:3000/**` (dan domain produksi) ke Redirect URLs — dipakai OAuth Google, konfirmasi email, dan reset password.
- **Storage bucket `audio`:** kontribusi diunggah ke `<user_id>/<timestamp>.webm` dan `audio_url` diisi dengan *public URL*. Jika bucket privat, ganti `getPublicUrl` di `src/components/community/submission-form.tsx` dengan signed URL.
- **RLS `profiles`:** onboarding & pengaturan meng-update `username`, `full_name`, `home_region_id` milik sendiri. Pastikan ada policy update untuk `auth.uid() = id`, dan constraint unik `username` (kode error `23505` ditampilkan sebagai "username sudah dipakai").
- **Moderasi:** halaman moderasi membaca `profiles.username` pengirim secara terpisah; jika policy `profiles` tidak mengizinkan, nama pengirim tampil sebagai "pengguna".
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
