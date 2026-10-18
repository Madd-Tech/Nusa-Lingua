import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Ilustrasi rumah adat Nusantara (inline SVG flat, aria-hidden).
 * Dipakai marker peta bahasa di landing: saat marker diklik,
 * pin berubah menjadi rumah adat khas daerah tersebut.
 */

export type RumahAdatType =
  | "joglo"
  | "badog"
  | "bali"
  | "rumoh-aceh"
  | "bolon"
  | "gadang"
  | "tanean-lanjhang"
  | "saoraja"
  | "bubungan-tinggi"
  | "betang"
  | "tongkonan"
  | "lumbung"
  | "baileo"
  | "kaki-seribu"
  | "panggung";

const NAMES: Record<RumahAdatType, string> = {
  joglo: "Rumah Joglo",
  badog: "Imah Badog",
  bali: "Bale Bali",
  "rumoh-aceh": "Rumoh Aceh",
  bolon: "Rumah Bolon",
  gadang: "Rumah Gadang",
  "tanean-lanjhang": "Tanean Lanjhang",
  saoraja: "Saoraja",
  "bubungan-tinggi": "Bubungan Tinggi",
  betang: "Rumah Betang",
  tongkonan: "Tongkonan",
  lumbung: "Lumbung Sasak",
  baileo: "Baileo",
  "kaki-seribu": "Rumah Kaki Seribu",
  panggung: "Rumah Panggung",
};

/** Cocokkan daerah (name/province/island) ke rumah adatnya. Fallback: rumah panggung. */
export function getRumahAdat(region: { name: string; province: string | null; island: string | null }) {
  const text = `${region.name} ${region.province ?? ""} ${region.island ?? ""}`.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => text.includes(k))) return { type: rule.type, name: NAMES[rule.type] };
  }
  return { type: "panggung" as const, name: NAMES.panggung };
}

// Urutan penting: aturan yang lebih spesifik ditaruh lebih dulu (mis. Madura sebelum "jawa timur",
// Bugis sebelum "sulawesi", Banjar sebelum "kalimantan").
const RULES: Array<{ type: RumahAdatType; keywords: string[] }> = [
  { type: "rumoh-aceh", keywords: ["aceh", "lhokseumawe", "sabang", "meulaboh", "langsa"] },
  {
    type: "bolon",
    keywords: ["sumatera utara", "sumatra utara", "batak", "toba", "balige", "samosir", "tarutung", "siantar", "sibolga", "medan"],
  },
  { type: "tanean-lanjhang", keywords: ["madura", "pamekasan", "sumenep", "sampang", "bangkalan"] },
  {
    type: "badog",
    keywords: ["jawa barat", "banten", "bandung", "bogor", "sunda", "tasik", "cirebon", "sumedang", "garut", "cianjur", "sukabumi", "purwakarta"],
  },
  {
    type: "joglo",
    keywords: ["yogyakarta", "jogja", "jawa tengah", "solo", "surakarta", "semarang", "magelang", "klaten", "purworejo", "jawa timur", "surabaya", "malang", "kediri", "madiun", "jombang", "bojonegoro"],
  },
  { type: "bali", keywords: ["bali", "denpasar", "singaraja", "gianyar", "klungkung"] },
  {
    type: "gadang",
    keywords: ["sumatera barat", "sumatra barat", "padang", "bukittinggi", "payakumbuh", "minang", "solok", "padang panjang", "sijunjung"],
  },
  {
    type: "bubungan-tinggi",
    keywords: ["kalimantan selatan", "banjarmasin", "banjarbaru", "martapura", "kandangan", "barabai", "banjar"],
  },
  {
    type: "betang",
    keywords: ["kalimantan", "pontianak", "palangka raya", "palangkaraya", "balikpapan", "samarinda", "dayak", "kapuas", "ketapang"],
  },
  {
    type: "saoraja",
    keywords: ["bugis", "watampone", "bone", "sengkang", "wajo", "soppeng", "sidrap", "sidenreng", "parepare", "barru", "pinrang"],
  },
  {
    type: "tongkonan",
    keywords: ["sulawesi", "toraja", "makassar", "manado", "palu", "gowa", "bitung"],
  },
  {
    type: "lumbung",
    keywords: ["nusa tenggara", "lombok", "mataram", "sasak", "sumba", "flores", "kupang", "bima", "dompu", "ende", "sumbawa"],
  },
  { type: "baileo", keywords: ["maluku", "ambon", "ternate", "tidore", "seram", "buru"] },
  {
    type: "kaki-seribu",
    keywords: ["papua", "jayapura", "mimika", "sentani", "biak", "wamena", "merauke", "sorong", "manokwari", "fakfak", "kaimana"],
  },
];

type IconProps = { type: RumahAdatType; className?: string };

/** Ilustrasi rumah adat — selalu tampil penuh berwarna (ditaruh di atas chip putih). */
export function RumahAdat({ type, className }: IconProps) {
  return (
    <svg viewBox="0 0 64 56" aria-hidden="true" className={cn("size-8 shrink-0", className)}>
      {SHAPES[type]}
    </svg>
  );
}

