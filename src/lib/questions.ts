import type { Json, Tables } from "@/types/database";
import { shuffle } from "@/lib/utils";

/**
 * Normalisasi bentuk `questions.options` (jsonb) yang bisa beragam:
 *  - ["a", "b", "c"]                         → pilihan / token
 *  - { choices: [...] } | { options: [...] } | { words: [...] }
 *  - match: [{ left, right }] | { pairs: [...] } | { "kiri": "kanan" }
 */

export type MatchPair = { left: string; right: string };

function isRecord(v: Json | null | undefined): v is { [key: string]: Json | undefined } {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function toStringList(v: Json | null | undefined): string[] {
  if (Array.isArray(v)) {
    return v
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return String(item);
        if (isRecord(item)) {
          const text = item.text ?? item.label ?? item.value;
          return typeof text === "string" ? text : null;
        }
        return null;
      })
      .filter((s): s is string => !!s && s.trim().length > 0);
  }
  return [];
}

export function getChoices(options: Json | null): string[] {
  if (Array.isArray(options)) return toStringList(options);
  if (isRecord(options)) {
    return toStringList(options.choices ?? options.options ?? options.words ?? options.tokens ?? null);
  }
  return [];
}

export function getPairs(options: Json | null, correctAnswer: string): MatchPair[] {
  const fromList = (list: Json[]): MatchPair[] =>
    list
      .map((p) => {
        if (isRecord(p)) {
          const left = p.left ?? p.word ?? p.a;
          const right = p.right ?? p.meaning ?? p.b;
          if (typeof left === "string" && typeof right === "string") return { left, right };
        }
        if (Array.isArray(p) && p.length === 2 && typeof p[0] === "string" && typeof p[1] === "string") {
          return { left: p[0], right: p[1] };
        }
        return null;
      })
      .filter((p): p is MatchPair => !!p);

  if (Array.isArray(options)) {
    const pairs = fromList(options);
    if (pairs.length) return pairs;
  }
  if (isRecord(options)) {
    if (Array.isArray(options.pairs)) return fromList(options.pairs);
    const entries = Object.entries(options).filter(([, v]) => typeof v === "string") as [string, string][];
    if (entries.length) return entries.map(([left, right]) => ({ left, right }));
  }
  // Fallback: correct_answer berbentuk JSON pasangan
  try {
    const parsed = JSON.parse(correctAnswer) as Json;
    if (parsed && typeof parsed === "object") return getPairs(parsed, "");
  } catch {
    /* bukan JSON */
  }
  return [];
}

/** Lowercase, tanpa diakritik & tanda baca, spasi dirapikan. */
export function normalizeAnswer(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,!?;:"“”'’`()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** correct_answer boleh berisi beberapa alternatif dipisah "|". */
export function acceptedAnswers(correctAnswer: string) {
  return correctAnswer
    .split("|")
    .map((a) => a.trim())
    .filter(Boolean);
}

export function primaryAnswer(correctAnswer: string) {
  return acceptedAnswers(correctAnswer)[0] ?? correctAnswer;
}

export function isTextCorrect(input: string, correctAnswer: string) {
  const given = normalizeAnswer(input);
  return acceptedAnswers(correctAnswer).some((a) => normalizeAnswer(a) === given);
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

/** Kemiripan 0..1 — untuk soal bicara (pengenalan suara tidak selalu presisi). */
export function similarity(a: string, b: string) {
  const x = normalizeAnswer(a);
  const y = normalizeAnswer(b);
  if (!x.length && !y.length) return 1;
  return 1 - levenshtein(x, y) / Math.max(x.length, y.length);
}

export function isSpeechCorrect(transcript: string, correctAnswer: string) {
  return acceptedAnswers(correctAnswer).some((a) => similarity(transcript, a) >= 0.7);
}

/** Token untuk soal susun kalimat. Jika options kosong, pecah jawaban lalu acak. */
export function getArrangeTokens(options: Json | null, correctAnswer: string) {
  const fromOptions = getChoices(options);
  const tokens = fromOptions.length ? fromOptions : primaryAnswer(correctAnswer).split(/\s+/);
  return shuffle(tokens);
}

export type LessonQuestion = Pick<
  Tables<"questions">,
  "id" | "type" | "prompt" | "options" | "correct_answer" | "audio_url" | "order_index" | "vocabulary_id"
> & {
  vocabulary: Pick<Tables<"vocabularies">, "id" | "word" | "meaning_id" | "audio_url" | "pronunciation"> | null;
};

export const QUESTION_TYPE_LABEL: Record<Tables<"questions">["type"], string> = {
  multiple_choice: "Pilih jawaban yang benar",
  translate: "Terjemahkan",
  listen: "Dengarkan",
  match: "Pasangkan kata",
  arrange: "Susun kalimat",
  speak: "Ucapkan",
};
