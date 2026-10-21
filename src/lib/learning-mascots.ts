import type { MascotId } from "@/lib/mascot-poses";

/**
 * Teman belajar (maskot) untuk halaman jalur belajar dan sesi lesson.
 *
 * Satu maskot dipetakan ke satu bahasa daerah; bila bahasanya belum punya
 * maskot khusus, aplikasi memilih satu dari maskot baru secara deterministik
 * supaya pengalaman belajar tetap punya pendamping.
 */
export type LearningMascotPoses = {
  greeting: string;
  idle: string;
  thinking: string;
  correct: string;
  wrong: string;
  celebrate: string;
};

export type LearningMascotProfile = {
  id: MascotId;
  name: string;
  region: string;
  languageCodes: string[];
  avatar: string;
  tagline: string;
  /** Sapaan pembuka saat sesi lesson dimulai. */
  greeting: string;
  poses: LearningMascotPoses;
  lines: {
    idle: string[];
    correct: string[];
    wrong: string[];
    streak: string[];
    result: string;
  };
};

const MASCOTS: Record<string, LearningMascotProfile> = {
  "mbah-darmo": {
    id: "mbah-darmo",
    name: "Mbah Darmo",
    region: "Yogyakarta",
    languageCodes: ["jv"],
    avatar: "/media/maskot/avatar-default.svg",
    tagline: "Kakek ramah dan sabar yang menemani latihan bahasa Jawa.",
    greeting: "Sugeng rawuh! Ayo sinau basa Jawa bareng aku.",
    poses: { greeting: "menyapa", idle: "menyapa", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Aku temani sinau, ya. Pilih jawaban sing paling tepat!", "Tenang wae, ora usah kesusu."],
      correct: ["Bener banget!", "Wah, pinter tenan!", "Mantap, terus kaya ngene."],
      wrong: ["Ora apa-apa, salah iku bagian saka sinau.", "Ayo dicoba maneh, alon-alon wae."],
      streak: ["Telung jawaban bener berturut-turut! Keren tenan!"],
      result: "Kerja bagus! Ayo terus sinau basa Jawa.",
    },
  },
  "teh-euis-ai": {
    id: "teh-euis-ai",
    name: "Teh Euis",
    region: "Bandung",
    languageCodes: ["su"],
    avatar: "/media/maskot/euis-avatar-default.svg",
    tagline: "Teteh ceria dari Bandung, siap ngobrol santai dalam bahasa Sunda.",
    greeting: "Wilujeng sumping! Urang diajar basa Sunda, yuk.",
    poses: { greeting: "menyapa-sunda", idle: "menyapa-sunda", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Urang diajar bareng, yuk! Pilih jawaban anu bener.", "Santai wae, teu kudu buru-buru."],
      correct: ["Bener pisan!", "Hebat, teteh bangga!", "Mantap, teruskeun!"],
      wrong: ["Teu nanaon, salah téh bagian tina diajar.", "Hayu cobian deui, urang bisa!"],
      streak: ["Tilu jawaban bener berturut-turut! Luar biasa!"],
      result: "Hatur nuhun geus diajar! Teruskeun sumangetna.",
    },
  },
  "eyang-nusa": {
    id: "eyang-nusa",
    name: "Eyang Nusa",
    region: "Nusantara",
    // Maskot payung Nusa Lingua — tidak lagi jadi default bahasa tertentu.
    languageCodes: [],
    avatar: "/media/maskot/ekspresi-senang.svg",
    tagline: "Maskot kenamaan Nusa Lingua yang merayakan keberagaman bahasa daerah.",
    greeting: "Salam budaya! Ayo lestarikan bahasa daerah bersama Eyang.",
    poses: { greeting: "melambai-bali", idle: "melambai-bali", thinking: "bercerita", correct: "mengangguk", wrong: "bercerita", celebrate: "merayakan" },
    lines: {
      idle: ["Eyang temani belajar, ya. Pilih jawaban yang paling tepat.", "Tidak perlu tergesa-gesa, nikmati prosesnya."],
      correct: ["Tepat sekali!", "Bagus, kamu makin paham!", "Eyang ikut senang!"],
      wrong: ["Tidak apa-apa, dari salah kita belajar.", "Coba baca lagi soalnya, lalu jawab dengan tenang."],
      streak: ["Tiga jawaban benar berturut-turut! Eyang bangga!"],
      result: "Kerja bagus! Terus lestarikan bahasa daerah.",
    },
  },
  "kak-sitti": {
    id: "kak-sitti",
    name: "Kak Sitti",
    region: "Pamekasan, Madura",
    languageCodes: ["mad"],
    avatar: "/media/maskot/kak-sitti/avatar-default.svg",
    tagline: "Kakak ramah dari Pamekasan yang siap menemani belajar bahasa Madura.",
    greeting: "Salamet datang! Ayo belajar bahasa Madura bareng Kak Sitti.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Kak Sitti temani belajar, ya. Pilih jawaban yang tepat!", "Tenang, tidak perlu buru-buru."],
      correct: ["Tepat sekali!", "Hebat, kamu makin jago!", "Kak Sitti bangga!"],
      wrong: ["Hampir benar! Coba lagi, ya.", "Tidak apa-apa, salah itu bagian dari belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Madura.",
    },
  },
  "nenek-aminah": {
    id: "nenek-aminah",
    name: "Nenek Aminah",
    region: "Banda Aceh",
    languageCodes: ["ace"],
    avatar: "/media/maskot/nenek-aminah/avatar-default.svg",
    tagline: "Nenek bijak dari Banda Aceh yang senang bercerita sambil mengajari bahasa Aceh.",
    greeting: "Selamat datang! Nenek temani belajar bahasa Aceh, ya.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Nenek temani belajar. Pilih jawaban yang paling tepat, ya.", "Pelankan sedikit, tidak perlu terburu-buru."],
      correct: ["Tepat sekali!", "Alhamdulillah, bagus!", "Nenek bangga sama kamu."],
      wrong: ["Hampir benar. Coba baca lagi soalnya.", "Tidak apa-apa, dari salah kita belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Nenek bangga sekali!"],
      result: "Kerja bagus! Terus lestarikan bahasa Aceh.",
    },
  },
  "uda-rizal": {
    id: "uda-rizal",
    name: "Uda Rizal",
    region: "Padang, Sumatera Barat",
    languageCodes: ["min"],
    avatar: "/media/maskot/uda-rizal/avatar-default.svg",
    tagline: "Uda ramah asal Padang yang senang berbagi bahasa dan petatah-petitih Minang.",
    greeting: "Salamaik datang! Ayo baraja basa Minang basamo Uda.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Uda temani baraja. Pilih jawaban yang paling tepat, ya.", "Santai saja, tidak perlu tergesa-gesa."],
      correct: ["Tepat sekali!", "Hebat, kamu makin paham!", "Uda bangga!"],
      wrong: ["Hampir benar. Coba lagi, ya.", "Tidak apa-apa, salah itu bagian dari baraja."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus baraja basa Minang.",
    },
  },
  "luh-sari": {
    id: "luh-sari",
    name: "Luh Sari",
    region: "Denpasar, Bali",
    languageCodes: ["ban"],
    avatar: "/media/maskot/luh-sari/avatar-default.svg",
    tagline: "Gadis Bali yang riang dari Denpasar, siap mengajari bahasa Bali dan sor singgih basa.",
    greeting: "Rahajeng rauh! Ayo belajar bahasa Bali dan sor singgih basa bareng Luh Sari.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Luh Sari temani belajar, ya. Pilih jawaban yang paling tepat!", "Tenang, tidak perlu buru-buru."],
      correct: ["Tepat sekali!", "Bagus, kamu makin paham!", "Luh Sari bangga!"],
      wrong: ["Hampir benar. Coba lagi, ya.", "Tidak apa-apa, dari salah kita belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Bali.",
    },
  },
  "acil-imah": {
    id: "acil-imah",
    name: "Acil Imah",
    region: "Banjarmasin, Kalimantan Selatan",
    languageCodes: ["bjn"],
    avatar: "/media/maskot/acil-imah/avatar-default.svg",
    tagline: "Acil ramah dari Banjarmasin yang siap menemani belajar bahasa Banjar.",
    greeting: "Salamat datang! Ayo belajar bahasa Banjar bareng Acil Imah.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Acil Imah temani belajar, ya. Pilih jawaban yang tepat!", "Tenang, tidak perlu buru-buru."],
      correct: ["Tepat sekali!", "Hebat, kamu makin jago!", "Acil bangga!"],
      wrong: ["Hampir benar! Coba lagi, ya.", "Tidak apa-apa, salah itu bagian dari belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Banjar.",
    },
  },
  "amang-tigor": {
    id: "amang-tigor",
    name: "Amang Tigor",
    region: "Danau Toba, Sumatera Utara",
    languageCodes: ["bbc"],
    avatar: "/media/maskot/amang-tigor/avatar-default.svg",
    tagline: "Bapak hangat dari tepi Danau Toba yang siap menemani latihan bahasa Batak Toba.",
    greeting: "Horas! Ayo belajar bahasa Batak Toba bareng Amang Tigor.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Amang temani belajar, ya. Pilih jawaban yang paling tepat!", "Santai saja, tidak perlu tergesa-gesa."],
      correct: ["Tepat sekali! Horas!", "Bagus, kamu makin paham!", "Amang bangga!"],
      wrong: ["Hampir benar. Coba lagi, ya.", "Tidak apa-apa, dari salah kita belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Horas! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Batak Toba.",
    },
  },
  "bapa-ambun": {
    id: "bapa-ambun",
    name: "Bapa Ambun",
    region: "Sungai Kahayan, Kalimantan Tengah",
    languageCodes: ["nij"],
    avatar: "/media/maskot/bapa-ambun/avatar-default.svg",
    tagline: "Bapak bersahaja dari tepi Sungai Kahayan, pendamping latihan bahasa Dayak Ngaju.",
    greeting: "Selamat datang! Bapa Ambun temani belajar bahasa Dayak Ngaju, ya.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Bapa temani belajar, ya. Pilih jawaban yang paling tepat!", "Tenang, tidak perlu tergesa-gesa."],
      correct: ["Tepat sekali!", "Bagus, kamu makin paham!", "Bapa bangga!"],
      wrong: ["Hampir benar. Coba lagi, ya.", "Tidak apa-apa, dari salah kita belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Dayak Ngaju.",
    },
  },
  "daeng-baso": {
    id: "daeng-baso",
    name: "Daeng Baso",
    region: "Watampone, Sulawesi Selatan",
    languageCodes: ["bug"],
    avatar: "/media/maskot/daeng-baso/avatar-default.svg",
    tagline: "Pelaut tenang dari Watampone yang senang mengajari bahasa Bugis.",
    greeting: "Aga kareba! Ayo belajar bahasa Bugis bareng Daeng Baso.",
    poses: { greeting: "menyapa", idle: "napas", thinking: "berpikir", correct: "memuji", wrong: "kurang-yakin", celebrate: "memuji" },
    lines: {
      idle: ["Daeng temani belajar, ya. Pilih jawaban yang paling tepat!", "Santai saja, tidak perlu tergesa-gesa."],
      correct: ["Tepat sekali!", "Hebat, kamu makin paham!", "Daeng bangga!"],
      wrong: ["Hampir benar. Coba lagi, ya.", "Tidak apa-apa, salah itu bagian dari belajar."],
      streak: ["Tiga jawaban benar berturut-turut! Luar biasa!"],
      result: "Kerja bagus! Ayo terus belajar bahasa Bugis.",
    },
  },
};