/* Bayangan tanah untuk semua rumah */
const GROUND = <rect x="8" y="50" width="48" height="4" rx="2" className="fill-ink/15" />;

const SHAPES: Record<RumahAdatType, ReactNode> = {
  /* Joglo — tajuk tinggi berpenjor + pendopo lebar (Jawa) */
  joglo: (
    <>
      <path d="M32 3C26 9 16 19 7 27h50C48 19 38 9 32 3Z" className="fill-accent-600" />
      <path d="M4 27h56l3 6H1Z" className="fill-accent-700" />
      <path d="M13 33h38v15H13Z" className="fill-primary-700" />
      <path d="M27 48V37h10v11Z" className="fill-secondary-600" />
      {GROUND}
    </>
  ),

  /* Imah Badog — alang-alang curam di atas panggung (Sunda) */
  badog: (
    <>
      <path d="M32 2C24 12 16 22 10 32h44C48 22 40 12 32 2Z" className="fill-secondary-600" />
      <path d="M32 10v22M24 18l-4 14M40 18l4 14" strokeWidth="1.5" strokeLinecap="round" className="stroke-secondary-700/40" fill="none" />
      <path d="M8 32h48v5H8Z" className="fill-primary-700" />
      <path d="M13 37h4v13h-4ZM47 37h4v13h-4Z" className="fill-primary-700/80" />
      <path d="M29 37h6v13h-6Z" className="fill-primary-700/60" />
      {GROUND}
    </>
  ),

  /* Bale Bali — meru bertingkat + bale berpelita (Bali) */
  bali: (
    <>
      <path d="M32 2 46 16H18Z" className="fill-accent-600" />
      <path d="M32 12 54 28H10Z" className="fill-accent-700" />
      <path d="M12 28h4v20h-4ZM30 28h4v20h-4ZM48 28h4v20h-4Z" className="fill-primary-700" />
      <path d="M8 48h48v3H8Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Rumoh Aceh — panggung tinggi, atap pelana memanjang + tangga di depan (Aceh) */
  "rumoh-aceh": (
    <>
      <path d="M4 24 15 8h34l11 16Z" className="fill-accent-600" />
      <path d="M2 24h60v3H2Z" className="fill-accent-700" />
      <path d="M10 27h44v11H10Z" className="fill-primary-700" />
      <path d="M15 30h5v5h-5ZM29 30h5v5h-5ZM44 30h5v5h-5Z" className="fill-secondary-600" />
      <path d="M12 38h3v12h-3ZM24 38h3v12h-3ZM49 38h3v12h-3Z" className="fill-primary-700/80" />
      <path d="M34 38h4l5 12h-4Z" className="fill-primary-700/60" />
      {GROUND}
    </>
  ),

  /* Rumah Bolon — atap pelana melengkung, kedua ujung menjulang + gorga (Batak Toba) */
  bolon: (
    <>
      <path d="M2 4c12 12 48 12 60 0l-7 26H9Z" className="fill-accent-600" />
      <path d="M12 30h40v10H12Z" className="fill-primary-700" />
      <path d="m20 32 4 3-4 3-4-3ZM32 32l4 3-4 3-4-3ZM44 32l4 3-4 3-4-3Z" className="fill-secondary-600" />
      <path d="M14 40h4v10h-4ZM30 40h4v10h-4ZM46 40h4v10h-4Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Rumah Gadang — atap tanduk kerbau melengkung (Sumatera Barat) */
  gadang: (
    <>
      <path d="M4 32C10 26 18 14 26 2c2 6 10 6 12 0 8 12 16 24 22 30-10-7-18-10-28-10s-18 3-28 10Z" className="fill-accent-600" />
      <path d="M13 31h38l-4 17H17Z" className="fill-primary-700" />
      <path d="m18 35 6-1v7l-6 1ZM46 35l-6-1v7l6 1Z" className="fill-secondary-600" />
      <path d="M29 48V38h6v10Z" className="fill-card" />
      {GROUND}
    </>
  ),

  /* Tanean Lanjhang — deretan rumah satu keluarga di halaman panjang, langgar di ujung barat (Madura) */
  "tanean-lanjhang": (
    <>
      <path d="M4 30 11 20l7 10Z" className="fill-accent-700" />
      <path d="M6 30h10v18H6Z" className="fill-primary-700/80" />
      <path d="M19 28 25 16h14l6 12Z" className="fill-accent-600" />
      <path d="M21 28h22v20H21Z" className="fill-primary-700" />
      <path d="M29 48v-9h6v9Z" className="fill-card" />
      <path d="M45 31 49 22h9l4 9Z" className="fill-accent-600" />
      <path d="M47 31h14v17H47Z" className="fill-primary-700" />
      <path d="M52 48v-6h4v6Z" className="fill-card" />
      <path d="M3 48h58v2H3Z" className="fill-secondary-600" />
      {GROUND}
    </>
  ),

  /* Bubungan Tinggi — atap tengah sangat curam diapit anjung (Banjar) */
  "bubungan-tinggi": (
    <>
      <path d="M3 34 10 24h12v10ZM61 34l-7-10H42v10Z" className="fill-accent-700" />
      <path d="M8 30h48v12H8Z" className="fill-primary-700" />
      <path d="M32 2 44 30H20Z" className="fill-accent-600" />
      <path d="M13 33h5v5h-5ZM46 33h5v5h-5Z" className="fill-secondary-600" />
      <path d="M28 42v-8h8v8Z" className="fill-card" />
      <path d="M10 42h4v8h-4ZM30 42h4v8h-4ZM50 42h4v8h-4Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Rumah Betang — rumah panjang di atas tiang (Kalimantan) */
  betang: (
    <>
      <path d="M3 20C18 11 46 11 61 20v5H3Z" className="fill-accent-600" />
      <path d="M7 25h50v13H7Z" className="fill-primary-700" />
      <path d="M12 29h6v5h-6ZM29 29h6v5h-6ZM46 29h6v5h-6Z" className="fill-secondary-600" />
      <path d="M11 38h4v12h-4ZM26 38h4v12h-4ZM49 38h4v12h-4Z" className="fill-primary-700/80" />
      <path d="M34 38h5v12l-5 4Z" className="fill-primary-700/60" />
      {GROUND}
    </>
  ),

  /* Tongkonan — atap perahu menghadap langit (Sulawesi) */
  tongkonan: (
    <>
      <path d="M2 10C12 26 20 31 32 31s20-5 30-21C52 4 42 1 32 1S12 4 2 10Z" className="fill-accent-600" />
      <path d="M14 30h36v16H14Z" className="fill-primary-700" />
      <path d="M20 34h5v3h-5ZM29 34h5v3h-5ZM38 34h5v3h-5Z" className="fill-secondary-600" />
      <path d="M27 46V36h10v10Z" className="fill-card" />
      <path d="M12 46h40v4H12Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Saoraja — rumah panggung tinggi, timpa laja bersusun di bidang atap (Bugis) */
  saoraja: (
    <>
      <path d="M32 4 58 26H6Z" className="fill-accent-600" />
      <path d="M29 1 35 7M35 1l-6 6" strokeWidth="2" strokeLinecap="round" className="stroke-accent-700" fill="none" />
      <path d="M27 13h10v3H27ZM24 17h16v3H24ZM21 21h22v3H21Z" className="fill-secondary-600" />
      <path d="M10 26h44v12H10Z" className="fill-primary-700" />
      <path d="M16 29h5v5h-5ZM43 29h5v5h-5Z" className="fill-secondary-600" />
      <path d="M29 38v-7h6v7Z" className="fill-card" />
      <path d="M12 38h4v12h-4ZM30 38h4v12h-4ZM48 38h4v12h-4Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Lumbung Sasak — lumbung bertumpuk bulat (Nusa Tenggara) */
  lumbung: (
    <>
      <path d="M32 2C20 13 12 24 10 33h44C52 24 44 13 32 2Z" className="fill-secondary-600" />
      <path d="M14 33h36v12H14Z" className="fill-primary-700" />
      <path d="M27 45V37a5 5 0 0 1 10 0v8Z" className="fill-card" />
      <path d="M17 45h4v5h-4ZM43 45h4v5h-4Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Baileo — balai terbuka beratap curam (Maluku) */
  baileo: (
    <>
      <path d="M32 2 55 27H9Z" className="fill-accent-600" />
      <path d="M13 27h4v20h-4ZM26 27h4v20h-4ZM34 27h4v20h-4ZM47 27h4v20h-4Z" className="fill-primary-700" />
      <path d="M11 47h42v4H11Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Kaki Seribu — atap pelana menjulang di atas tiang tinggi (Papua) */
  "kaki-seribu": (
    <>
      <path d="M3 12C18 29 46 29 61 12v-5C46 22 18 22 3 7Z" className="fill-accent-600" />
      <path d="M16 24h32v13H16Z" className="fill-primary-700" />
      <path d="M28 37h8v-6a4 4 0 0 0-8 0Z" className="fill-secondary-600" />
      <path d="M19 37h4v13h-4ZM41 37h4v13h-4ZM30 37h4v13h-4Z" className="fill-primary-700/80" />
      {GROUND}
    </>
  ),

  /* Panggung — rumah panggung generik (fallback daerah lain) */
  panggung: (
    <>
      <path d="M32 5 55 29H9Z" className="fill-secondary-600" />
      <path d="M8 29h48v5H8Z" className="fill-primary-700" />
      <path d="M13 34h4v16h-4ZM47 34h4v16h-4Z" className="fill-primary-700/80" />
      <path d="M22 34h20v12H22Z" className="fill-primary-700" />
      <path d="M29 46v-7h6v7Z" className="fill-card" />
      {GROUND}
    </>
  ),
};
