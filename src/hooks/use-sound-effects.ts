"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

type Tone = { freq: number; at: number; dur: number; type?: OscillatorType };

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
        const now = ctx.currentTime;
        for (const t of tones) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = t.type ?? "sine";
          osc.frequency.value = t.freq;
          gain.gain.setValueAtTime(0.0001, now + t.at);
          gain.gain.exponentialRampToValueAtTime(0.18, now + t.at + 0.02);
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

  return {
    enabled,
    setEnabled,
    correct: () => play([{ freq: 660, at: 0, dur: 0.12 }, { freq: 990, at: 0.1, dur: 0.2 }]),
    wrong: () => play([{ freq: 220, at: 0, dur: 0.25, type: "triangle" }, { freq: 180, at: 0.12, dur: 0.25, type: "triangle" }]),
    finish: () =>
      play([
        { freq: 523, at: 0, dur: 0.15 },
        { freq: 659, at: 0.12, dur: 0.15 },
        { freq: 784, at: 0.24, dur: 0.15 },
        { freq: 1047, at: 0.36, dur: 0.35 },
      ]),
  };
}
