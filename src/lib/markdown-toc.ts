/** Ubah judul menjadi id anchor (dipakai daftar isi & renderer heading). */
export function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "bagian"
  );
}

/** Ambil heading level 2–3 dari markdown (mengabaikan blok kode). */
export function extractHeadings(markdown: string) {
  const headings: { level: 2 | 3; text: string; id: string }[] = [];
  let inCode = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inCode = !inCode;
    if (inCode) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*_`~]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
      headings.push({ level: m[1].length as 2 | 3, text, id: slugify(text) });
    }
  }
  return headings;
}
