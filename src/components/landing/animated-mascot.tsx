"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MASCOT_POSES = {
  "eyang-nusa": ["melambai-jawa", "melambai-sunda", "melambai-bali", "mengangguk", "tertawa", "bercerita", "merayakan"],
  "mbah-darmo": ["menyapa", "mengetik", "mendengarkan", "menjawab", "berpikir"],
  "teh-euis": ["menyapa", "melambai-jawa", "melambai-sunda", "melambai-bali", "mengangguk", "tertawa", "merayakan"],
  "teh-euis-ai": ["menyapa-sunda", "menyapa-jawa", "menyapa-bali", "mengetik", "mendengarkan", "menjawab", "berpikir"],
} as const;

export type MascotId = keyof typeof MASCOT_POSES;
export type PoseOf<M extends MascotId> = (typeof MASCOT_POSES)[M][number];

type MascotProps = { className?: string; size?: number } & {
  [M in MascotId]: { mascot: M; pose?: PoseOf<M> };
}[MascotId];

const DEFAULT_POSES: Record<MascotId, string> = {
  "eyang-nusa": "melambai-jawa",
  "mbah-darmo": "menyapa",
  "teh-euis": "menyapa",
  "teh-euis-ai": "menyapa-sunda",
};

const svgCache = new Map<string, string>();

export function AnimatedMascot({
  mascot,
  pose,
  className,
  size = 280,
}: MascotProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedPose = pose ?? DEFAULT_POSES[mascot];
  const src = `/media/animasi-maskot/${mascot}/${selectedPose}.svg`;

  useEffect(() => {
    let cancelled = false;

    async function loadSvg() {
      // Check cache first
      const cached = svgCache.get(src);
      if (cached) {
        if (!cancelled) setSvgContent(cached);
        return;
      }

      try {
        const res = await fetch(src);
        if (!res.ok) return;
        let text = await res.text();

        // Make all IDs unique to avoid clashes when multiple mascots are on the page
        const uniqueId = `m${Math.random().toString(36).slice(2, 8)}`;
        text = text.replace(/id="([^"]+)"/g, `id="$1-${uniqueId}"`);
        text = text.replace(/url\(#([^)]+)\)/g, `url(#$1-${uniqueId})`);

        svgCache.set(src, text);
        if (!cancelled) setSvgContent(text);
      } catch {
        // Silently fail
      }
    }

    loadSvg();
    return () => { cancelled = true; };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {svgContent ? (
        <div
          dangerouslySetInnerHTML={{ __html: svgContent }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="[&>svg]:h-full [&>svg]:w-full"
        />
      ) : (
        // Placeholder while loading
        <div
          className="animate-pulse rounded-2xl bg-muted"
          style={{ width: size * 0.6, height: size * 0.8 }}
        />
      )}
    </div>
  );
}
