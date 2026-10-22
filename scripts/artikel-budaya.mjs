/**
 * Data artikel budaya baru untuk kategori yang belum terisi:
 * tarian, kuliner, dan sejarah.
 *
 * Dipakai oleh scripts/seed-artikel.mjs (upsert ke Supabase) dan menjadi
 * rujukan saat menyinkronkan supabase/seed.sql.
 */
export const ARTIKEL_BARU = [
  {
    slug: "tari-saman-gayo",
    title: "Tari Saman: Seribu Tangan dari Tanah Gayo",
    category: "tarian",
    region_id: 4,
    language_id: 3,
    status: "published",
    summary:
      "Tepuk tangan, dada, dan lantunan syair yang makin cepat — tari dari dataran tinggi Gayo yang mendunia.",
    content: `Tari Saman lahir di dataran tinggi Gayo, Aceh Tengah. Nama tarian ini dipercaya berasal dari Syekh Saman, seorang ulama yang memakai gerak tubuh dan syair sebagai media dakwah pada abad ke-14. Kini Saman dikenal sebagai salah satu tari paling ikonik dari Aceh, bahkan dunia.

## Formasi dan gerak

Penari Saman adalah laki-laki, biasanya berjumlah ganjil antara sembilan sampai lima belas orang. Mereka duduk berjajar rapat, lalu bergerak serempak: tepuk tangan, tepuk dada, tepuk paha, dan gerakan kepala. Semakin lama tempo semakin cepat, membuat barisan penari tampak seperti satu tubuh.

Tidak ada alat musik yang mengiringi. Irama lahir dari tubuh penari dan lantunan syair yang disebut ratoh. Syairnya berisi pesan agama, nasihat, dan cerita kehidupan.

## Makna kebersamaan

Saman bukan sekadar pertunjukan. Gerakan yang harus serempak mengajarkan bahwa kekompakan lahir dari kesepakatan, bukan dari satu orang yang menonjol. Karena itu Saman sering dipakai untuk menyambut tamu penting dan merayakan peristiwa besar.

## Diakui dunia

Pada 2011, UNESCO menetapkan Saman sebagai Warisan Budaya Takbenda yang Memerlukan Perlindungan Mendesak. Pengakuan ini mendorong pelestarian Saman di sekolah dan sanggar, sekaligus mengingatkan bahwa tari tradisional tetap hidup selama ada generasi yang mempelajarinya.

## Istilah

| Istilah | Arti |
| --- | --- |
| saman | nama tarian, dipercaya dari nama Syekh Saman |
| ratoh | syair yang dilantunkan para penari |
| gayo | suku dan bahasa asal tari ini |

> Saman mengajarkan satu hal sederhana: gerak yang paling indah adalah gerak yang dilakukan bersama.`,
  },
  {
    slug: "tari-kecak-bali",
    title: "Tari Kecak: Nyanyian Seratus Lelaki di Tepi Pura",
    category: "tarian",
    region_id: 3,
    language_id: 7,
    status: "published",
    summary:
      "Tanpa gamelan, puluhan lelaki membangun irama dengan suara dan gerak. Kecak mengubah ritual menjadi pertunjukan yang menghipnotis.",
    content: `Di Bali, ada pertunjukan yang tidak memakai gamelan sama sekali. Puluhan lelaki duduk melingkar, lalu melantunkan "cak, cak, cak" secara bergantian. Itulah Tari Kecak, salah satu pertunjukan paling dikenal dari Pulau Dewata.

## Dari ritual ke panggung

Kecak berakar pada Sanghyang, ritual trance untuk mengusir wabah dan memulihkan keseimbangan desa. Pada 1930-an, seniman Bali I Wayan Limbak bersama pelukis Jerman Walter Spies mengembangkan ritual itu menjadi pertunjukan yang bisa dinikmati wisatawan, tanpa menghilangkan inti ritualnya.

## Cerita Ramayana

Pertunjukan Kecak biasanya mengangkat epik Ramayana. Penonton mengikuti perjalanan Rama dan Sita, penculikan Sita oleh Rahwana, hingga bantuan Hanuman dan pasukan kera. Para penari kecak berperan sebagai pasukan, angin, api, dan suara alam yang membangun suasana.

## Suara sebagai musik

Tidak ada alat musik. Puluhan penari membentuk lingkaran dan menghasilkan irama dengan mulut. Di tengah lingkaran, api menyala dan penari utama memerankan tokoh-tokoh cerita. Kombinasi suara, gerak, dan cahaya api membuat Kecak terasa seperti ritual yang hidup.

## Istilah

| Istilah | Arti |
| --- | --- |
| kecak | nama pertunjukan, dari bunyi "cak" |
| sanghyang | ritual trance Bali |
| pura | tempat ibadah umat Hindu Bali |
| ramayana | epik India yang menjadi lakon |

> Kecak menunjukkan bahwa musik tidak selalu datang dari alat musik; tubuh dan suara bisa menjadi orkestra.`,
  },
  {
    slug: "tari-piring-minang",
    title: "Tari Piring: Menari Rama dengan Piring di Telapak",
    category: "tarian",
    region_id: 6,
    language_id: 5,
    status: "published",
    summary:
      "Piring di telapak tangan, gerak silat yang cepat, dan rasa syukur atas panen — beginilah tari dari Solok, Sumatera Barat.",
    content: `Tari Piring berasal dari Solok, Sumatera Barat. Sesuai namanya, penari membawa piring di telapak tangan sambil bergerak lincah. Tarian ini dulunya dipentaskan sebagai syukur atas panen, lalu berkembang menjadi pertunjukan seni yang memukau.

## Gerak yang lahir dari silat

Gerakan Tari Piring banyak mengambil dasar dari silek, seni bela diri Minangkabau. Penari bergerak cepat, berputar, dan menghentakkan kaki, tetapi piring di tangannya tetap seimbang. Pada beberapa versi pertunjukan, penari bahkan menari di atas pecahan piring, yang menuntut konsentrasi dan keberanian.

## Piring sebagai simbol

Piring bukan sekadar properti. Dalam masyarakat agraris, piring mewakili hasil bumi dan rasa syukur. Membawa piring tanpa menjatuhkannya menggambarkan keseimbangan antara semangat dan pengendalian diri.

## Musik dan tempo

Tari Piring diiringi talempong dan gendang. Tempo awalnya tenang, lalu semakin cepat. Penari harus mengikuti irama tanpa kehilangan keseimbangan. Di akhir pertunjukan, piring biasanya diletakkan sebagai tanda syukur.

## Istilah

| Istilah | Arti |
| --- | --- |
| piriang | piring (bahasa Minangkabau) |
| silek | seni bela diri Minangkabau |
| talempong | alat musik pukul tradisional Minang |
| rantak | gerakan hentakan kaki |

> Tari Piring adalah pelajaran tentang keseimbangan: bergerak cepat, tetapi tetap menjaga apa yang ada di tangan.`,
  },
  {
    slug: "gudeg-yogyakarta",
    title: "Gudeg: Manis Hangat dari Kayu Nangka Yogyakarta",
    category: "kuliner",
    region_id: 1,
    language_id: 1,
    status: "published",
    summary:
      "Nangka muda, santan, gula jawa, dan waktu berjam-jam. Di balik sepiring gudeg ada kesabaran khas Yogyakarta.",
    content: `Gudeg adalah makanan khas Yogyakarta yang terbuat dari nangka muda. Nangka dimasak bersama santan, gula jawa, dan rempah selama berjam-jam hingga warnanya cokelat tua dan rasanya manis gurih. Proses panjang inilah yang membuat gudeg tidak bisa dibuat terburu-buru.

## Dari hangudek

Nama gudeg dipercaya berasal dari kata Jawa hangudek yang berarti mengaduk. Dulu gudeg dimasak dalam jumlah besar dan harus terus diaduk agar santan tidak pecah. Aroma kayu bakar dan daun jati menambah lapisan rasa yang khas.

## Satu hidangan, banyak pelengkap

Gudeg biasanya disajikan dengan nasi, opor ayam, telur rebus, krecek, dan sambal. Ada dua jenis gudeg: basah dengan kuah santan yang lebih banyak, dan kering yang dimasak lebih lama sehingga tahan beberapa hari.

## Gudeg dalam keseharian

Di Yogyakarta, gudeg dijual pagi hari dan sering menjadi sarapan. Gudeg juga hadir saat acara keluarga, selamatan, dan pertemuan warga. Bagi banyak orang, gudeg bukan hanya makanan, tetapi pengingat akan rumah.

## Istilah

| Istilah | Arti |
| --- | --- |
| hangudek | mengaduk (bahasa Jawa) |
| areh | kuah santan kental |
| krecek | olahan kulit sapi |
| nangka | buah yang menjadi bahan utama |

> Gudeg mengajarkan bahwa rasa yang dalam lahir dari waktu, bukan dari tergesa-gesa.`,
  },
  {
    slug: "rendang-minang",
    title: "Rendang: Sabar yang Berbuah Rasa",
    category: "kuliner",
    region_id: 6,
    language_id: 5,
    status: "published",
    summary:
      "Daging, santan, dan bumbu yang dimasak berjam-jam sampai kuahnya mengering. Rendang adalah pelajaran kesabaran dari Minangkabau.",
    content: `Rendang adalah masakan Minangkabau yang paling dikenal di dunia. Potongan daging dimasak dengan santan dan bumbu rempah dalam waktu lama sampai kuahnya mengering. Hasilnya adalah daging berwarna gelap dengan rasa pedas, gurih, dan sedikit manis.

## Memasak dengan sabar

Proses memasak rendang disebut marandang. Santan harus terus diaduk agar tidak pecah, sementara api dijaga stabil. Dibutuhkan beberapa jam sampai santan meresap dan berubah menjadi lapisan bumbu yang pekat. Karena itu rendang sering disebut sebagai masakan yang menguji kesabaran.

## Bekal merantau

Orang Minangkabau dikenal gemar merantau. Rendang yang dimasak kering tahan lebih lama, sehingga cocok dibawa dalam perjalanan. Dari kebutuhan praktis itu, rendang berkembang menjadi hidangan istimewa untuk tamu, hari raya, dan acara adat.

## Banyak versi

Selain rendang daging, ada rendang ayam, rendang telur, rendang jengkol, dan rendang lokan. Setiap keluarga punya racikan bumbu sendiri. Perbedaan kecil dalam jumlah cabai, lengkuas, atau daun jeruk bisa menghasilkan rasa yang berbeda.

## Istilah

| Istilah | Arti |
| --- | --- |
| marandang | memasak rendang |
| karambia | kelapa (bahasa Minangkabau) |
| lado | cabai |
| santan | cairan dari kelapa parut |

> Rendang adalah bukti bahwa kesabaran punya rasa: semakin lama dimasak, semakin dalam rasanya.`,
  },
  {
    slug: "sisingamangaraja-toba",
    title: "Sisingamangaraja: Pemimpin yang Menolak Menyerah",
    category: "sejarah",
    region_id: 5,
    language_id: 4,
    status: "published",
    summary:
      "Dari tepi Danau Toba, Sisingamangaraja XII memimpin perlawanan panjang terhadap kekuasaan kolonial di Tanah Batak.",
    content: `Sisingamangaraja XII adalah salah satu tokoh paling penting dalam sejarah Batak. Ia lahir di Bakkara, tepi Danau Toba, pada 1849, dan menjadi raja sekaligus pemimpin spiritual bagi masyarakat Batak Toba.

## Gelar dan tanggung jawab

Sisingamangaraja bukan nama pribadi, melainkan gelar yang diwariskan. Sebagai raja, ia bertanggung jawab menjaga adat, menyelesaikan perselisihan, dan melindungi kampung-kampung di sekitarnya. Dalam masyarakat Batak, raja juga berperan sebagai penjaga hubungan antara manusia, leluhur, dan alam.

## Menolak kekuasaan kolonial

Ketika Belanda memperluas pengaruhnya ke Tanah Batak, Sisingamangaraja XII menolak tunduk. Perang Batak berlangsung sejak akhir abad ke-19. Ia memimpin perlawanan secara bergerilya, berpindah dari satu hutan ke hutan lain bersama pengikutnya.

## Akhir perjuangan

Sisingamangaraja XII gugur pada 1907 di Dairi. Perjuangannya dikenang sebagai simbol keberanian dan kesetiaan pada tanah kelahiran. Pada 1961, pemerintah Indonesia menetapkannya sebagai Pahlawan Nasional.

## Istilah

| Istilah | Arti |
| --- | --- |
| huta | kampung (bahasa Batak Toba) |
| marga | klan atau kelompok kekerabatan |
| ulos | kain adat Batak |

> Nama Sisingamangaraja dikenang bukan karena ia menang, tetapi karena ia tidak menyerah.`,
  },
  {
    slug: "jejak-maritim-bugis",
    title: "Jejak Maritim Bugis: Pelaut dari Tanah Bone",
    category: "sejarah",
    region_id: 8,
    language_id: 8,
    status: "published",
    summary:
      "Pinisi, pengetahuan membuat perahu, dan jaringan pelayaran yang menghubungkan Nusantara — warisan maritim Bugis dari Bone.",
    content: `Orang Bugis dikenal sebagai pelaut ulung. Dari pesisir Sulawesi Selatan, mereka mengarungi laut dengan perahu layar, menjalin perdagangan, dan membangun permukiman di berbagai wilayah Nusantara. Salah satu pusat kekuatan maritim Bugis adalah Bone, dengan ibu kota Watampone.

## Pinisi dan para ahli perahu

Pinisi adalah perahu layar ikonik orang Bugis-Makassar. Perahu ini banyak dibuat di Tana Beru, Bulukumba, oleh para panrita lopi, ahli pembuat perahu yang mewarisi pengetahuan dari generasi ke generasi. Tanpa cetak biru modern, mereka menentukan bentuk lambung dan tiang dari pengalaman.

## Jaringan pelayaran

Pelaut Bugis-Makassar berlayar ke Malaka, Kalimantan, Maluku, Nusa Tenggara, bahkan Australia utara. Mereka membawa rempah, kain, dan hasil bumi, lalu kembali dengan barang dagangan lain. Di kota-kota pelabuhan, permukiman Bugis tumbuh dan bertahan hingga kini.

## Pengetahuan yang menyertai

Pelayaran tidak hanya soal keberanian. Ada pengetahuan tentang angin, pasang surut, bintang, dan peta laut. Aksara lontara juga dipakai untuk mencatat perjanjian, silsilah, dan aturan perdagangan.

## Istilah

| Istilah | Arti |
| --- | --- |
| pinisi | perahu layar tradisional Bugis-Makassar |
| panrita lopi | ahli pembuat perahu |
| lontara | aksara dan naskah Bugis |
| sombala | layar (bahasa Bugis) |

> Bagi orang Bugis, laut bukan batas, melainkan jalan yang menghubungkan banyak tempat.`,
  },
];
