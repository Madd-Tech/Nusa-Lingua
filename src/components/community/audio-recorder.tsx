"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SECONDS = 10;

/** Perekam suara sederhana (MediaRecorder → Blob webm). */
export function AudioRecorder({ value, onChange }: { value: Blob | null; onChange: (blob: Blob | null) => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "MediaRecorder" in window && !!navigator.mediaDevices?.getUserMedia);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (!value) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(value);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [value]);

  const stop = () => {
    recorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const start = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        onChange(new Blob(chunks, { type: "audio/webm" }));
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Tidak bisa mengakses mikrofon. Izinkan akses mikrofon di browser.");
    }
  };

  if (supported === false) {
    return <p className="text-sm text-muted-foreground">Browsermu belum mendukung perekaman suara. Kamu tetap bisa mengirim tanpa audio.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {recording ? (
          <Button type="button" variant="destructive" onClick={stop}>
            <Square aria-hidden="true" className="fill-current" /> Berhenti ({MAX_SECONDS - seconds} dtk)
          </Button>
        ) : (
          <Button type="button" variant="outline" onClick={start} disabled={supported === null}>
            <Mic aria-hidden="true" /> {value ? "Rekam ulang" : "Rekam pelafalan"}
          </Button>
        )}
        {url && !recording ? (
          <>
            <audio controls src={url} className="h-10 max-w-full" aria-label="Putar rekamanmu" />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => onChange(null)} aria-label="Hapus rekaman">
              <Trash2 />
            </Button>
          </>
        ) : null}
      </div>
      <p aria-live="polite" className="text-xs text-muted-foreground">
        {recording ? `Merekam… ${seconds} detik` : `Opsional, maksimal ${MAX_SECONDS} detik.`}
      </p>
      {error ? (
        <p role="alert" className="text-sm font-semibold text-danger-700 dark:text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
