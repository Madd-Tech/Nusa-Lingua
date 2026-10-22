-- =====================================================================
-- Nusa Lingua — artikel budaya untuk 8 bahasa dari Basanusa Dataset v1.0
-- Jalankan SETELAH seed_basanusa.sql (butuh bahasa ace, bbc, min, mad, ban,
-- bug, nij, bjn beserta daerahnya). Aman dijalankan ulang (on conflict do nothing).
--
-- Satu artikel terbit per bahasa, ditautkan ke bahasa & daerahnya lewat kode
-- bahasa (bukan id) supaya tidak bergantung pada urutan insert. Isinya sengaja
-- memakai fakta budaya yang umum dikenal; mohon tetap ditinjau budayawan atau
-- penutur asli sebelum rilis.
-- =====================================================================

begin;

do $$
begin
  if (select count(*) from public.languages
      where code in ('ace', 'bbc', 'min', 'mad', 'ban', 'bug', 'nij', 'bjn')) < 8 then
    raise exception 'Jalankan supabase/seed_basanusa.sql lebih dulu (bahasa baru belum lengkap).';
  end if;
end $$;

insert into public.cultural_articles (id, region_id, language_id, title, slug, category, summary, content, status)
select v.id, l.region_id, l.id, v.title, v.slug, v.category::public.article_category, v.summary, v.content, 'published'::public.article_status
from (values
(4, 'ban', 'Nyepi: Sehari Sunyi di Pulau Dewata', 'nyepi-hari-sunyi-bali', 'upacara',
 'Satu hari dalam setahun, Bali berhenti total: tanpa lampu, tanpa kendaraan, tanpa keramaian. Kenalan dengan rangkaian Hari Raya Nyepi.',
$md$
**Nyepi** adalah perayaan Tahun Baru Saka bagi umat Hindu di Bali. Berbeda dengan tahun baru pada umumnya yang dirayakan dengan pesta, Nyepi justru disambut dengan **keheningan**: seluruh pulau berhenti beraktivitas selama 24 jam untuk merenung dan menyucikan diri.

Nyepi jatuh sehari setelah *tilem kesanga* (bulan mati pada bulan kesembilan dalam kalender Bali), biasanya sekitar bulan Maret.

## Sebelum Nyepi: Melasti dan ogoh-ogoh

Beberapa hari sebelumnya, umat melakukan **Melasti**: mengarak sarana upacara dari pura menuju laut atau sumber air untuk disucikan.

Sehari sebelum Nyepi digelar **Tawur Kesanga**, upacara untuk menyeimbangkan alam. Malamnya, desa-desa mengarak **ogoh-ogoh** — patung raksasa berwajah seram yang melambangkan sifat-sifat buruk (*bhuta kala*). Setelah diarak keliling desa, ogoh-ogoh biasanya dibakar sebagai simbol membersihkan diri dari hal buruk sebelum memasuki tahun baru.

## Catur Brata Penyepian

Pada hari Nyepi, umat Hindu menjalankan empat pantangan yang disebut **Catur Brata Penyepian**:

| Pantangan | Artinya |
| --- | --- |
| Amati geni | Tidak menyalakan api atau lampu |
| Amati karya | Tidak bekerja |
| Amati lelungan | Tidak bepergian |
| Amati lelanguan | Tidak bersenang-senang atau menikmati hiburan |

Jalanan kosong, toko tutup, dan bandara di Bali pun berhenti beroperasi. Petugas keamanan adat, **pecalang**, berkeliling memastikan suasana tetap sunyi. Wisatawan tetap boleh berada di Bali, tetapi diminta tinggal di penginapan.

## Setelah Nyepi: Ngembak Geni

Keesokan harinya disebut **Ngembak Geni**. Orang-orang kembali beraktivitas, saling berkunjung, dan saling memaafkan untuk memulai tahun yang baru dengan hati bersih.

## Mengapa menarik untuk dipelajari?

Nyepi menunjukkan bahwa perayaan tidak selalu berarti keramaian. Bagi banyak orang Bali, sehari tanpa cahaya dan suara adalah kesempatan langka untuk benar-benar beristirahat — dan langit malam Bali saat Nyepi terkenal penuh bintang karena tidak ada lampu yang menyala.
$md$),

(5, 'ace', 'Rumoh Aceh: Rumah Panggung dari Serambi Mekkah', 'rumoh-aceh', 'lainnya',
 'Rumah adat Aceh berdiri tinggi di atas tiang kayu, memanjang dari timur ke barat, dan dibangun nyaris tanpa paku.',
$md$
Aceh dijuluki **Serambi Mekkah**, dan rumah adatnya mencerminkan perpaduan adat dan nilai agama yang kuat. Rumah tradisional ini disebut **Rumoh Aceh**.

## Rumah di atas tiang

Rumoh Aceh adalah **rumah panggung** dari kayu yang berdiri di atas deretan tiang bulat yang tinggi. Lantainya berada jauh di atas tanah sehingga penghuninya terlindung dari banjir dan binatang liar. Kolong rumah dimanfaatkan untuk menyimpan barang, menenun, atau beristirahat di siang hari.

Untuk naik ke rumah, orang memakai tangga di bagian depan yang dalam bahasa Aceh disebut *reunyeun*.

## Menghadap kiblat

Bangunan Rumoh Aceh umumnya **memanjang dari timur ke barat**. Arah ini sering dikaitkan dengan arah kiblat, sehingga penghuni mudah menentukan arah salat.

## Tiga bagian rumah

| Bagian | Fungsi |
| --- | --- |
| Seuramoe keue (serambi depan) | Menerima tamu, tempat laki-laki berkumpul dan mengaji |
| Rumoh inong (ruang tengah) | Bagian inti untuk kamar tidur keluarga, lantainya lebih tinggi |
| Seuramoe likot (serambi belakang) | Dapur dan ruang keluarga, terutama untuk perempuan |

Pembagian ini memperlihatkan bagaimana adat Aceh mengatur ruang bagi tamu, keluarga, dan perempuan.

## Dibangun tanpa paku

Rangka Rumoh Aceh disambung dengan **pasak** kayu dan diikat dengan tali, nyaris tanpa paku. Karena itu rumah bisa dibongkar dan dipindahkan. Atapnya secara tradisional dibuat dari **daun rumbia**, yang membuat bagian dalam rumah tetap sejuk.

## Melihatnya langsung

Saat ini Rumoh Aceh asli makin jarang ditemui karena banyak rumah dibangun dengan bahan modern. Salah satu contohnya bisa dilihat di kompleks **Museum Aceh** di Banda Aceh.
$md$),

(6, 'bbc', 'Ulos dan Dalihan Na Tolu', 'ulos-dalihan-na-tolu', 'pakaian_adat',
 'Kain tenun Batak Toba bukan sekadar pakaian: ulos adalah tanda kasih dan berkat yang diberikan dalam setiap peristiwa penting.',
$md$
**Horas!** Sapaan khas Batak ini terdengar di setiap pesta adat di sekitar Danau Toba. Dan di hampir setiap pesta itu, ada satu benda yang selalu hadir: **ulos**.

## Kain penghangat

Ulos adalah kain tenun khas Batak yang ditenun dengan tangan. Dulu, ulos dipakai untuk menghangatkan tubuh di dataran tinggi sekitar Danau Toba yang berhawa sejuk. Ada ungkapan bahwa sumber kehangatan bagi orang Batak ada tiga: **matahari, api, dan ulos**.

Seiring waktu, "kehangatan" ulos dimaknai lebih dalam: kehangatan kasih sayang dan berkat.

## Mangulosi: memberi ulos

Memberikan ulos disebut **mangulosi**. Ulos dikalungkan di bahu penerimanya sambil diucapkan doa dan harapan baik. Dalam adat, ulos umumnya diberikan oleh pihak yang kedudukan adatnya lebih dihormati, misalnya orang tua kepada anaknya, atau pihak keluarga pemberi istri kepada pihak penerima istri.

Beberapa jenis ulos dan pemakaian yang umum dikenal:

| Ulos | Contoh pemakaian |
| --- | --- |
| Ragi Hotang | Diberikan kepada pengantin dalam pesta pernikahan |
| Mangiring | Diberikan untuk anak yang baru lahir, dengan harapan akan disusul adik-adik |
| Ragidup | Ulos yang sangat dihormati, melambangkan kehidupan |
| Sibolang | Sering dipakai dalam suasana duka |

Pemakaian ini bisa sedikit berbeda antarwilayah dan antarkeluarga.

## Dalihan Na Tolu

Siapa memberi ulos kepada siapa diatur oleh **Dalihan Na Tolu**, "tungku berkaki tiga" — sistem kekerabatan Batak Toba yang terdiri atas tiga unsur:

1. **Hula-hula** — keluarga pihak pemberi istri, yang harus dihormati.
2. **Dongan tubu** — saudara semarga, yang harus dijaga perasaannya.
3. **Boru** — keluarga pihak penerima istri, yang harus diayomi.

Prinsip ini dirangkum dalam ungkapan *somba marhula-hula, manat mardongan tubu, elek marboru*. Seperti tungku yang butuh tiga kaki agar periuk tidak terguling, masyarakat Batak menjaga keseimbangan ketiga hubungan ini.

## Gorga di Rumah Bolon

Selain ulos, kekhasan Batak Toba terlihat pada **Rumah Bolon**, rumah adat beratap melengkung tinggi yang dihiasi **gorga** — ukiran berwarna merah, putih, dan hitam.
$md$),

(7, 'min', 'Kerbau yang Menang: Asal-usul Nama Minangkabau', 'asal-usul-nama-minangkabau', 'cerita_rakyat',
 'Kisah adu kerbau yang melahirkan nama Minangkabau, atap gonjong Rumah Gadang, dan adat yang mengikuti garis ibu.',
$md$
Konon, nama **Minangkabau** berasal dari dua kata: *manang* (menang) dan *kabau* (kerbau). Kisahnya diceritakan turun-temurun dalam *tambo*, tradisi sejarah lisan orang Minang.

## Adu kerbau

Alkisah, sebuah pasukan besar dari seberang lautan datang ke ranah Minang. Para pemuka adat tidak ingin rakyatnya menderita karena perang, lalu mengusulkan cara lain: **mengadu kerbau**. Pihak yang kerbaunya menang dianggap menang.

Pendatang membawa kerbau jantan yang besar dan kuat. Orang Minang justru memilih **anak kerbau** yang masih menyusu. Selama beberapa hari anak kerbau itu dipisahkan dari induknya hingga kelaparan, lalu di kepalanya dipasangi tanduk besi yang runcing.

Saat adu dimulai, anak kerbau yang lapar mengira kerbau besar itu induknya. Ia berlari menyeruduk perut kerbau lawan untuk menyusu — dan tanduk besinya membuat kerbau besar itu kalah. Orang-orang pun bersorak, *"Manang kabau! Manang kabau!"*

## Tanduk di atas rumah

Kerbau menjadi lambang penting bagi orang Minang. Atap **Rumah Gadang**, rumah adat Minangkabau, berbentuk runcing melengkung ke atas seperti tanduk kerbau. Ujung-ujung atap itu disebut **gonjong**.

Di halaman Rumah Gadang biasanya berdiri **rangkiang**, lumbung padi beratap gonjong kecil.

## Adat garis ibu

Minangkabau dikenal sebagai salah satu masyarakat **matrilineal** terbesar di dunia: suku (marga) seseorang mengikuti suku ibunya. Rumah Gadang dan harta pusaka seperti sawah diwariskan melalui garis perempuan.

Bukan berarti laki-laki tidak berperan. **Mamak** — saudara laki-laki ibu — bertanggung jawab membimbing para kemenakannya. Banyak pemuda Minang juga menjalani tradisi **merantau** untuk mencari ilmu dan pengalaman sebelum kembali membangun kampung.

## Pesan dari cerita

Kisah adu kerbau sering dipakai untuk mengajarkan bahwa kecerdikan bisa mengalahkan kekuatan. Orang Minang punya pepatah *alam takambang jadi guru* — alam yang terbentang menjadi guru.

Seperti cerita rakyat lainnya, legenda ini punya beberapa versi, dan para ahli juga mengajukan penjelasan lain tentang asal kata Minangkabau.
$md$),

(8, 'mad', 'Karapan Sapi: Pacuan Kebanggaan Madura', 'karapan-sapi-madura', 'lainnya',
 'Sepasang sapi, seorang joki, dan lintasan lurus yang ditempuh dalam hitungan detik. Inilah pesta rakyat paling terkenal di Pulau Madura.',
$md$
Jika ada satu hal yang langsung terbayang saat mendengar kata Madura, itu adalah **karapan sapi** — lomba pacu sapi yang menjadi kebanggaan masyarakat pulau garam ini.

## Cara berlomba

Dalam karapan sapi, **sepasang sapi jantan** dipasangi kayu pengikat di lehernya dan menarik sebuah kereta kayu sederhana bernama **kaleles**. Seorang joki berdiri di atas kaleles dan memacu sapinya di lintasan lurus sepanjang sekitar seratus meter. Lintasan itu ditempuh dalam **hitungan detik**.

Lomba diadakan berjenjang, dari tingkat desa dan kabupaten hingga final yang mempertemukan sapi-sapi terbaik dari seluruh Madura. Musimnya biasanya setelah panen, sekitar pertengahan hingga akhir tahun.

## Sapi yang dimanjakan

Sapi karapan bukan sapi biasa. Pemiliknya merawatnya dengan istimewa: diberi pakan pilihan, jamu, dipijat, dan dilatih secara rutin. Menjelang lomba, sapi dihias dengan pakaian dan aksesori berwarna cerah. Memiliki sapi juara adalah kebanggaan dan menaikkan martabat pemiliknya.

## Diiringi saronen

Arak-arakan sapi ke arena diiringi **saronen**, musik khas Madura yang dipimpin alat tiup bersuara nyaring. Iramanya yang riang membuat suasana karapan sapi terasa seperti pesta rakyat.

## Karapan sapi tanpa kekerasan

Dulu, sebagian joki melukai sapi agar berlari lebih kencang. Belakangan, tokoh masyarakat dan penyelenggara mendorong **karapan sapi tanpa kekerasan** supaya tradisi ini tetap lestari dengan cara yang lebih menghargai hewan.

## Saudaranya: sapi sono'

Madura juga punya tradisi **sapi sono'**, yaitu kontes keindahan sepasang sapi betina. Bukan kecepatan yang dinilai, melainkan keserasian langkah dan keanggunan sapi saat berjalan menuju garis akhir.

## Catatan bahasa

Seperti bahasa Jawa, bahasa Madura mengenal **tingkat tutur**. Ragam yang umum dibedakan adalah *enjâ'-iyâ* (akrab), *èngghi-enten* (menengah), dan *èngghi-bhunten* (halus). Memilih ragam yang tepat adalah bagian penting dari sopan santun orang Madura.
$md$),

(9, 'bug', 'Mengenal Aksara Lontara', 'aksara-lontara', 'aksara',
 'Aksara Bugis-Makassar yang bentuknya bersudut, ditulis di daun lontar, dan menyimpan salah satu karya sastra terpanjang di dunia.',
$md$
Jauh sebelum huruf Latin dipakai luas, orang Bugis sudah menulis dengan aksaranya sendiri: **aksara Lontara**. Namanya berasal dari **daun lontar**, tempat aksara ini dahulu ditorehkan.

## Siapa yang memakainya?

Lontara dipakai untuk menulis beberapa bahasa di Sulawesi Selatan dan sekitarnya, terutama **bahasa Bugis**, **Makassar**, dan **Mandar**. Aksara ini masih diajarkan di sekolah-sekolah di Sulawesi Selatan dan bisa ditemukan pada papan nama jalan serta gedung pemerintahan.

## Bentuk yang bersudut

Huruf-huruf Lontara tampak bersudut dan ramping, seolah tersusun dari garis-garis belah ketupat. Konon bentuk ini terinspirasi dari falsafah **sulapa eppa** (segi empat), yang melambangkan empat unsur pembentuk alam dan manusia.

## Cara kerjanya

Lontara adalah aksara **abugida**: setiap huruf dasar mewakili satu suku kata yang berakhiran bunyi *a*. Untuk mengubah vokalnya menjadi *i*, *u*, *é*, *o*, atau *e* (pepet), ditambahkan tanda kecil di atas, di bawah, atau di samping huruf.

Untuk bahasa Bugis terdapat **23 huruf dasar**. Uniknya, Lontara tradisional **tidak punya tanda untuk mematikan konsonan** di akhir suku kata. Pembaca harus menebak bunyi yang tepat dari konteks — sehingga satu tulisan kadang bisa dibaca dengan beberapa cara. Karena itu, membaca naskah Lontara dengan lancar membutuhkan pengetahuan bahasa yang baik.

## Naskah I La Galigo

Salah satu naskah Lontara yang paling terkenal adalah **I La Galigo** (*Sureq Galigo*), epos mitologi Bugis tentang asal-usul manusia dan kisah Sawerigading. Karya ini termasuk karya sastra **terpanjang di dunia**, dan naskahnya diakui UNESCO sebagai *Memory of the World* pada tahun 2011.

## Budaya bahari Bugis

Selain aksara, orang Bugis juga dikenal sebagai pelaut ulung. Seni pembuatan perahu **pinisi** dari Sulawesi Selatan diakui UNESCO sebagai Warisan Budaya Takbenda pada tahun 2017.

## Lontara di layar

Aksara Lontara sudah tercantum dalam standar **Unicode** dengan nama blok *Buginese*, sehingga bisa diketik dan ditampilkan di ponsel maupun komputer. Ikon bahasa Bugis di aplikasi ini memakai salah satu huruf Lontara, yaitu *ba*.
$md$),

(10, 'nij', 'Huma Betang: Rumah Panjang, Hidup Bersama', 'huma-betang-dayak-ngaju', 'lainnya',
 'Rumah panjang Dayak di Kalimantan Tengah dihuni banyak keluarga sekaligus — dan nilai kebersamaannya menjadi falsafah hidup.',
$md$
Di sepanjang sungai-sungai besar Kalimantan Tengah — seperti Kahayan, Kapuas, dan Katingan — masyarakat Dayak Ngaju dahulu tinggal bersama dalam satu bangunan besar yang disebut **huma betang**, atau rumah panjang.

## Satu rumah, banyak keluarga

Huma betang adalah **rumah panggung** yang sangat panjang. Di dalamnya terdapat deretan bilik untuk tiap keluarga, sementara sebagian ruangan lain dipakai bersama untuk bermusyawarah, menggelar upacara, dan bekerja. Satu betang bisa dihuni beberapa generasi sekaligus.

Tiangnya yang tinggi melindungi penghuni dari banjir saat sungai meluap dan dari binatang buas. Untuk naik ke rumah, penghuni memakai tangga kayu yang bisa ditarik ke atas pada malam hari.

## Sungai sebagai jalan raya

Betang biasanya dibangun menghadap sungai. Sebelum ada jalan darat, sungai adalah jalur utama untuk bepergian, berdagang, dan mengunjungi kampung lain dengan perahu.

## Falsafah huma betang

Hidup berdampingan di bawah satu atap menuntut sikap saling menghormati. Dari sinilah lahir **falsafah huma betang**: hidup rukun dalam keberagaman, bergotong royong, dan menyelesaikan masalah dengan musyawarah. Hingga kini falsafah ini sering disebut sebagai jati diri masyarakat Kalimantan Tengah, termasuk dalam kehidupan antaragama dan antarsuku.

Semboyan Provinsi Kalimantan Tengah, *Isen Mulang*, berarti "pantang mundur".

## Kepercayaan leluhur

Sebagian masyarakat Dayak Ngaju memeluk **Kaharingan**, kepercayaan leluhur yang menghormati alam dan roh nenek moyang. Salah satu upacaranya yang terkenal adalah **Tiwah**, upacara kematian tahap akhir untuk mengantar arwah menuju alam baka.

## Betang hari ini

Saat ini sebagian besar keluarga Dayak tinggal di rumah masing-masing, tetapi beberapa betang tua masih dirawat sebagai cagar budaya dan tempat upacara adat. Nilai kebersamaannya tetap hidup dalam semangat gotong royong.
$md$),

(11, 'bjn', 'Pasar Terapung: Jual Beli di Atas Sungai Banjar', 'pasar-terapung-banjar', 'lainnya',
 'Selepas subuh, sungai-sungai di Kalimantan Selatan berubah menjadi pasar: jukung penuh sayur, buah, dan wadai saling merapat.',
$md$
Banjarmasin dijuluki **Kota Seribu Sungai**. Di kota ini dan sekitarnya, sungai bukan hanya jalur perahu, melainkan juga tempat orang berbelanja. Inilah **pasar terapung**, salah satu tradisi paling khas urang Banjar.

## Pasar di atas perahu

Di pasar terapung, pedagang dan pembeli sama-sama berada di atas **jukung** — perahu kayu kecil khas Banjar. Perahu-perahu saling merapat, lalu tawar-menawar berlangsung di atas air yang bergoyang.

Pasar terapung dimulai **selepas subuh** dan biasanya sudah sepi menjelang siang. Siapa yang ingin melihatnya harus bangun pagi-pagi sekali.

## Para acil

Kebanyakan pedagang pasar terapung adalah perempuan. Mereka memakai **tanggui**, topi lebar dari daun nipah yang melindungi dari matahari dan hujan. Dalam bahasa Banjar, perempuan yang lebih tua biasa dipanggil **acil**, yang berarti bibi.

Barang yang dijual beragam: sayur-mayur, buah hasil kebun, ikan, hingga **wadai** — sebutan untuk kue dalam bahasa Banjar. Ada pula pedagang yang menjual makanan dan minuman hangat untuk sarapan langsung dari perahunya.

## Lok Baintan dan Muara Kuin

Dua pasar terapung yang paling terkenal adalah **Lok Baintan** di Sungai Martapura dan **Muara Kuin** di muara Sungai Barito, Banjarmasin. Seiring berkembangnya jalan darat dan pasar modern, jumlah pedagang di pasar terapung makin berkurang, sehingga berbagai pihak berupaya melestarikannya.

## Kekhasan Banjar lainnya

- **Rumah Bubungan Tinggi** — rumah adat Banjar dengan atap tengah yang sangat curam.
- **Sasirangan** — kain khas Banjar yang dibuat dengan teknik jelujur dan ikat celup.

## Mengapa penting?

Pasar terapung memperlihatkan bagaimana masyarakat Banjar menyesuaikan hidupnya dengan alam sungai. Bahasanya pun ikut hidup di sana: tawar-menawar di pasar terapung adalah salah satu tempat terbaik untuk mendengar bahasa Banjar sehari-hari.
$md$)
) as v(id, code, title, slug, category, summary, content)
join public.languages l on l.code = v.code
on conflict (id) do nothing;

-- Sinkronkan sequence identity setelah insert dengan id eksplisit
select setval(pg_get_serial_sequence('public.cultural_articles', 'id'), (select max(id) from public.cultural_articles));

commit;
