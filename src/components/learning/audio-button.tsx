"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Loader2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Tombol putar audio yang jelas (ikon + label untuk pembaca layar).
 * Jika tidak ada audio_url tapi ada `fallbackText`, memakai Web Speech (TTS) bila tersedia.
 */
export function AudioButton({
  src,
  fallbackText,
  label = "Putar audio",
  size = "md",
  className,
  autoPlay,
  rate = 1,
  icon: CustomIcon,
}: {
  src?: string | null;
  fallbackText?: string | null;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  autoPlay?: boolean;
  /** Kecepatan putar, mis. 0.75 untuk versi pelan. */
  rate?: number;
  icon?: import("lucide-react").LucideIcon;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "error">("idle");

  // Dicek setelah mount agar render server & client sama (hindari hydration mismatch).
  const [canTts, setCanTts] = useState(false);
  useEffect(() => setCanTts("speechSynthesis" in window && !!fallbackText), [fallbackText]);
  const disabled = !src && !canTts;

  const play = async () => {
    if (src) {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio(src);
          audioRef.current.onended = () => setState("idle");
          audioRef.current.onerror = () => setState("error");
        }
        setState("loading");
        audioRef.current.currentTime = 0;
        audioRef.current.playbackRate = rate;
        await audioRef.current.play();
        setState("playing");
      } catch {
        setState("error");
      }
      return;
    }
    if (canTts && fallbackText) {
      const u = new SpeechSynthesisUtterance(fallbackText);
      u.lang = "id-ID";
      u.rate = 0.85 * rate;
      u.onend = () => setState("idle");
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
      setState("playing");
    }
  };

  useEffect(() => {
    if (autoPlay && src) void play();
    return () => {
      audioRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const dims = { sm: "size-9 [&_svg]:size-4", md: "size-12 [&_svg]:size-6", lg: "size-20 [&_svg]:size-9" }[size];
  const Icon = state === "loading" ? Loader2 : state === "error" ? VolumeX : CustomIcon ?? Volume2;

  return (
    <button
      type="button"
      onClick={play}
      disabled={disabled}
      aria-label={disabled ? `${label} (audio tidak tersedia)` : state === "error" ? `${label} — gagal memutar, coba lagi` : label}
      title={disabled ? "Audio tidak tersedia" : label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl border-b-4 border-asisten-deep bg-asisten-solid text-white transition-[filter]",
        "hover:brightness-110 active:border-b-0 active:border-t-4 active:border-t-transparent bg-clip-padding",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-muted disabled:text-muted-foreground",
        state === "playing" && "ring-4 ring-asisten/30",
        dims,
        className,
      )}
    >
      <Icon aria-hidden="true" className={cn(state === "loading" && "animate-spin")} />
    </button>
  );
}
