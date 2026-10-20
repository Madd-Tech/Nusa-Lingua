"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { resolvePose, type MascotId } from "@/lib/mascot-poses";


export type { MascotId, PoseOf } from "@/lib/mascot-poses";

type MascotProps = {
  mascot: MascotId;  
  pose?: string;
  className?: string;
  size?: number;
};

const svgCache = new Map<string, string>();

export function AnimatedMascot({ mascot, pose, className, size }: MascotProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedPose = resolvePose(mascot, pose);
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
      className={cn("relative inline-flex size-40 items-center justify-center", className)}
      style={size ? { width: size, height: size } : undefined}
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
          style={size ? { width: size * 0.6, height: size * 0.8 } : { width: "60%", height: "80%" }}
        />
      )}
    </div>
  );
}
