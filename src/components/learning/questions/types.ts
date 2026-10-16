import type { LessonQuestion } from "@/lib/questions";
import { isSpeechCorrect, isTextCorrect, primaryAnswer } from "@/lib/questions";

export type AnswerValue =
  | { kind: "choice"; value: string }
  | { kind: "text"; value: string }
  | { kind: "arrange"; tokens: string[] }
  | { kind: "match"; complete: boolean; mistakes: number }
  | { kind: "speak"; transcript: string };

export type QuestionProps = {
  question: LessonQuestion;
  answer: AnswerValue | null;
  onAnswer: (value: AnswerValue | null) => void;
  /** true setelah tombol Periksa ditekan. */
  locked: boolean;
  /** hasil pemeriksaan (untuk menandai opsi benar/salah). */
  verdict: boolean | null;
};

export function isAnswerReady(answer: AnswerValue | null) {
  if (!answer) return false;
  switch (answer.kind) {
    case "choice":
    case "text":
      return answer.value.trim().length > 0;
    case "arrange":
      return answer.tokens.length > 0;
    case "match":
      return answer.complete;
    case "speak":
      return answer.transcript.trim().length > 0;
  }
}

export function gradeAnswer(question: LessonQuestion, answer: AnswerValue): boolean {
  switch (answer.kind) {
    case "choice":
    case "text":
      return isTextCorrect(answer.value, question.correct_answer);
    case "arrange":
      return isTextCorrect(answer.tokens.join(" "), question.correct_answer);
    case "match":
      return answer.mistakes === 0;
    case "speak":
      return isSpeechCorrect(answer.transcript, question.correct_answer);
  }
}

export function correctAnswerText(question: LessonQuestion) {
  if (question.type === "match") return null;
  return primaryAnswer(question.correct_answer);
}

export type CompleteLessonResult = { xp_gained: number; stars: number; streak: number };

/** RPC bisa mengembalikan objek, array 1 baris, atau json — normalisasi di sini. */
export function parseCompleteLesson(data: unknown): CompleteLessonResult {
  const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null | undefined;
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0) || 0);
  return { xp_gained: num(row?.xp_gained), stars: num(row?.stars), streak: num(row?.streak) };
}
