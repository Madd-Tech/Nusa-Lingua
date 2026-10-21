"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "nl_sound";
const EVENT = "nl-sound-change";

function readPref() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Preferensi efek suara (disimpan per perangkat). */
export function useSoundPreference() {
  const [enabled, setEnabled] = useState(true);
  useEffect(() => {
    setEnabled(readPref());
    const sync = () => setEnabled(readPref());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const set = useCallback((value: boolean) => {
    try {
      localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
    } catch {
      /* abaikan */
    }
    setEnabled(value);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return [enabled, set] as const;
}

type Tone = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

/** Volume puncak bawaan tiap nada (0–1). Nada individu bisa menimpanya lewat `gain`. */
const DEFAULT_GAIN = 0.18;

/** Efek suara sintetis (Web Audio) — tanpa berkas audio tambahan. */
export function useSoundEffects() {
  const [enabled, setEnabled] = useSoundPreference();
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(
    (tones: Tone[]) => {
      if (!enabled || typeof window === "undefined") return;
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current ??= new Ctx();
        const ctx = ctxRef.current;
        // Browser bisa menangguhkan AudioContext sebelum ada interaksi pengguna.
        if (ctx.state === "suspended") void ctx.resume();
        const now = ctx.currentTime;
        for (const t of tones) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const peak = t.gain ?? DEFAULT_GAIN;
          osc.type = t.type ?? "sine";
          osc.frequency.value = t.freq;
          gain.gain.setValueAtTime(0.0001, now + t.at);
          gain.gain.exponentialRampToValueAtTime(peak, now + t.at + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + t.at + t.dur);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + t.at);
          osc.stop(now + t.at + t.dur + 0.05);
        }
      } catch {
        /* audio tidak tersedia */
      }
    },
    [enabled],
  );

  return useMemo(
    () => ({
      enabled,
      setEnabled,
      /** Ketukan lembut saat memilih jawaban. */
      select: () =>
        play([
          { freq: 880, at: 0, dur: 0.05, type: "triangle", gain: 0.07 },
          { freq: 1320, at: 0.016, dur: 0.07, type: "sine", gain: 0.045 },
        ]),
      correct: () =>
        play([
          { freq: 784, at: 0, dur: 0.1, type: "triangle", gain: 0.12 },
          { freq: 1047, at: 0.09, dur: 0.18, type: "triangle", gain: 0.12 },
        ]),
      wrong: () =>
        play([
          { freq: 233, at: 0, dur: 0.16, type: "sawtooth", gain: 0.06 },
          { freq: 185, at: 0.08, dur: 0.22, type: "triangle", gain: 0.13 },
          { freq: 110, at: 0.08, dur: 0.24, type: "sine", gain: 0.1 },
        ]),
      /** Combo 3 jawaban benar berturut-turut: arpeggio cepat + kilau. */
      streak: () =>
        play([
          { freq: 659, at: 0, dur: 0.09, type: "triangle", gain: 0.1 },
          { freq: 784, at: 0.08, dur: 0.09, type: "triangle", gain: 0.1 },
          { freq: 988, at: 0.16, dur: 0.09, type: "triangle", gain: 0.1 },
          { freq: 1319, at: 0.24, dur: 0.28, type: "triangle", gain: 0.12 },
          { freq: 1976, at: 0.26, dur: 0.2, type: "sine", gain: 0.05 },
          { freq: 1568, at: 0.34, dur: 0.26, type: "sine", gain: 0.05 },
        ]),
      /** Super combo 10: fanfare lebih panjang dengan gebrakan bass. */
      streakMega: () =>
        play([
          { freq: 98, at: 0, dur: 0.32, type: "sine", gain: 0.1 },
          { freq: 523, at: 0, dur: 0.12, type: "triangle", gain: 0.13 },
          { freq: 659, at: 0.1, dur: 0.12, type: "triangle", gain: 0.13 },
          { freq: 784, at: 0.2, dur: 0.12, type: "triangle", gain: 0.13 },
          { freq: 1047, at: 0.3, dur: 0.14, type: "triangle", gain: 0.14 },
          { freq: 1319, at: 0.42, dur: 0.52, type: "triangle", gain: 0.16 },
          { freq: 1568, at: 0.44, dur: 0.4, type: "sine", gain: 0.07 },
          { freq: 1976, at: 0.5, dur: 0.36, type: "sine", gain: 0.05 },
          { freq: 2093, at: 0.62, dur: 0.42, type: "sine", gain: 0.04 },
        ]),
      finish: () =>
        play([
          { freq: 523, at: 0, dur: 0.14, type: "triangle", gain: 0.11 },
          { freq: 659, at: 0.12, dur: 0.14, type: "triangle", gain: 0.11 },
          { freq: 784, at: 0.24, dur: 0.14, type: "triangle", gain: 0.11 },
          { freq: 1047, at: 0.36, dur: 0.32, type: "triangle", gain: 0.13 },
          { freq: 1319, at: 0.4, dur: 0.3, type: "sine", gain: 0.05 },
        ]),
    }),
    [enabled, play, setEnabled],
  );
}
