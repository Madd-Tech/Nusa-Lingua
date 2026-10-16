import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Aksen motif batik sebagai pattern SVG tipis.
 *  - kawung: empat elips mengelilingi titik pusat (motif buah aren)
 *  - parang: lereng diagonal berulang
 *
 * Warna & intensitas bisa diatur lewat prop `color` + `opacity`,
 * atau lewat className (mis. "text-primary opacity-[0.07]") — warna default `currentColor`.
 */
export function BatikPattern({
  variant = "kawung",
  className,
  size = 48,
  color,
  opacity,
}: {
  variant?: "kawung" | "parang";
  className?: string;
  size?: number;
  /** Warna CSS apa pun, mis. "#1F8A4C" atau "rgb(var(--c-budaya))". */
  color?: string;
  /** 0–1. Disarankan 0.04–0.12 agar tidak ramai. */
  opacity?: number;
}) {
  const id = useId().replace(/:/g, "");
  const patternId = `batik-${variant}-${id}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      style={{ ...(color ? { color } : {}), ...(opacity !== undefined ? { opacity } : {}) }}
    >
      <defs>
        {variant === "kawung" ? (
          <pattern id={patternId} width={size} height={size} patternUnits="userSpaceOnUse" viewBox="0 0 48 48">
            <g fill="none" stroke="currentColor" strokeWidth="1.6">
              <ellipse cx="24" cy="11" rx="6.5" ry="10" />
              <ellipse cx="24" cy="37" rx="6.5" ry="10" />
              <ellipse cx="11" cy="24" rx="10" ry="6.5" />
              <ellipse cx="37" cy="24" rx="10" ry="6.5" />
            </g>
            <circle cx="24" cy="24" r="2" fill="currentColor" />
            <circle cx="0" cy="0" r="2.4" fill="currentColor" />
            <circle cx="48" cy="0" r="2.4" fill="currentColor" />
            <circle cx="0" cy="48" r="2.4" fill="currentColor" />
            <circle cx="48" cy="48" r="2.4" fill="currentColor" />
          </pattern>
        ) : (
          <pattern
            id={patternId}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
            viewBox="0 0 48 48"
            patternTransform="rotate(-45)"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M0 12 C 8 4, 16 4, 24 12 S 40 20, 48 12" />
              <path d="M0 36 C 8 28, 16 28, 24 36 S 40 44, 48 36" />
              <path d="M0 24 H48" strokeWidth="0.8" strokeDasharray="2 5" />
            </g>
            <circle cx="12" cy="12" r="1.6" fill="currentColor" />
            <circle cx="36" cy="36" r="1.6" fill="currentColor" />
          </pattern>
        )}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
