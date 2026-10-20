"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getLearningMascot,
  LEARNING_MASCOTS,
  type LearningMascotProfile,
} from "@/lib/learning-mascots";

const EVENT = "nl-mascot-change";

function storageKey(code?: string | null) {
  return `nl_mascot_${(code ?? "").trim().toLowerCase() || "default"}`;
}

/**
 * Teman belajar yang dipilih pengguna untuk satu bahasa.
 *
 * Default-nya maskot yang dipetakan ke bahasa tersebut. Pengguna bisa
 * menggantinya (mis. ingin ditemani Kak Sitti saat belajar bahasa Jawa);
 * pilihan disimpan di localStorage dan disinkronkan antar komponen.
 */
export function useLearningMascot(code?: string | null) {
  const fallback = useMemo(() => getLearningMascot(code), [code]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const key = storageKey(code);
    const sync = () => {
      try {
        setSelectedId(localStorage.getItem(key));
      } catch {
        setSelectedId(null);
      }
    };
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [code]);

  const mascot = useMemo(
    () => (selectedId ? (LEARNING_MASCOTS.find((m) => m.id === selectedId) ?? fallback) : fallback),
    [fallback, selectedId],
  );

  const choose = useCallback(
    (next: LearningMascotProfile) => {
      try {
        localStorage.setItem(storageKey(code), next.id);
      } catch {
        /* localStorage tidak tersedia — tetap pakai state di memori */
      }
      setSelectedId(next.id);
      window.dispatchEvent(new Event(EVENT));
    },
    [code],
  );

  return { mascot, choose, isCustom: mascot.id !== fallback.id };
}
