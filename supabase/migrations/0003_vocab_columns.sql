-- =====================================================================
-- Nusa Lingua — kolom tambahan untuk integrasi basanusa-dataset
--
-- Menambahkan kolom yang dimiliki dataset tetapi belum ada di skema
-- aplikasi. Jalankan SEKALI sebelum 0004_basanusa_content.sql.
-- Aman dijalankan ulang (if not exists).
--
--   meaning_en    arti bahasa Inggris (dari kolom `arti_en` dataset)
--   example_meaning  terjemah bahasa Indonesia dari contoh kalimat
--   peran         'inti' = materi pelajaran & sumber soal,
--                 'varian' = padanan/sinonim yang ditampilkan di kamus
--   source        sumber data ('seed' / 'NusaX' / ...) untuk atribusi
-- =====================================================================

begin;

alter table public.vocabularies
  add column if not exists meaning_en text,
  add column if not exists example_meaning text,
  add column if not exists peran text not null default 'inti'
    check (peran in ('inti', 'varian')),
  add column if not exists source text;

comment on column public.vocabularies.meaning_en is 'Arti dalam bahasa Inggris (opsional, dari basanusa-dataset).';
comment on column public.vocabularies.example_meaning is 'Terjemah bahasa Indonesia dari example_sentence.';
comment on column public.vocabularies.peran is 'inti = materi pelajaran & sumber soal; varian = padanan/sinonim untuk arti yang sama.';
comment on column public.vocabularies.source is 'Sumber data kosakata (mis. NusaX, seed) untuk keperluan atribusi.';

commit;
