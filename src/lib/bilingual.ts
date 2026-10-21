/**
 * Format balasan asisten dwibahasa: teks bahasa daerah, lalu penanda, lalu terjemahan Indonesia.
 * Disimpan utuh di chat_messages.content; UI hanya menampilkan bagian daerah, dan toggle
 * "Terjemahkan" menukarnya dengan bagian Indonesia. Satu panggilan model per pesan.
 */
export const TRANSLATION_MARKER = "[[TERJEMAHAN]]";

const MARKER_RE = /\[\[\s*TERJEMAHAN\s*\]\]/i;

/** Ditambahkan ke system_prompt persona di server. Menggantikan aturan "terjemahan dalam tanda kurung". */
export const BILINGUAL_FORMAT_INSTRUCTION = `
ATURAN FORMAT BALASAN (wajib, mengesampingkan aturan terjemahan apa pun di atas):
1. Tulis seluruh jawabanmu HANYA dalam bahasa daerahmu. Jangan sisipkan terjemahan bahasa Indonesia, juga tidak dalam tanda kurung.
2. Setelah jawaban selesai, tulis satu baris berisi persis: ${TRANSLATION_MARKER}
3. Di bawah baris itu, tulis terjemahan bahasa Indonesia dari seluruh jawabanmu, dengan susunan paragraf dan daftar yang sama.
Penanda ${TRANSLATION_MARKER} hanya muncul sekali, dan tidak ada teks lain setelah terjemahan.
Pengecualian: istilah atau contoh kata yang sedang diajarkan boleh tetap ditulis dalam bahasa aslinya di kedua bagian.`.trim();

/**
 * Pisahkan balasan menjadi teks asli & terjemahan.
 * `streaming`: sembunyikan potongan penanda yang belum lengkap di ujung (mis. "[[TERJE") agar tidak berkedip.
 */
export function splitBilingual(content: string, streaming = false): { original: string; translation: string | null } {
  const match = MARKER_RE.exec(content);
  if (match) {
    const translation = content.slice(match.index + match[0].length).trim();
    return { original: content.slice(0, match.index).trimEnd(), translation: translation || null };
  }
  if (streaming) {
    for (let k = Math.min(TRANSLATION_MARKER.length - 1, content.length); k > 0; k--) {
      if (content.toUpperCase().endsWith(TRANSLATION_MARKER.slice(0, k))) {
        return { original: content.slice(0, -k).trimEnd(), translation: null };
      }
    }
  }
  return { original: content, translation: null };
}
