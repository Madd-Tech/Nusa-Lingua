/**
 * Mock asisten AI — dipakai HANYA bila NEXT_PUBLIC_USE_MOCK_CHAT=true,
 * selama endpoint POST /api/chat dari tim backend belum tersedia.
 * Balasan bersifat contoh, tidak disimpan ke database, dan diberi label "Mode demo" di UI.
 */

type MockPersona = { name: string; languageName?: string | null };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function buildReply(message: string, persona: MockPersona) {
  const trimmed = message.trim();
  const lang = persona.languageName ? `bahasa ${persona.languageName}` : "bahasa daerah";
  const question = /\?$/.test(trimmed) || /^(apa|bagaimana|kenapa|mengapa|siapa|kapan|di mana|berapa)\b/i.test(trimmed);

  const intro = `(Mode demo) Halo, aku ${persona.name}.`;
  const body = question
    ? `Pertanyaan yang bagus! Saat asisten AI sudah tersambung, aku akan menjawab dalam ${lang} beserta terjemahan bahasa Indonesianya.`
    : `Aku menerima pesanmu: “${trimmed.slice(0, 160)}”. Nanti aku akan membalas dalam ${lang} dan membantu mengoreksi kalimatmu.`;
  const tip = "Sementara itu, coba latihan kosakata di menu Belajar atau Ulasan, ya!";
  return `${intro} ${body}\n\n${tip}`;
}

export async function* mockChatStream(message: string, persona: MockPersona, signal?: AbortSignal) {
  await delay(450);
  const words = buildReply(message, persona).split(/(\s+)/);
  for (const w of words) {
    if (signal?.aborted) return;
    await delay(w.trim() ? 28 + Math.random() * 40 : 0);
    yield w;
  }
}
