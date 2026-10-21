# Rancangan fitur moderator

> **Status:** Fase A (P1 + P2) diimplementasikan di `supabase/migrations/0005_moderation_core.sql` dengan semua rekomendasi di [bagian 10](#10-keputusan-yang-perlu-dikonfirmasi). Fase B–D masih rancangan · 21 Oktober 2026
> Cakupan: semua prioritas dari diskusi fitur moderator (P1–P5). SQL di dokumen ini adalah **sketsa**; untuk Fase A, migrasinya yang menjadi acuan.

## 1. Ringkasan

Saat ini moderator hanya punya satu halaman (`/kontribusi/moderasi`) dengan tombol Setujui/Tolak. Rancangan ini menambah:

| # | Prioritas | Isi |
| --- | --- | --- |
| P1 | Alur moderasi yang rapi | Alasan penolakan, edit sebelum setuju, cek duplikat, `reviewed_at`, keputusan lewat RPC (tidak bisa dipalsukan), larangan menyetujui usulan sendiri, XP untuk kontributor, batas antrean per user |
| P2 | Moderator per bahasa | Tabel `moderator_languages`, semua hak moderator dibatasi ke bahasa yang dipegang, halaman admin untuk menugaskan moderator |
| P3 | Dashboard moderator | Antrean per bahasa, kiriman tertua, laporan terbuka, statistik pribadi, riwayat aktivitas tim |
| P4 | CMS artikel budaya | Draf → tinjauan → terbit → arsip, editor Markdown + pratinjau, unggah sampul, rujukan, penulis |
| P5 | Laporan & kelola kamus | Tombol "Laporkan" di kamus & artikel, antrean laporan, edit/sembunyikan entri kamus |

### Prinsip

1. **Database tetap penegak utama.** Seperti pola sekarang (`complete_lesson`, hak kolom, RLS): UI hanya menyembunyikan tombol, sedangkan aturan ditegakkan di Postgres.
2. **Keputusan penting lewat RPC.** Persetujuan usulan, penyelesaian laporan, dan penugasan moderator memakai fungsi `security definer` yang mengisi `auth.uid()` sendiri, bukan nilai kiriman client.
3. **Tidak ada yang menyetujui karyanya sendiri.** Berlaku untuk usulan kosakata dan penerbitan artikel.
4. **Cakupan per bahasa.** Moderator hanya bisa bertindak di bahasa yang ditugaskan. Admin bisa bertindak di semua bahasa.
5. **Semua tindakan tercatat** di `moderation_log` (siapa, apa, kapan, sebelum/sesudah).
6. **Tidak ada hapus permanen dari UI.** Kosakata disembunyikan, artikel diarsipkan. Hapus permanen tetap lewat SQL oleh admin.

## 2. Peran & matriks hak akses

| Aksi | User | Moderator (bahasa yang dipegang) | Admin |
| --- | :-: | :-: | :-: |
| Mengusulkan kosakata, membatalkan usulan sendiri yang masih menunggu | ✓ | ✓ | ✓ |
| Melaporkan kesalahan kamus/artikel | ✓ | ✓ | ✓ |
| Meninjau usulan (bukan milik sendiri) | – | ✓ | ✓ (semua bahasa) |
| Mengedit / menyembunyikan entri kamus | – | ✓ | ✓ |
| Menulis draf artikel & mengajukan tinjauan | – | ✓ | ✓ |
| Menerbitkan artikel (bukan tulisan sendiri) | – | ✓ | ✓ (boleh tulisan sendiri*) |
| Menyelesaikan / mengabaikan laporan | – | ✓ | ✓ |
| Melihat dashboard & riwayat | – | data bahasanya | semua |
| Menugaskan moderator & bahasanya | – | – | ✓ |
| Persona AI, kurikulum (unit/lesson/soal), role admin | – | – | via SQL (di luar cakupan) |

\* Lihat [keputusan #1](#10-keputusan-yang-perlu-dikonfirmasi).

Moderator yang belum ditugaskan ke bahasa mana pun tetap bisa membuka `/moderasi`, tetapi hanya melihat empty state "Belum ada bahasa yang ditugaskan. Hubungi admin."

## 3. Skema database

### 3.1 Enum baru

```sql
create type public.reject_reason as enum (
  'duplikat', 'ejaan', 'arti_keliru', 'bukan_bahasa_ini', 'tidak_pantas', 'audio_buruk', 'lainnya'
);
create type public.article_status as enum ('draft', 'review', 'published', 'archived');
create type public.report_target as enum ('vocabulary', 'article');
create type public.report_reason as enum (
  'ejaan', 'arti_keliru', 'tingkat_tutur', 'audio', 'fakta_budaya', 'tidak_pantas', 'lainnya'
);
create type public.report_status as enum ('open', 'resolved', 'dismissed');
create type public.moderation_action as enum (
  'submission_approved', 'submission_rejected',
  'vocab_updated', 'vocab_hidden', 'vocab_restored',
  'article_created', 'article_updated', 'article_status_changed', 'article_deleted',
  'report_resolved', 'report_dismissed',
  'moderator_assigned', 'moderator_removed'
);
```

Enum lama (`user_role`, `submission_status`) **tidak diubah**, karena `alter type … add value` tidak bisa dipakai di transaksi yang sama dengan nilai barunya.

### 3.2 Moderator per bahasa (P2)

```sql
create table public.moderator_languages (
  user_id uuid not null references public.profiles (id) on delete cascade,
  language_id bigint not null references public.languages (id) on delete cascade,
  assigned_by uuid references public.profiles (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (user_id, language_id)
);
create index moderator_languages_language_idx on public.moderator_languages (language_id);
```

Helper (semua `stable security definer set search_path = ''`, mengikuti gaya `is_moderator()`):

```sql
-- true jika user saat ini admin.
create function public.is_admin() returns boolean ...
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');

-- Bahasa yang boleh dimoderasi user saat ini. Admin = semua bahasa.
create function public.moderated_language_ids() returns setof bigint ...
  select l.id from public.languages l where public.is_admin()
  union
  select ml.language_id
  from public.moderator_languages ml
  join public.profiles p on p.id = ml.user_id and p.role = 'moderator'
  where ml.user_id = (select auth.uid());

-- Untuk dipakai di dalam RPC/trigger. Bahasa NULL (artikel umum) = khusus admin.
create function public.can_moderate(p_language_id bigint) returns boolean ...
  select case when p_language_id is null then public.is_admin()
              else p_language_id in (select public.moderated_language_ids()) end;
```

Di **policy**, gunakan bentuk `language_id in (select public.moderated_language_ids())`. Subquery yang tidak berkorelasi dievaluasi sekali per query (initplan), bukan per baris, sehingga tetap cepat untuk tabel kosakata yang berisi lebih dari 7.000 baris.

`is_moderator()` yang lama tetap ada dan berarti "boleh membuka area moderasi".

**Backfill:** moderator yang sudah ada otomatis mendapat semua bahasa agar tidak tiba-tiba kehilangan akses. Setelah itu admin merapikan penugasannya.

```sql
insert into public.moderator_languages (user_id, language_id)
select p.id, l.id from public.profiles p cross join public.languages l
where p.role = 'moderator'
on conflict do nothing;
```

### 3.3 `vocab_submissions` (P1)

```sql
alter table public.vocab_submissions
  add column reject_reason public.reject_reason,
  add column review_note text check (char_length(review_note) <= 500),
  add column reviewed_at timestamptz,
  -- {"word": "...", "meaning_id": "..."} sebelum diedit moderator; NULL bila tidak diedit.
  add column original jsonb,
  -- entri kamus hasil persetujuan (untuk tautan "Lihat di kamus").
  add column vocabulary_id bigint references public.vocabularies (id) on delete set null;

-- NOT VALID: baris lama yang sudah ditolak tanpa alasan tidak ikut dicek.
alter table public.vocab_submissions
  add constraint submissions_rejected_has_reason
  check (status <> 'rejected' or reject_reason is not null) not valid;

create index submissions_reviewed_idx on public.vocab_submissions (reviewed_by, reviewed_at desc);
```

- **Trigger `before insert` (anti-spam):** tolak jika user masih punya 20 usulan `pending` atau lebih. Pesan: "Masih ada 20 usulanmu yang menunggu ditinjau. Tunggu sebagian ditinjau dulu, ya."
- **Trigger lama `vocab_submission_reviewed` dihapus.** Penambahan ke kamus dipindah ke RPC `review_submission` agar edit, cek duplikat, XP, dan log terjadi dalam satu transaksi.

### 3.4 `moderation_log` (audit)

```sql
create table public.moderation_log (
  id bigint generated by default as identity primary key,
  actor_id uuid references public.profiles (id) on delete set null,
  action public.moderation_action not null,
  language_id bigint references public.languages (id) on delete set null,
  target_type text not null check (target_type in ('submission', 'vocabulary', 'article', 'report', 'moderator')),
  target_id text not null,
  detail jsonb,            -- mis. {"before": {...}, "after": {...}, "reason": "ejaan", "note": "..."}
  created_at timestamptz not null default now()
);
create index moderation_log_language_idx on public.moderation_log (language_id, created_at desc);
create index moderation_log_actor_idx on public.moderation_log (actor_id, created_at desc);
```

Log hanya ditulis oleh RPC/trigger lewat fungsi internal `log_moderation(...)` (tidak bisa dieksekusi client).

### 3.5 `vocabularies` (P5 — kelola kamus, dan P1 — atribusi)

```sql
alter table public.vocabularies
  add column is_hidden boolean not null default false,
  add column hidden_reason text check (char_length(hidden_reason) <= 300),
  add column contributed_by uuid references public.profiles (id) on delete set null,
  add column updated_at timestamptz,
  add column updated_by uuid references public.profiles (id) on delete set null;

-- Cek duplikat saat meninjau usulan.
create index vocab_lang_word_lower_idx on public.vocabularies (language_id, lower(word));
```

Kolom `contributed_by` diisi oleh `review_submission`, dan `source` diisi `'kontribusi'`. Saat ini kolom `source` untuk kata kontribusi bernilai NULL, dan backfill-nya dilakukan dari `category = 'kontribusi'`.

Trigger:

- **`before update`:** mengisi `updated_at` dan `updated_by = auth.uid()`. Jika `is_hidden` berubah menjadi `true`, maka `hidden_reason` wajib diisi, dan perubahan **ditolak jika kata dipakai di `questions`** (pesan: "Kata ini dipakai di N soal. Perbaiki isinya saja, jangan disembunyikan.").
- **`after update`:** menulis log `vocab_updated`, `vocab_hidden`, atau `vocab_restored` beserta diff kolom yang berubah.

### 3.6 `cultural_articles` (P4)

```sql
alter table public.cultural_articles
  add column status public.article_status not null default 'draft',
  add column author_id uuid references public.profiles (id) on delete set null,
  add column sources text check (char_length(sources) <= 4000),       -- daftar rujukan (Markdown)
  add column review_note text check (char_length(review_note) <= 500), -- catatan saat dikembalikan ke draf
  add column created_at timestamptz not null default now(),
  add column updated_at timestamptz,
  add column updated_by uuid references public.profiles (id) on delete set null,
  add column published_at timestamptz,
  add column published_by uuid references public.profiles (id) on delete set null;

update public.cultural_articles
   set status = case when is_published then 'published'::public.article_status else 'draft' end,
       published_at = case when is_published then now() end;

-- is_published dipertahankan sebagai kolom turunan, jadi semua query `.eq("is_published", true)`
-- dan policy baca publik tidak perlu diubah.
drop policy "Artikel terbit dapat dibaca" on public.cultural_articles;
alter table public.cultural_articles drop column is_published;
alter table public.cultural_articles
  add column is_published boolean generated always as (status = 'published') stored;
create policy "Artikel terbit dapat dibaca" on public.cultural_articles
  for select to anon, authenticated using (is_published);
```

Trigger **`before update`** menegakkan transisi status:

| Dari → ke | Syarat |
| --- | --- |
| `draft` → `review` | moderator bahasa itu (biasanya penulis) |
| `review` → `draft` | jika pelakunya bukan penulis, `review_note` wajib diisi ("dikembalikan dengan catatan") |
| `review` → `published` | pelaku ≠ `author_id` (kecuali admin, lihat keputusan #1); mengisi `published_at`, `published_by`, dan mengosongkan `review_note` |
| `published` → `draft` / `archived` | moderator bahasa itu (tarik atau arsipkan) |
| `archived` → `draft` | moderator bahasa itu |
| status sama | boleh (mengedit isi); tercatat sebagai `article_updated` |
| lainnya | ditolak (`NL422`) |

Trigger `after insert/update/delete` menulis ke `moderation_log`.

### 3.7 `content_reports` (P5)

```sql
create table public.content_reports (
  id bigint generated by default as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  vocabulary_id bigint references public.vocabularies (id) on delete cascade,
  article_id bigint references public.cultural_articles (id) on delete cascade,
  language_id bigint references public.languages (id) on delete set null, -- diisi trigger dari target
  reason public.report_reason not null,
  message text check (char_length(message) <= 500),
  status public.report_status not null default 'open',
  resolution_note text check (char_length(resolution_note) <= 500),
  resolved_by uuid references public.profiles (id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check ((target_type = 'vocabulary') = (vocabulary_id is not null)),
  check ((target_type = 'article') = (article_id is not null))
);
-- Satu laporan terbuka per pelapor per target (23505 → "Kamu sudah melaporkan ini").
create unique index content_reports_open_unique
  on public.content_reports (reporter_id, target_type, coalesce(vocabulary_id, article_id))
  where status = 'open';
create index content_reports_queue_idx on public.content_reports (language_id, status, created_at);
```

Trigger **`before insert`** mengisi `language_id` dari target, memaksa `status = 'open'` dan kolom `resolved_*` bernilai NULL, serta membatasi maksimal 10 laporan terbuka per pelapor.

### 3.8 Storage: bucket `budaya` (P4)

Bucket publik untuk sampul dan gambar isi artikel: maksimal 5 MB, png/jpeg/webp, path `<user_id>/<timestamp>.<ext>`. Policy insert, select, dan delete mengikuti pola `0002_storage.sql`, ditambah syarat `(select public.is_moderator())` untuk insert.

## 4. RPC & trigger

### 4.1 Daftar RPC

| Fungsi | Dipanggil oleh | Fungsi singkat | Fase |
| --- | --- | --- | --- |
| `review_submission(p_id, p_decision, p_reject_reason, p_note, p_edits)` | moderator bahasa itu | Setujui/tolak dalam satu transaksi (lihat 4.2) | A |
| `get_submission_queue(p_status, p_language_id, p_page)` | moderator | Antrean beserta nama dan rekam jejak pengusul, kandidat duplikat, dan `total_count` | A |
| `set_moderator_languages(p_user, p_language_ids bigint[])` | admin | Mengganti penugasan bahasa; mengubah `role` user ↔ moderator (tidak pernah menyentuh admin); dicatat di log | A |
| `get_moderation_overview()` | moderator | Per bahasa yang dipegang: usulan menunggu, kiriman tertua, laporan terbuka, artikel menunggu tinjauan, draf | B |
| `get_my_moderation_stats(p_days default 7)` | moderator | Jumlah tinjauan, rasio setuju, rata-rata waktu tinjau, artikel terbit, laporan selesai | B |
| `get_report_queue(p_status, p_language_id, p_page)` | moderator | Laporan **dikelompokkan per target** (mis. "3 orang melaporkan ini") | D |
| `resolve_reports(p_target_type, p_target_id, p_status, p_note)` | moderator | Menutup semua laporan terbuka untuk satu target sekaligus | D |

Semua RPC memeriksa `auth.uid()` dan `can_moderate()` di dalam fungsi. `execute` di-grant hanya ke `authenticated`.

### 4.2 `review_submission` — alur

```text
1. auth.uid() wajib ada                                    → 28000
2. SELECT … FOR UPDATE usulan                               → P0002 jika tidak ada
3. can_moderate(usulan.language_id)                         → 42501
4. usulan.user_id ≠ auth.uid()  (tidak menilai milik sendiri) → 42501
5. status masih 'pending'  (dua moderator bersamaan)         → NL409
6a. Ditolak:  reject_reason wajib → simpan alasan, catatan, reviewed_by = auth.uid(), reviewed_at = now()
6b. Disetujui:
    - terapkan p_edits.word / p_edits.meaning_id (trim, 1–80 / 1–200); simpan `original` jika berubah
    - tolak bila sudah ada kata + arti yang sama (lower) di bahasa itu dan tidak disembunyikan → NL422
    - INSERT vocabularies (source 'kontribusi', category 'kontribusi', contributed_by,
      + opsional dari p_edits: speech_level, example_sentence, example_meaning)
    - simpan vocabulary_id, reviewed_by, reviewed_at, review_note
    - XP kontributor (keputusan #2): profiles.xp_total += 15, xp_logs (source 'contribution'),
      user_languages.xp += 15 HANYA jika barisnya sudah ada (jangan membuat user "mengikuti" bahasa baru)
    - award_achievements(kontributor)
7. log_moderation(...)
8. RETURN {"status", "vocabulary_id", "xp_awarded"}
```

### 4.3 Kode error untuk UI

| Kode | Arti | Pesan di UI |
| --- | --- | --- |
| `28000` | Belum login | arahkan ke `/masuk` |
| `42501` | Di luar wewenang (bahasa lain / milik sendiri) | "Kamu tidak bisa meninjau kiriman ini." |
| `P0002` | Tidak ditemukan | "Data tidak ditemukan, mungkin sudah dihapus." |
| `NL409` | Sudah ditinjau moderator lain | toast + `router.refresh()` |
| `NL422` | Validasi (duplikat, alasan kosong, transisi status tidak sah) | pesan dari `error.message` |
| `NL429` | Batas 20 usulan menunggu tercapai | pesan dari `error.message` |
| `23505` | Slug artikel dipakai / laporan ganda | pesan spesifik di form |

## 5. RLS & hak kolom per tabel

| Tabel | SELECT | INSERT | UPDATE | DELETE |
| --- | --- | --- | --- | --- |
| `moderator_languages` | baris sendiri, atau admin | – (lewat RPC) | – | – |
| `vocab_submissions` | milik sendiri **atau** `language_id in moderated_language_ids()` | sendiri, `status = 'pending'`; grant kolom `(user_id, language_id, word, meaning_id, audio_url, status)` | **dicabut seluruhnya**, hanya lewat `review_submission` | sendiri & `status = 'pending'` |
| `moderation_log` | `language_id in moderated…` atau (NULL & admin) | – | – | – |
| `vocabularies` | `not is_hidden` (anon/auth) **atau** `is_moderator()` | – | `language_id in moderated…` (using & check); grant kolom `(word, meaning_id, meaning_en, speech_level, pronunciation, example_sentence, example_meaning, category, is_hidden, hidden_reason)` | – |
| `cultural_articles` | `is_published` (anon/auth) **atau** bahasa yang dimoderasi (NULL = admin) | penulis = `auth.uid()`, `status = 'draft'`, bahasa dimoderasi | bahasa dimoderasi (using & check) + trigger transisi; grant kolom isi + `status`, `review_note` | `status = 'draft'` dan (penulis atau admin) |
| `content_reports` | pelapor sendiri **atau** bahasa dimoderasi | `reporter_id = auth.uid()`; grant kolom `(reporter_id, target_type, vocabulary_id, article_id, reason, message)` | – (lewat `resolve_reports`) | – |

Catatan:

- Kolom `language_id` pada `vocabularies` dan `cultural_articles` **tidak** di-grant untuk update oleh moderator, sehingga moderator tidak bisa "memindahkan" konten ke bahasa yang bukan wewenangnya. Untuk artikel, `language_id` boleh diubah, dan `with check` tetap mewajibkan bahasa barunya juga ia moderasi.
- Policy SELECT `vocabularies` untuk moderator memakai `is_moderator()`, bukan cakupan bahasa. Melihat kata tersembunyi dari bahasa lain tidak berbahaya, dan bentuk ini paling murah untuk tabel besar.

## 6. Halaman & alur UI

### 6.1 Struktur route & navigasi

Area moderasi dipindah dari `/kontribusi/moderasi` ke `/moderasi` karena cakupannya kini lebih dari kontribusi. Route lama di-redirect permanen ke `/moderasi/antrean` (`redirects()` di `next.config.mjs`).

```text
src/app/(app)/moderasi/
  layout.tsx            guard role (403 ramah seperti sekarang) + sub-navigasi tab
  page.tsx              Dashboard                          (Fase B; di Fase A redirect ke /antrean)
  antrean/page.tsx      Antrean usulan kosakata            (A)
  kamus/page.tsx        Kelola kamus                       (D)
  artikel/page.tsx      Daftar artikel per status          (C)
  artikel/baru/page.tsx Editor artikel baru                (C)
  artikel/[id]/page.tsx Editor artikel                     (C)
  laporan/page.tsx      Antrean laporan                    (D)
  riwayat/page.tsx      Riwayat aktivitas (moderation_log) (B)
  tim/page.tsx          Kelola moderator — khusus admin    (A)
```

- **Navigasi:** `NAV_ITEMS` mengganti entri "Moderasi" menjadi `/moderasi` (roles moderator/admin), dengan badge jumlah usulan menunggu (satu query `count` di layout `(app)`, hanya untuk moderator). Tautan di header `/kontribusi` dan menu `/profil` ikut diganti.
- **Sub-navigasi** memakai pola tab yang sudah ada di halaman moderasi (`nav` + `aria-current`), dapat digulir horizontal di mobile. Tab "Tim" hanya muncul untuk admin.
- **Tema:** kategori `komunitas` untuk antrean, laporan, dan tim; `budaya` untuk artikel; `belajar` untuk kamus. Sama dengan pewarnaan `PageHeader` yang sudah ada.

### 6.2 `/moderasi` — Dashboard (P3)

```text
┌ Moderasi · Bahasa Jawa, Bahasa Sunda ───────────────────────────────┐
│ [ 24 usulan menunggu ] [ tertua 3 hari ] [ 5 laporan ] [ 2 artikel ] │  ← stat tile, bisa diklik
├──────────────────────────────────────────────────────────────────────┤
│ Antrean per bahasa                                                   │
│ Bahasa   Menunggu  Tertua    Laporan  Artikel ditinjau               │
│ Jawa        18     3 hari       4          1          → Tinjau       │
│ Sunda        6     5 jam        1          1          → Tinjau       │
├──────────────────────────────────────────────────────────────────────┤
│ Aktivitasmu 7 hari: 41 ditinjau · 83% disetujui · rata-rata 6 jam    │
│ Aktivitas terbaru tim (10)                          Lihat riwayat →  │
└──────────────────────────────────────────────────────────────────────┘
```

- Data diambil dari `get_moderation_overview()` dan `get_my_moderation_stats(7)`. "Aktivitas terbaru" berasal dari `moderation_log` (10 baris terakhir).
- Tidak ada grafik pada versi pertama: angka yang membantu menghabiskan antrean lebih berguna. Sparkline bisa ditambahkan nanti.
- Empty state "Semua beres!" (`IlloCheck`) bila tidak ada pekerjaan.

### 6.3 `/moderasi/antrean` — Tinjau usulan (P1)

- **Filter:** tab status (Menunggu / Disetujui / Ditolak), pilihan bahasa (hanya yang dipegang), urutan tertua dulu, paginasi 20.
- **Kartu usulan:**
  - kata, arti, badge bahasa, pemutar audio (seperti sekarang);
  - pengusul: "@sari · 12 usulan, 83% disetujui" (sinyal kepercayaan dari `get_submission_queue`);
  - **peringatan duplikat** bila ada kata sama di kamus: "Sudah ada: *Matur nuwun* — terima kasih", dengan tombol cepat "Tolak sebagai duplikat";
  - usulan milik sendiri tampil terkunci: "Usulanmu — perlu ditinjau moderator lain".
- **Aksi:**
  - **Setujui** → `review_submission(id, 'approved')`.
  - **Edit & setujui** → dialog berisi kata, arti, serta tingkat tutur, contoh kalimat, dan terjemahnya (opsional). Tingkat tutur memakai `datalist` dari `getVocabFacets`.
  - **Tolak** → dialog dengan chip alasan (wajib, dari `reject_reason`) dan catatan untuk kontributor (opsional, terisi template per alasan, maks. 500).
- Tab Disetujui/Ditolak menampilkan siapa peninjaunya, kapan, alasan/catatan, dan tanda "diedit" bila ada `original`.

### 6.4 `/moderasi/kamus` — Kelola kamus (P5)

- Pilih bahasa → cari (memakai ulang `getVocabularies`, ditambah filter "Tersembunyi" dan "Kontribusi").
- Tabel: kata, arti, tingkat tutur, sumber (`seed` / `NusaX` / `kontribusi`), **dipakai di N soal**, status.
- **Edit** → dialog `VocabEditDialog` (dipakai ulang di Sheet kamus, lihat 6.9).
- **Sembunyikan** → alasan wajib. Tombol nonaktif dengan keterangan bila kata dipakai di soal; database juga menolaknya. **Pulihkan** untuk entri tersembunyi.
- Catatan untuk entri NusaX: hasil edit tetap aman saat generator dijalankan ulang (`on conflict do nothing`), dan kolom `source` tetap `NusaX` untuk atribusi lisensi.

### 6.5 `/moderasi/artikel` — CMS artikel budaya (P4)

**Daftar:** tab Draf · Perlu ditinjau · Terbit · Arsip. Kolom: judul, bahasa, penulis, status, terakhir diubah. Tombol "Tulis artikel".

**Editor** (`/moderasi/artikel/baru`, `/moderasi/artikel/[id]`):

- **Kolom isian:**
  - judul, dan slug yang dibuat otomatis dari judul tetapi bisa diedit (cek `23505`);
  - kategori (`ARTICLE_CATEGORIES`), bahasa (hanya yang dipegang), dan daerah (otomatis dari `languages.region_id`, bisa diubah);
  - ringkasan (maks. 300) dan sampul (unggah ke bucket `budaya`);
  - **isi** (Markdown) dan **rujukan** (Markdown).
- **Isi Markdown:** `textarea` dengan toolbar kecil (H2, H3, tebal, miring, daftar, tautan, sisipkan gambar), plus tab **Tulis | Pratinjau**. Pratinjau memakai komponen `MarkdownContent` dan `extractHeadings` yang sudah ada, jadi tidak perlu dependensi baru.
- **Daftar periksa** sebelum diajukan (peringatan, bukan pemblokir): ringkasan terisi, minimal 2 subjudul `##` (supaya daftar isi muncul), rujukan terisi, dan minimal ±300 kata.
- **Bilah aksi sesuai status:**

  | Status | Penulis | Moderator lain / admin |
  | --- | --- | --- |
  | Draf | Simpan draf · Ajukan tinjauan · Hapus | Simpan |
  | Ditinjau | Tarik ke draf | **Terbitkan** · Kembalikan ke draf (catatan wajib) |
  | Terbit | Simpan perubahan · Tarik dari publikasi · Arsipkan | sama |
  | Arsip | Pulihkan ke draf | sama |

- Catatan dari peninjau (`review_note`) tampil sebagai banner di atas editor.
- Penjaga perubahan belum tersimpan (`beforeunload` + konfirmasi saat berpindah tab).

### 6.6 `/moderasi/laporan` — Laporan pengguna (P5)

- Tab Terbuka / Selesai / Diabaikan; filter bahasa dan jenis (kosakata/artikel).
- **Kartu per target**, bukan per laporan: pratinjau target (kata + arti, atau judul artikel) dengan tautan, jumlah pelapor, daftar alasan dan pesan, serta waktu laporan pertama.
- **Aksi:**
  - **Perbaiki** → membuka `VocabEditDialog` atau editor artikel. Setelah disimpan, muncul tombol **Tandai selesai** (catatan opsional).
  - **Abaikan** → catatan wajib (misalnya "Ejaan sudah sesuai kamus baku").
  - Keduanya memanggil `resolve_reports`.

### 6.7 `/moderasi/riwayat` — Riwayat aktivitas (P3)

Daftar `moderation_log` dengan filter aksi, bahasa, dan moderator; paginasi 30. Setiap baris berbunyi seperti "@budi menolak *sugeng enjang* (ejaan) · Bahasa Jawa · 2 jam lalu", dengan tautan ke target. Admin melihat semua bahasa.

### 6.8 `/moderasi/tim` — Kelola moderator (admin, P2)

- Tabel moderator: username, bahasa (chip), jumlah tinjauan 30 hari, aktif terakhir.
- **Tambah moderator:** cari username (tabel `profiles` sudah bisa dibaca user login), lalu pilih bahasa lewat checkbox → `set_moderator_languages`.
- **Edit bahasa** atau **Cabut** (array kosong mengembalikan role ke `user`). Admin lain tidak bisa diubah dari sini.

### 6.9 Perubahan halaman pengguna

| Halaman | Perubahan | Fase |
| --- | --- | --- |
| `/kontribusi` | Badge **Ditolak** disertai alasan dan catatan moderator (berupa teks, bukan hanya tooltip); tanda "Disetujui dengan perubahan: *matur nuwun* → *Matur nuwun*"; "+15 XP" dan tautan "Lihat di kamus" untuk yang disetujui; tombol **Batalkan** untuk usulan menunggu (sekaligus menghapus berkas audionya); pesan batas 20 usulan | A |
| `/kamus/[code]` (Sheet detail) | Atribusi "Kontribusi @username" bila `contributed_by` terisi; tombol **Laporkan kesalahan** (dialog: alasan + pesan); tombol **Edit** untuk moderator bahasa itu; query menambah `.eq("is_hidden", false)` | A (atribusi), D (lainnya) |
| `/budaya/[slug]` | Byline "Ditulis oleh @x · Terbit 12 Okt 2026"; bagian **Rujukan**; tombol **Laporkan**; tombol **Edit artikel** untuk moderator bahasa itu | C, D |
| `/budaya` | Urutan `published_at desc nulls last, id desc` | C |
| `/kontribusi` → "Laporan saya" | Daftar laporan sendiri beserta status dan catatan penyelesaian | D |
| `/ketentuan` | Menyebut bahwa username kontributor ditampilkan sebagai atribusi di kamus, dan XP untuk kontribusi | A |

## 7. Struktur kode

**Baru:**

```text
src/lib/queries/moderation.ts        antrean, overview, statistik, log, laporan, tim (memanggil RPC)
src/lib/moderation-errors.ts         memetakan kode error (tabel 4.3) ke pesan Indonesia
src/components/moderation/
  moderation-nav.tsx                 sub-navigasi tab
  submission-review-card.tsx         menggantikan community/moderation-actions.tsx
  reject-dialog.tsx                  chip alasan + catatan
  approve-edit-dialog.tsx            edit & setujui
  duplicate-hint.tsx
  stat-tile.tsx, language-queue-table.tsx, activity-list.tsx
  vocab-edit-dialog.tsx              dipakai di /moderasi/kamus, laporan, dan Sheet kamus
  article-editor.tsx                 form + toolbar Markdown + pratinjau + unggah sampul
  article-status-badge.tsx
  report-target-card.tsx, resolve-report-dialog.tsx
  moderator-assign-dialog.tsx
src/components/community/report-dialog.tsx   tombol + dialog laporan untuk pengguna
supabase/migrations/0005_…0008_…sql          lihat bagian 8
```

**Diubah:** `nav-items.ts`, `app-shell.tsx` (badge), `(app)/layout.tsx` (count menunggu), `kontribusi/page.tsx`, `submission-status.tsx`, `vocab-list.tsx`, `budaya/[slug]/page.tsx`, `queries/culture.ts`, `queries/content.ts`, `queries/community.ts`, `validation.ts` (skema `rejectSchema`, `approveEditSchema`, `vocabEditSchema`, `articleSchema`, `reportSchema`), `constants.ts` (`REJECT_REASON_LABEL`, `REPORT_REASON_LABEL`, `ARTICLE_STATUS_LABEL`, `CONTRIBUTION_XP`), `next.config.mjs` (redirect), `types/database.ts` (regenerasi lewat `npm run gen:types`), dan `README.md` (urutan migrasi + aturan baru).

**Dihapus:** `src/app/(app)/kontribusi/moderasi/page.tsx` dan `components/community/moderation-actions.tsx`.

Pola mutasi tetap sama dengan sekarang: client Supabase + RLS untuk tulisan sederhana (artikel, edit kamus, laporan), dan `supabase.rpc(...)` untuk keputusan. Tidak perlu route handler baru, kecuali fitur AI nanti.

## 8. Rencana fase & migrasi

Setiap fase menjadi satu PR yang bisa dirilis sendiri.

| Fase | Prioritas | Migrasi | Halaman | Ukuran |
| --- | --- | --- | --- | --- |
| **A** | P1 + P2 | `0005_moderation_core.sql`: enum `reject_reason` & `moderation_action`, `moderator_languages` + helper + backfill, kolom `vocab_submissions`, anti-spam, `moderation_log`, `vocabularies.contributed_by` (+ backfill `source`), RPC `review_submission`, `get_submission_queue`, `set_moderator_languages`, policy & grant baru, hapus trigger lama | layout `/moderasi`, `antrean`, `tim`, perubahan `/kontribusi`, redirect, nav, atribusi kamus | besar |
| **B** | P3 | `0006_moderation_dashboard.sql`: `get_moderation_overview`, `get_my_moderation_stats` | `/moderasi`, `riwayat` | kecil |
| **C** | P4 | `0007_articles_cms.sql`: enum `article_status`, kolom artikel, `is_published` menjadi kolom turunan, policy, grant, trigger transisi, bucket `budaya` | `artikel`, editor, perubahan `/budaya` | besar |
| **D** | P5 | `0008_reports_vocab.sql`: enum laporan, `content_reports`, kolom & trigger `vocabularies` (sembunyikan), RPC laporan | `laporan`, `kamus`, tombol Laporkan, Edit di Sheet kamus | sedang |

**Dampak ke seed (Fase C):** `seed.sql` dan `seed_budaya.sql` meng-insert kolom `is_published`, yang setelah migrasi menjadi kolom turunan. Kedua seed harus diubah ke `status` ('published' / 'draft'), karena jika tidak, menjalankan ulang seed akan gagal.

### Skenario uji SQL (minimal)

Diuji sebagai user, moderator Jawa, moderator Sunda, dan admin:

1. User biasa tidak bisa memanggil `review_submission` (42501) dan tidak bisa `update` `vocab_submissions` langsung.
2. Moderator Jawa tidak bisa melihat atau meninjau usulan Sunda.
3. Moderator tidak bisa menyetujui usulannya sendiri.
4. Dua persetujuan bersamaan: yang kedua mendapat `NL409`, dan kata hanya masuk kamus satu kali.
5. Penolakan tanpa alasan ditolak; penolakan dengan alasan menyimpan `reviewed_by = auth.uid()`, bukan nilai kiriman client.
6. Edit & setujui menyimpan `original` dan memasukkan kata hasil edit ke kamus.
7. Duplikat persis (kata + arti) ditolak dengan `NL422`.
8. Persetujuan menambah XP, `xp_logs`, lencana, dan **tidak** menambah baris `user_languages` baru.
9. Usulan ke-21 yang masih menunggu ditolak.
10. User bisa membatalkan usulan menunggu miliknya, tetapi tidak usulan yang sudah ditinjau.
11. Kata yang dipakai soal tidak bisa disembunyikan; kata yang disembunyikan hilang dari kamus publik dan dari hitungan landing.
12. Penulis tidak bisa menerbitkan artikelnya sendiri; moderator lain bisa. Transisi yang tidak sah ditolak.
13. User biasa tidak bisa membaca draf; moderator bahasa lain juga tidak bisa.
14. Laporan ganda yang masih terbuka ditolak (23505); `resolve_reports` menutup semua laporan untuk target itu.
15. `set_moderator_languages` hanya bisa dijalankan admin dan tidak bisa menurunkan admin.

## 9. Risiko & dampak ke fitur lain

- **Kosakata tersembunyi dan join:** `getDueReviews` (ulasan) dan lesson player melakukan join ke `vocabularies`. Kata yang disembunyikan akan muncul sebagai `null`, dan `review-session.tsx` membaca `item.vocabulary` tanpa pengecekan. Risiko ini sudah dikurangi karena kata yang dipakai soal tidak bisa disembunyikan. Sebagai pengaman tambahan, ubah join ulasan menjadi `vocabularies!inner(...)`.
- **Kamus untuk moderator** ikut menampilkan entri tersembunyi (policy SELECT moderator), jadi query kamus publik wajib menambahkan `.eq("is_hidden", false)`.
- **Trigger lama dihapus:** jika admin mengubah `status` usulan langsung lewat SQL Editor, kata **tidak** otomatis masuk kamus lagi. Hal ini perlu ditulis di README.
- **Privasi atribusi:** username kontributor tampil di kamus untuk semua user login. Perlu disebut di `/ketentuan` (lihat keputusan #8).
- **Performa policy:** selalu gunakan `in (select public.moderated_language_ids())`, jangan `can_moderate(language_id)` per baris di policy.
- **Tipe TypeScript:** `npm run gen:types` membutuhkan `SUPABASE_PROJECT_ID` dan login. Jika tidak tersedia, `src/types/database.ts` perlu diedit manual dengan teliti (enum, tabel, dan RPC baru).

## 10. Keputusan yang perlu dikonfirmasi

| # | Pertanyaan | Rekomendasi |
| --- | --- | --- |
| 1 | Artikel memakai prinsip "empat mata" (penulis tidak boleh menerbitkan tulisannya sendiri)? | **Ya** untuk moderator. Admin dikecualikan agar bahasa yang moderatornya hanya satu orang tidak macet. |
| 2 | Usulan yang disetujui memberi XP? Berapa? | **Ya, 15 XP** (setara 1,5 lesson). Label `contribution` sudah ada di `XP_SOURCE_LABEL`, dan XP ini ikut dihitung di peringkat mingguan. |
| 3 | Admin juga dilarang meninjau usulan sendiri? | **Ya**, supaya konsisten. Admin tetap bisa mengedit kamus langsung. |
| 4 | Moderator lama otomatis mendapat semua bahasa saat migrasi? | **Ya**, lalu admin merapikan di `/moderasi/tim`. |
| 5 | Pindah route ke `/moderasi` (dengan redirect dari route lama)? | **Ya.** |
| 6 | Artikel yang sudah terbit boleh diedit tanpa tinjauan ulang? | **Ya**, untuk koreksi kecil, dan tercatat di log. Perubahan besar sebaiknya lewat "Tarik ke draf". |
| 7 | Batas 20 usulan menunggu per user dan 10 laporan terbuka per user? | **Ya**, angkanya mudah diubah di trigger. |
| 8 | Tampilkan "Kontribusi @username" di kamus? | **Ya**, sebagai motivasi, dan disebut di `/ketentuan`. |

## 11. Di luar cakupan (nanti)

- **Pemeriksaan awal oleh AI:** route handler `/api/moderasi/cek` memakai Gemini (infrastruktur `/api/chat` yang sudah ada) dan mengembalikan saran ejaan, kecocokan arti, serta tingkat tutur sebagai "Saran AI" di kartu antrean. AI tidak pernah memutuskan sendiri.
- Notifikasi in-app atau email saat usulan ditinjau atau laporan selesai.
- Lencana khusus moderator (misalnya "Penjaga Bahasa" untuk 50 tinjauan) lewat tipe kondisi baru di `award_achievements`.
- Banding atas penolakan.
- Moderator menambah kata langsung tanpa usulan.
- Mengelola kurikulum (unit, lesson, soal), persona AI, dan memblokir user lewat UI.
