"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioButton } from "@/components/learning/audio-button";
import { primaryAnswer } from "@/lib/questions";
import { cn } from "@/lib/utils";
import type { QuestionProps } from "./types";

// Tipe minimal Web Speech API (belum ada di lib.dom TypeScript).
type RecognitionResultEvent = { results: ArrayLike<ArrayLike<{ transcript: string }>> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function SpeakQuestion({ question, answer, onAnswer, locked, verdict, onSkip }: QuestionProps & { onSkip: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<Recognition | null>(null);
  const target = primaryAnswer(question.correct_answer);
  const transcript = answer?.kind === "speak" ? answer.transcript : "";

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => recRef.current?.abort();
  }, []);

  const start = () => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;
    setError(null);
    const rec = new Ctor();
    // Bahasa daerah belum didukung mesin pengenal suara; id-ID paling mendekati.
    rec.lang = "id-ID";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0]?.transcript ?? "")
        .join(" ");
      onAnswer({ kind: "speak", transcript: text });
    };
    rec.onerror = (e) => {
      setError(
        e.error === "not-allowed"
          ? "Akses mikrofon ditolak. Izinkan mikrofon di pengaturan browser."
          : "Suara tidak terdengar jelas. Coba lagi.",
      );
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  const stop = () => recRef.current?.stop();

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex items-center gap-3 rounded-2xl border-2 bg-card px-4 py-3">
        <AudioButton
          src={question.audio_url ?? question.vocabulary?.audio_url}
          fallbackText={target}
          label={`Dengarkan contoh: ${target}`}
          size="sm"
        />
        <p className="text-xl font-extrabold">{target}</p>
      </div>

      {supported === false ? (
        <p className="flex items-center gap-2 rounded-2xl border-2 border-dashed p-4 text-sm text-muted-foreground">
          <MicOff aria-hidden="true" className="size-5 shrink-0" />
          Browsermu belum mendukung pengenalan suara. Kamu bisa melewati soal ini tanpa kehilangan nyawa.
        </p>
      ) : (
        <button
          type="button"
          onClick={listening ? stop : start}
          disabled={locked || supported === null}
          aria-pressed={listening}
          aria-label={listening ? "Berhenti merekam" : "Mulai bicara"}
          className={cn(
            "flex size-24 items-center justify-center rounded-full border-b-[6px] border-asisten-deep bg-asisten-solid text-white transition-[filter] hover:brightness-110 disabled:opacity-50",
            listening && "ring-8 ring-asisten/25",
          )}
        >
          {listening ? <Square aria-hidden="true" className="size-9 fill-current" /> : <Mic aria-hidden="true" className="size-10" />}
        </button>
      )}

      <p aria-live="polite" className="min-h-6 text-sm font-semibold">
        {listening ? "Mendengarkan… ucapkan kalimat di atas." : transcript ? <>Terdengar: “{transcript}”</> : null}
      </p>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-danger-700 dark:text-danger">
          {error}
        </p>
      ) : null}
      {locked ? null : (
        <Button type="button" variant={supported === false ? "default" : "ghost"} size={supported === false ? "default" : "sm"} onClick={onSkip}>
          Lewati soal bicara
        </Button>
      )}
    </div>
  );
}
