/**
 * Aksara tradisional Nusantara untuk ikon bahasa.
 * Glyph dipilih per bahasa (kode ISO atau nama), dirender dengan font
 * Noto Sans (Javanese/Sundanese/Balinese/Buginese/Batak) dari @fontsource.
 */

type AksaraEntry = { glyph: string; label: string };

/** Berdasarkan kode bahasa (kolom languages.code). */
const AKSARA_BY_CODE: Record<string, AksaraEntry> = {
  // Aksara Jawa — huruf "ꦗ" (ja)
  jv: { glyph: "\uA997", label: "Aksara Jawa" },
  jw: { glyph: "\uA997", label: "Aksara Jawa" },
  // Aksara Sunda — huruf "ᮞ" (sa)
  su: { glyph: "\u1B9E", label: "Aksara Sunda" },
  sun: { glyph: "\u1B9E", label: "Aksara Sunda" },
  // Aksara Bali — huruf "ᬩ" (ba)
  ba: { glyph: "\u1B29", label: "Aksara Bali" },
  bal: { glyph: "\u1B29", label: "Aksara Bali" },
  ban: { glyph: "\u1B29", label: "Aksara Bali" },
  // Carakan Madura \u2014 bahasa Madura secara tradisional ditulis dengan aksara Jawa (dan Pegon)
  mad: { glyph: "\uA997", label: "Aksara Carakan (Madura)" },
  // Lontara (Bugis/Makassar/Sasak) — huruf "ᨅ" (ba)
  bug: { glyph: "\u1A05", label: "Aksara Lontara" },
  mak: { glyph: "\u1A05", label: "Aksara Lontara" },
  sas: { glyph: "\u1A05", label: "Aksara Lontara" },
  // Aksara Batak — huruf "ᯅ" (ba)
  btk: { glyph: "\u1BC5", label: "Aksara Batak" },
  bata: { glyph: "\u1BC5", label: "Aksara Batak" },
  bbc: { glyph: "\u1BC5", label: "Aksara Batak" },
};

/** Fallback berdasarkan nama bahasa (jika kode tidak dikenal). */
const AKSARA_BY_NAME: Array<{ keywords: string[]; entry: AksaraEntry }> = [
  { keywords: ["jawa", "javanese"], entry: AKSARA_BY_CODE.jv! },
  { keywords: ["sunda", "sundanese"], entry: AKSARA_BY_CODE.su! },
  { keywords: ["bali", "balinese"], entry: AKSARA_BY_CODE.ba! },
  { keywords: ["madura", "madurese"], entry: AKSARA_BY_CODE.mad! },
  { keywords: ["bugis", "makassar", "sasak", "lontara"], entry: AKSARA_BY_CODE.bug! },
  { keywords: ["batak", "toba", "karo", "mandailing", "simalungun", "pakpak"], entry: AKSARA_BY_CODE.btk! },
];

/** Cari glyph aksara untuk sebuah bahasa: cocokkan kode dulu, lalu nama. */
export function getAksara(code?: string | null, name?: string | null): AksaraEntry | null {
  if (code) {
    const byCode = AKSARA_BY_CODE[code.toLowerCase()];
    if (byCode) return byCode;
  }
  if (name) {
    const lower = name.toLowerCase();
    const found = AKSARA_BY_NAME.find((r) => r.keywords.some((k) => lower.includes(k)));
    if (found) return found.entry;
  }
  return null;
}
