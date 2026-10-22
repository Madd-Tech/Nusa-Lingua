-- =====================================================================
-- Nusa Lingua — jenis kelamin pengguna & panggilan per persona AI
--
--   profil    profiles.gender ('male' / 'female'; NULL = belum diisi).
--             Diisi saat onboarding, bisa diubah di Pengaturan.
--   persona   ai_personas.address_male / address_female: cara persona
--             memanggil pengguna laki-laki / perempuan dalam bahasanya.
--             /api/chat menyisipkan salah satunya ke system prompt sesuai
--             gender pengguna. NULL = belum ada data → persona diminta
--             memakai sapaan netral dan tidak mengarang panggilan.
--
-- Panggilan di bawah adalah sapaan umum yang lazim dikenal, tetapi seperti
-- isi Basanusa lainnya BELUM diverifikasi penutur asli. Dayak Ngaju sengaja
-- dikosongkan karena belum ada sumber yang meyakinkan.
--
-- Jalankan SEKALI setelah 0008_reports_vocab.sql.
-- =====================================================================

begin;

create type public.user_gender as enum ('male', 'female');

alter table public.profiles add column gender public.user_gender;

-- Kolom identitas: boleh diubah pemiliknya, sama seperti username/avatar.
grant update (gender) on public.profiles to authenticated;

alter table public.ai_personas
  add column address_male text check (char_length(address_male) <= 300),
  add column address_female text check (char_length(address_female) <= 300);

update public.ai_personas p
set address_male = v.address_male,
    address_female = v.address_female
from (values
  -- Mbah Darmo (Jawa) — kakek kepada anak/cucu
  (1,
   '"Le" (dari "thole", panggilan sayang orang tua kepada anak laki-laki); untuk sapaan sopan boleh "Mas".',
   '"Nduk" (dari "genduk", panggilan sayang orang tua kepada anak perempuan); untuk sapaan sopan boleh "Mbak".'),
  -- Teh Euis (Sunda) — perempuan muda
  (2,
   '"Akang" / "Kang" (sapaan sopan untuk laki-laki); "Aa" juga lazim.',
   '"Teteh" / "Teh" (sapaan sopan untuk perempuan); "Neng" bila pengguna terasa lebih muda.'),
  -- Nek Aminah (Aceh) — nenek kepada cucu
  (3,
   '"Neuk" (nak); bila perlu menyebut jenis kelaminnya, pakai "aneuk agam" (anak laki-laki).',
   '"Neuk" (nak); bila perlu menyebut jenis kelaminnya, pakai "aneuk inong" (anak perempuan).'),
  -- Amang Tigor (Batak Toba) — bapak; sapaan Batak bergantung gender pembicara & lawan bicara
  (4,
   '"Lae" (sapaan akrab antarlelaki); bila pengguna jauh lebih muda boleh "Amang" (panggilan sayang kepada anak laki-laki).',
   '"Ito" (sapaan laki-laki kepada perempuan); bila pengguna jauh lebih muda boleh "Inang" (panggilan sayang kepada anak perempuan).'),
  -- Uda Rizal (Minangkabau) — pemuda
  (5,
   '"Uda" (sapaan sopan untuk laki-laki, seperti "Mas"); "Buyuang" bila pengguna jelas jauh lebih muda.',
   '"Uni" (sapaan sopan untuk perempuan, seperti "Mbak"); "Upiak" bila pengguna jelas jauh lebih muda.'),
  -- Kak Sitti (Madura) — kakak perempuan
  (6,
   '"Kacong" atau "Cong" (panggilan untuk pemuda/anak laki-laki).',
   '"Jebbing" (panggilan untuk gadis/anak perempuan).'),
  -- Luh Sari (Bali) — gadis muda
  (7,
   '"Bli" (sapaan sopan untuk laki-laki, seperti "Mas"); "Gus" bila pengguna lebih muda.',
   '"Mbok" (sapaan sopan untuk perempuan, seperti "Mbak"); "Gek" bila pengguna lebih muda.'),
  -- Daeng Baso (Bugis) — sapaan kekerabatan Bugis umumnya netral gender
  (8,
   'Sapaan Bugis umumnya tidak membedakan gender: "Ndi''" (adik) bila lebih muda, "Daeng" bila lebih tua. Bila perlu menyebut jenis kelaminnya, pakai "burane" (laki-laki).',
   'Sapaan Bugis umumnya tidak membedakan gender: "Ndi''" (adik) bila lebih muda, "Daeng" bila lebih tua. Bila perlu menyebut jenis kelaminnya, pakai "makkunrai" (perempuan).'),
  -- Bapa Ambun (Dayak Ngaju) — belum ada data
  (9, null, null),
  -- Acil Imah (Banjar) — bibi
  (10,
   '"Nang" (dari "Nanang", panggilan untuk anak/pemuda laki-laki).',
   '"Luh" (dari "Galuh", panggilan untuk anak/gadis perempuan).')
) as v(id, address_male, address_female)
where p.id = v.id;

commit;