const BY_CODE = new Map<string, LearningMascotProfile>();
for (const profile of Object.values(MASCOTS)) {
  for (const code of profile.languageCodes) BY_CODE.set(code, profile);
}

/** Urutan tampil di pemilih teman belajar — satu maskot untuk tiap bahasa daerah. */
export const LEARNING_MASCOTS: LearningMascotProfile[] = [
  MASCOTS["mbah-darmo"],
  MASCOTS["teh-euis-ai"],
  MASCOTS["luh-sari"],
  MASCOTS["kak-sitti"],
  MASCOTS["nenek-aminah"],
  MASCOTS["uda-rizal"],
  MASCOTS["amang-tigor"],
  MASCOTS["daeng-baso"],
  MASCOTS["bapa-ambun"],
  MASCOTS["acil-imah"],
  MASCOTS["eyang-nusa"],
];

/** Maskot cadangan untuk bahasa yang belum punya pendamping khusus. */
const FALLBACK_ORDER: LearningMascotProfile[] = LEARNING_MASCOTS.filter(
  (profile) => profile.languageCodes.length > 0,
);

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/** Teman belajar untuk kode bahasa (mis. "jv", "su", "mad"). */
export function getLearningMascot(code?: string | null): LearningMascotProfile {
  const normalized = (code ?? "").trim().toLowerCase();
  const direct = BY_CODE.get(normalized);
  if (direct) return direct;
  return FALLBACK_ORDER[hashString(normalized || "nusa") % FALLBACK_ORDER.length];
}

/** Ambil satu kalimat secara deterministik agar tidak berubah tiap render. */
export function pickLine(lines: string[], seed = 0): string {
  if (lines.length === 0) return "";
  return lines[Math.abs(seed) % lines.length];
}
