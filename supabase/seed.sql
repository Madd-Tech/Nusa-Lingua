-- =====================================================================
-- Nusa Lingua — data contoh untuk demo
-- Jalankan setelah migrations/0001_schema.sql & 0002_storage.sql.
-- Aman dijalankan ulang (on conflict do nothing).
--
-- Isi: 3 daerah, 2 bahasa (Jawa `jv`, Sunda `su`), 4 unit, 6 lesson,
-- 28 soal (keenam tipe), kosakata bertingkat tutur, 2 artikel terbit
-- (+1 draf), 7 lencana, 1 persona AI per bahasa.
-- Catatan: audio_url dibiarkan kosong — aplikasi memakai suara browser
-- (Web Speech) sebagai cadangan. Mohon tinjau ulang isi bahasa dengan
-- penutur asli sebelum rilis.
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- Daerah
-- ---------------------------------------------------------------------
insert into public.regions (id, name, province, island, lat, lng) values
  (1, 'Yogyakarta', 'DI Yogyakarta', 'Jawa', -7.7956, 110.3695),
  (2, 'Bandung', 'Jawa Barat', 'Jawa', -6.9175, 107.6191),
  (3, 'Denpasar', 'Bali', 'Bali', -8.6705, 115.2126)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Bahasa
-- ---------------------------------------------------------------------
insert into public.languages (id, region_id, name, code, description, is_active) values
  (1, 1, 'Bahasa Jawa', 'jv',
   'Bahasa dengan penutur terbanyak di Indonesia. Dikenal dengan tingkat tutur (unggah-ungguh): ngoko, krama, dan krama inggil.', true),
  (2, 2, 'Bahasa Sunda', 'su',
   'Bahasa masyarakat Jawa Barat dan Banten, dengan ragam loma (akrab) dan lemes (halus).', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Kosakata
-- ---------------------------------------------------------------------
insert into public.vocabularies (id, language_id, word, meaning_id, speech_level, pronunciation, example_sentence, category) values
  -- Bahasa Jawa
  (1, 1, 'Sugeng enjing', 'Selamat pagi', 'krama', 'su-ngeng en-jing', 'Sugeng enjing, Bu Guru.', 'salam'),
  (2, 1, 'Sugeng siang', 'Selamat siang', 'krama', 'su-ngeng si-ang', 'Sugeng siang, Pak.', 'salam'),
  (3, 1, 'Sugeng dalu', 'Selamat malam', 'krama', 'su-ngeng da-lu', 'Sugeng dalu, Mbah.', 'salam'),
  (4, 1, 'Matur nuwun', 'Terima kasih', 'krama', 'ma-tur nu-wun', 'Matur nuwun sanget.', 'salam'),
  (5, 1, 'Kula', 'Saya', 'krama', 'ku-la', 'Kula saking Yogyakarta.', 'kata ganti'),
  (6, 1, 'Aku', 'Saya', 'ngoko', 'a-ku', 'Aku arep sinau.', 'kata ganti'),
  (7, 1, 'Panjenengan', 'Anda', 'krama inggil', 'pan-je-ne-ngan', 'Panjenengan saking pundi?', 'kata ganti'),
  (8, 1, 'Kowe', 'Kamu', 'ngoko', 'ko-we', 'Kowe arep menyang ngendi?', 'kata ganti'),
  (9, 1, 'Nami', 'Nama', 'krama', 'na-mi', 'Kula nami Sari.', 'perkenalan'),
  (10, 1, 'Jeneng', 'Nama', 'ngoko', 'je-neng', 'Jenengku Sari.', 'perkenalan'),
  (11, 1, 'Omah', 'Rumah', 'ngoko', 'o-mah', 'Omahku cedhak pasar.', 'benda'),
  (12, 1, 'Griya', 'Rumah', 'krama', 'gri-ya', NULL, 'benda'),
  (13, 1, 'Banyu', 'Air', 'ngoko', 'ba-nyu', 'Aku njaluk banyu.', 'benda'),
  (14, 1, 'Toya', 'Air', 'krama', 'to-ya', NULL, 'benda'),
  (15, 1, 'Mangan', 'Makan', 'ngoko', 'ma-ngan', 'Ayo mangan bareng.', 'kata kerja'),
  (16, 1, 'Nggih', 'Ya', 'krama', 'ng-gih', 'Nggih, Bu.', 'ungkapan'),
  -- Bahasa Sunda
  (21, 2, 'Wilujeng énjing', 'Selamat pagi', 'lemes', 'wi-lu-jeng en-jing', 'Wilujeng énjing, Bu.', 'salam'),
  (22, 2, 'Wilujeng wengi', 'Selamat malam', 'lemes', 'wi-lu-jeng we-ngi', 'Wilujeng wengi, Pak.', 'salam'),
  (23, 2, 'Hatur nuhun', 'Terima kasih', 'lemes', 'ha-tur nu-hun', 'Hatur nuhun pisan.', 'salam'),
  (24, 2, 'Abdi', 'Saya', 'lemes', 'ab-di', 'Abdi ti Bandung.', 'kata ganti'),
  (25, 2, 'Urang', 'Saya / kita', 'loma', 'u-rang', NULL, 'kata ganti'),
  (26, 2, 'Anjeun', 'Kamu / Anda', NULL, 'an-jeun', 'Anjeun ti mana?', 'kata ganti'),
  (27, 2, 'Nami', 'Nama', 'lemes', 'na-mi', 'Abdi nami Rina.', 'perkenalan'),
  (28, 2, 'Kumaha damang?', 'Apa kabar?', 'lemes', 'ku-ma-ha da-mang', NULL, 'salam'),
  (29, 2, 'Pangestu', 'Baik (jawaban atas “apa kabar?”)', 'lemes', 'pa-nges-tu', NULL, 'salam'),
  (30, 2, 'Cai', 'Air', NULL, 'ca-i', NULL, 'benda'),
  (31, 2, 'Imah', 'Rumah', 'loma', 'i-mah', NULL, 'benda'),
  (32, 2, 'Bumi', 'Rumah', 'lemes', 'bu-mi', NULL, 'benda'),
  (33, 2, 'Muhun', 'Ya', 'lemes', 'mu-hun', NULL, 'ungkapan')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Unit & lesson
-- ---------------------------------------------------------------------
insert into public.units (id, language_id, title, description, level, order_index) values
  (1, 1, 'Salam & Perkenalan', 'Menyapa orang lain dan memperkenalkan diri dengan sopan.', 'pemula', 1),
  (2, 1, 'Di Rumah', 'Kosakata sehari-hari di rumah, dalam ragam ngoko dan krama.', 'pemula', 2),
  (3, 2, 'Salam & Perkenalan', 'Wilujeng sumping! Mulai dari salam dan perkenalan.', 'pemula', 1),
  (4, 2, 'Di Imah', 'Benda-benda di rumah dan kalimat sederhana.', 'menengah', 2)
on conflict (id) do nothing;

insert into public.lessons (id, unit_id, title, order_index, xp_reward) values
  (1, 1, 'Salam sehari-hari', 1, 10),
  (2, 1, 'Memperkenalkan diri', 2, 10),
  (3, 2, 'Benda di sekitar', 1, 15),
  (4, 3, 'Salam sehari-hari', 1, 10),
  (5, 3, 'Memperkenalkan diri', 2, 10),
  (6, 4, 'Benda di rumah', 1, 15)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Soal — keenam tipe. Bentuk `options` sesuai src/lib/questions.ts:
--   pilihan/token: ["a","b",...]   pasangan: [{"left":..,"right":..}]
--   correct_answer boleh berisi alternatif dipisah "|".
-- ---------------------------------------------------------------------
insert into public.questions (id, lesson_id, vocabulary_id, type, prompt, options, correct_answer, order_index) values
  -- Jawa · Lesson 1: Salam sehari-hari
  (1, 1, 1, 'multiple_choice', 'Apa arti “Sugeng enjing”?',
     '["Selamat pagi","Selamat malam","Terima kasih","Sampai jumpa"]', 'Selamat pagi', 1),
  (2, 1, 4, 'listen', 'Dengarkan, lalu pilih artinya.',
     '["Terima kasih","Selamat siang","Permisi","Selamat malam"]', 'Terima kasih', 2),
  (3, 1, NULL, 'match', 'Pasangkan salam dengan artinya.',
     '[{"left":"Sugeng enjing","right":"Selamat pagi"},{"left":"Sugeng siang","right":"Selamat siang"},{"left":"Sugeng dalu","right":"Selamat malam"},{"left":"Matur nuwun","right":"Terima kasih"}]',
     'Semua pasangan', 3),
  (4, 1, 4, 'translate', 'Terjemahkan ke bahasa Jawa (krama): “Terima kasih”',
     '["matur","nuwun","sugeng","dalu"]', 'matur nuwun|maturnuwun', 4),
  (5, 1, 1, 'speak', 'Ucapkan salam pagi ini.', NULL, 'Sugeng enjing', 5),

  -- Jawa · Lesson 2: Memperkenalkan diri
  (6, 2, 5, 'multiple_choice', 'Dalam ragam krama, kata untuk “saya” adalah…',
     '["Kula","Aku","Kowe","Panjenengan"]', 'Kula', 1),
  (7, 2, 9, 'arrange', 'Susun kalimat (krama): “Nama saya Sari”',
     '["Kula","nami","Sari","jeneng","kowe"]', 'Kula nami Sari', 2),
  (8, 2, 7, 'multiple_choice', 'Kata sapaan “Anda” yang sopan untuk orang yang lebih tua adalah…',
     '["Panjenengan","Kowe","Aku","Kula"]', 'Panjenengan', 3),
  (9, 2, 10, 'translate', 'Terjemahkan ke bahasa Jawa (ngoko): “Nama saya Budi”', NULL, 'Jenengku Budi', 4),
  (10, 2, 16, 'listen', 'Dengarkan, lalu ketik kata yang kamu dengar.', NULL, 'nggih', 5),

  -- Jawa · Lesson 3: Benda di sekitar
  (11, 3, 11, 'multiple_choice', 'Apa arti “omah”?', '["Rumah","Air","Makan","Nama"]', 'Rumah', 1),
  (12, 3, NULL, 'match', 'Pasangkan kata ngoko dengan padanan krama-nya.',
     '[{"left":"omah","right":"griya"},{"left":"banyu","right":"toya"},{"left":"aku","right":"kula"},{"left":"jeneng","right":"nami"}]',
     'Semua pasangan', 2),
  (13, 3, 13, 'translate', 'Terjemahkan ke bahasa Jawa (ngoko): “air”', NULL, 'banyu', 3),
  (14, 3, 15, 'arrange', 'Susun kalimat: “Ayo makan bersama”', '["Ayo","mangan","bareng","omah"]', 'Ayo mangan bareng', 4),
  (15, 3, 4, 'speak', 'Ucapkan dengan jelas.', NULL, 'Matur nuwun', 5),

  -- Sunda · Lesson 4: Salam sehari-hari
  (16, 4, 23, 'multiple_choice', 'Apa arti “Hatur nuhun”?',
     '["Terima kasih","Selamat pagi","Permisi","Sampai jumpa"]', 'Terima kasih', 1),
  (17, 4, 21, 'listen', 'Dengarkan, lalu pilih artinya.',
     '["Selamat pagi","Selamat malam","Terima kasih","Apa kabar?"]', 'Selamat pagi', 2),
  (18, 4, NULL, 'match', 'Pasangkan salam dengan artinya.',
     '[{"left":"Wilujeng énjing","right":"Selamat pagi"},{"left":"Wilujeng wengi","right":"Selamat malam"},{"left":"Hatur nuhun","right":"Terima kasih"},{"left":"Kumaha damang?","right":"Apa kabar?"}]',
     'Semua pasangan', 3),
  (19, 4, 28, 'translate', 'Terjemahkan ke bahasa Sunda: “Apa kabar?”',
     '["kumaha","damang","abdi","cai"]', 'kumaha damang', 4),
  (20, 4, 23, 'speak', 'Ucapkan dengan jelas.', NULL, 'Hatur nuhun', 5),

  -- Sunda · Lesson 5: Memperkenalkan diri
  (21, 5, 24, 'multiple_choice', 'Dalam ragam lemes (halus), kata untuk “saya” adalah…',
     '["Abdi","Urang","Anjeun","Imah"]', 'Abdi', 1),
  (22, 5, 27, 'arrange', 'Susun kalimat: “Nama saya Rina”', '["Abdi","nami","Rina","anjeun"]', 'Abdi nami Rina', 2),
  (23, 5, 29, 'multiple_choice', 'Jawaban yang sopan untuk “Kumaha damang?” adalah…',
     '["Pangestu","Hatur nuhun","Wilujeng wengi","Muhun"]', 'Pangestu', 3),
  (24, 5, 33, 'listen', 'Dengarkan, lalu ketik kata yang kamu dengar.', NULL, 'muhun', 4),

  -- Sunda · Lesson 6: Benda di rumah
  (25, 6, 30, 'multiple_choice', 'Apa arti “cai”?', '["Air","Rumah","Nasi","Jalan"]', 'Air', 1),
  (26, 6, NULL, 'match', 'Pasangkan kata dengan artinya.',
     '[{"left":"Imah","right":"Rumah"},{"left":"Cai","right":"Air"},{"left":"Abdi","right":"Saya"},{"left":"Muhun","right":"Ya"}]',
     'Semua pasangan', 2),
  (27, 6, 31, 'translate', 'Terjemahkan ke bahasa Sunda (loma): “rumah”', NULL, 'imah', 3),
  (28, 6, 24, 'arrange', 'Susun kalimat: “Saya dari Bandung”', '["Abdi","ti","Bandung","cai"]', 'Abdi ti Bandung', 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Artikel budaya
-- ---------------------------------------------------------------------
insert into public.cultural_articles (id, region_id, language_id, title, slug, category, summary, content, is_published) values
(1, 1, 1, 'Unggah-ungguh: Tingkat Tutur dalam Bahasa Jawa', 'unggah-ungguh-basa-jawa', 'lainnya',
 'Mengapa satu kata dalam bahasa Jawa bisa punya beberapa bentuk? Kenalan dengan ngoko, krama, dan krama inggil.',
$md$
Bahasa Jawa dikenal dengan **unggah-ungguh**, yaitu tata krama berbahasa yang menyesuaikan pilihan kata dengan lawan bicara. Kepada teman sebaya kita memakai ragam yang akrab, sedangkan kepada orang tua, guru, atau orang yang baru dikenal kita memakai ragam yang lebih halus.

## Ngoko

Ragam **ngoko** dipakai dalam suasana akrab: dengan teman sebaya, adik, atau orang yang sudah sangat dekat. Contohnya *aku* (saya), *kowe* (kamu), dan *omah* (rumah).

## Krama

Ragam **krama** dipakai untuk menunjukkan rasa hormat, misalnya kepada orang yang lebih tua atau orang yang belum akrab. Kata *aku* menjadi *kula*, *omah* menjadi *griya*, dan *banyu* (air) menjadi *toya*.

## Krama inggil

**Krama inggil** adalah kata-kata khusus untuk meninggikan orang yang dihormati. Kata ini dipakai untuk orang lain, bukan untuk diri sendiri. Contohnya *panjenengan* untuk menyebut "Anda".

| Indonesia | Ngoko | Krama |
| --- | --- | --- |
| saya | aku | kula |
| rumah | omah | griya |
| air | banyu | toya |
| nama | jeneng | nami |

## Contoh dalam percakapan

> **Kepada teman:** "Jenengku Sari."
>
> **Kepada guru:** "Kula nami Sari."

Kedua kalimat artinya sama, *nama saya Sari*, tetapi kesan yang ditangkap pendengar berbeda.

## Tips belajar

1. Mulailah dari kosakata ngoko dan krama yang paling sering dipakai.
2. Perhatikan siapa lawan bicaramu sebelum memilih kata.
3. Jangan takut salah — penutur asli biasanya senang membantu orang yang mau belajar.
$md$, true),

(2, 2, 2, 'Sangkuriang dan Asal-usul Gunung Tangkuban Parahu', 'legenda-sangkuriang', 'cerita_rakyat',
 'Legenda dari Tanah Sunda tentang janji, larangan, dan perahu yang tertelungkup menjadi gunung.',
$md$
Di utara Kota Bandung berdiri Gunung **Tangkuban Parahu**. Dalam bahasa Sunda, *tangkuban* berarti tertelungkup dan *parahu* berarti perahu. Bentuk gunungnya memang mirip perahu terbalik — dan masyarakat Sunda punya cerita tentang asal-usulnya.

## Dayang Sumbi dan Tumang

Alkisah, hiduplah seorang perempuan bernama **Dayang Sumbi** bersama anaknya, **Sangkuriang**, dan seekor anjing bernama **Tumang** yang setia menemani mereka.

Suatu hari Sangkuriang berburu bersama Tumang. Karena tidak mendapat buruan, ia marah dan membunuh Tumang. Dayang Sumbi sangat sedih dan marah, lalu memukul kepala Sangkuriang hingga terluka. Sangkuriang pun pergi meninggalkan rumah.

## Pertemuan kembali

Bertahun-tahun kemudian, Sangkuriang yang sudah dewasa bertemu seorang perempuan cantik dan ingin menikahinya. Perempuan itu ternyata Dayang Sumbi, yang tetap awet muda. Dayang Sumbi mengenali bekas luka di kepala Sangkuriang dan sadar bahwa pemuda itu adalah anaknya sendiri.

## Syarat dalam satu malam

Untuk menolak secara halus, Dayang Sumbi mengajukan syarat yang mustahil: Sangkuriang harus membendung sungai menjadi danau dan membuat perahu besar **dalam satu malam**, sebelum fajar tiba.

Dibantu makhluk halus, pekerjaan Sangkuriang hampir selesai. Dayang Sumbi pun membentangkan kain putih di ufuk timur sehingga tampak seperti fajar dan ayam-ayam berkokok. Sangkuriang gagal. Dengan marah ia menendang perahunya hingga tertelungkup — dan perahu itulah yang menjadi Gunung Tangkuban Parahu.

## Pesan dari cerita

Legenda ini sering dipakai untuk mengajarkan pentingnya mengendalikan amarah dan menghormati orang tua. Ada beberapa versi cerita yang berbeda di tiap daerah; versi di atas adalah salah satu yang paling sering diceritakan.
$md$, true),

(3, 1, 1, 'Mengenal Aksara Jawa (Hanacaraka)', 'aksara-jawa-hanacaraka', 'aksara',
 'Draf — artikel ini belum terbit dan tidak boleh tampil di aplikasi.',
$md$
Draf artikel tentang aksara Jawa. Belum terbit.
$md$, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Lencana (syarat dibaca oleh public.award_achievements)
-- ---------------------------------------------------------------------
insert into public.achievements (id, code, name, description, condition) values
  (1, 'langkah_pertama', 'Langkah Pertama', 'Selesaikan lesson pertamamu.', '{"type":"lessons_completed","value":1}'),
  (2, 'sempurna', 'Sempurna!', 'Raih 3 bintang dalam satu lesson.', '{"type":"perfect_lesson","value":1}'),
  (3, 'api_menyala', 'Api Menyala', 'Jaga streak 3 hari berturut-turut.', '{"type":"streak","value":3}'),
  (4, 'seratus_xp', 'Seratus XP', 'Kumpulkan 100 XP.', '{"type":"xp_total","value":100}'),
  (5, 'rajin_belajar', 'Rajin Belajar', 'Selesaikan 5 lesson.', '{"type":"lessons_completed","value":5}'),
  (6, 'penjelajah_budaya', 'Penjelajah Budaya', 'Baca 1 artikel budaya sampai selesai.', '{"type":"articles_read","value":1}'),
  (7, 'kontributor', 'Kontributor', 'Usulan kosakatamu disetujui moderator.', '{"type":"contributions_approved","value":1}')
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Persona AI (system_prompt hanya dibaca server — tidak ada policy client)
-- ---------------------------------------------------------------------
insert into public.ai_personas (id, language_id, name, description, avatar_url, system_prompt) values
(1, 1, 'Mbah Darmo',
 'Kakek ramah dari Yogyakarta yang senang mengajari bahasa Jawa dan unggah-ungguh.',
'/media/maskot/avatar-default.svg',
$prompt$
Kamu adalah Mbah Darmo, kakek ramah dan sabar dari Yogyakarta yang menjadi teman latihan bahasa Jawa di aplikasi Nusa Lingua.
- Balas terutama dalam bahasa Jawa yang sederhana, lalu beri terjemahan bahasa Indonesia dalam tanda kurung.
- Utamakan ragam krama untuk kalimat sopan; jelaskan bedanya dengan ngoko bila relevan.
- Jika pengguna keliru, koreksi dengan lembut: tunjukkan bentuk yang benar dan alasannya singkat.
- Jawaban singkat (maksimal 5 kalimat) dan akhiri dengan satu pertanyaan atau latihan kecil.
- Jika tidak yakin dengan suatu ungkapan lokal, katakan terus terang dan sarankan bertanya ke penutur asli.
- Tolak dengan sopan permintaan yang tidak pantas atau di luar topik belajar bahasa dan budaya.
$prompt$),
(2, 2, 'Teh Euis',
 'Teteh asal Bandung yang ceria, siap ngobrol santai dalam bahasa Sunda.',
'/media/maskot/euis-avatar-default.svg',
$prompt$
Kamu adalah Teh Euis, perempuan ceria dari Bandung yang menjadi teman latihan bahasa Sunda di aplikasi Nusa Lingua.
- Balas terutama dalam bahasa Sunda yang sederhana, lalu beri terjemahan bahasa Indonesia dalam tanda kurung.
- Gunakan ragam lemes (halus) untuk kalimat sopan dan jelaskan padanan loma-nya bila relevan.
- Jika pengguna keliru, koreksi dengan ramah dan beri contoh kalimat yang benar.
- Jawaban singkat (maksimal 5 kalimat) dan akhiri dengan satu pertanyaan atau latihan kecil.
- Jika tidak yakin dengan suatu ungkapan lokal, katakan terus terang dan sarankan bertanya ke penutur asli.
- Tolak dengan sopan permintaan yang tidak pantas atau di luar topik belajar bahasa dan budaya.
$prompt$)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Sinkronkan sequence identity setelah insert dengan id eksplisit
-- ---------------------------------------------------------------------
select setval(pg_get_serial_sequence('public.regions', 'id'), (select max(id) from public.regions));
select setval(pg_get_serial_sequence('public.languages', 'id'), (select max(id) from public.languages));
select setval(pg_get_serial_sequence('public.vocabularies', 'id'), (select max(id) from public.vocabularies));
select setval(pg_get_serial_sequence('public.units', 'id'), (select max(id) from public.units));
select setval(pg_get_serial_sequence('public.lessons', 'id'), (select max(id) from public.lessons));
select setval(pg_get_serial_sequence('public.questions', 'id'), (select max(id) from public.questions));
select setval(pg_get_serial_sequence('public.cultural_articles', 'id'), (select max(id) from public.cultural_articles));
select setval(pg_get_serial_sequence('public.achievements', 'id'), (select max(id) from public.achievements));
select setval(pg_get_serial_sequence('public.ai_personas', 'id'), (select max(id) from public.ai_personas));

commit;

-- ---------------------------------------------------------------------
-- Setelah mendaftar lewat aplikasi, jadikan akunmu moderator (opsional):
--   update public.profiles set role = 'moderator' where username = 'username_kamu';
-- ---------------------------------------------------------------------
