import { cn } from "@/lib/utils";

/** Ilustrasi flat sederhana (inline SVG) — dekoratif, aria-hidden. */

type IlloProps = { className?: string };

export function IlloEmptyBox({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="106" rx="56" ry="8" className="fill-muted" />
      <path d="M36 52 80 36l44 16v44L80 112 36 96Z" className="fill-secondary/40" />
      <path d="M80 68v44l44-16V52Z" className="fill-secondary/70" />
      <path d="M36 52 80 68l44-16-44-16Z" className="fill-secondary/25" />
      <path d="M36 52 22 70l44 16 14-18Z" className="fill-secondary" />
      <path d="M124 52l14 18-44 16-14-18Z" className="fill-secondary/85" />
      <circle cx="58" cy="22" r="5" className="fill-primary/60" />
      <circle cx="108" cy="16" r="3.5" className="fill-accent/60" />
      <path d="M92 26c4-6 10-6 14 0" strokeWidth="3" strokeLinecap="round" fill="none" className="stroke-primary/60" />
    </svg>
  );
}

export function IlloBook({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="108" rx="58" ry="7" className="fill-muted" />
      <path d="M22 30c20-6 40-4 58 8v64c-18-12-38-14-58-8Z" className="fill-budaya/25" />
      <path d="M138 30c-20-6-40-4-58 8v64c18-12 38-14 58-8Z" className="fill-budaya/45" />
      <path d="M80 38v64" strokeWidth="3" className="stroke-budaya" />
      <path d="M34 46c12-2 24 0 34 6M34 58c12-2 24 0 34 6M34 70c12-2 24 0 34 6" strokeWidth="3" strokeLinecap="round" className="stroke-budaya/50" fill="none" />
      <circle cx="112" cy="58" r="12" className="fill-secondary/80" />
      <path d="M112 50v16M104 58h16" strokeWidth="3" strokeLinecap="round" className="stroke-card" />
    </svg>
  );
}

export function IlloChat({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="108" rx="56" ry="7" className="fill-muted" />
      <rect x="18" y="20" width="84" height="54" rx="18" className="fill-asisten/80" />
      <path d="M38 74 34 92l20-18Z" className="fill-asisten/80" />
      <rect x="62" y="48" width="80" height="46" rx="18" className="fill-secondary/80" />
      <path d="M124 94l6 14-20-14Z" className="fill-secondary/80" />
      <circle cx="44" cy="47" r="5" className="fill-card" />
      <circle cx="60" cy="47" r="5" className="fill-card" />
      <circle cx="76" cy="47" r="5" className="fill-card" />
      <path d="M82 70h40M82 80h26" strokeWidth="5" strokeLinecap="round" className="stroke-ink/40" />
    </svg>
  );
}

export function IlloTrophy({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="110" rx="50" ry="7" className="fill-muted" />
      <path d="M52 18h56v26c0 16-12 28-28 28S52 60 52 44Z" className="fill-secondary" />
      <path d="M52 26H36c0 16 8 24 18 24M108 26h16c0 16-8 24-18 24" strokeWidth="6" fill="none" className="stroke-secondary/70" />
      <rect x="72" y="70" width="16" height="16" className="fill-secondary/80" />
      <rect x="56" y="86" width="48" height="16" rx="6" className="fill-accent/80" />
      <path d="m80 30 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1Z" className="fill-card" />
    </svg>
  );
}

export function IlloCheck({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="108" rx="48" ry="7" className="fill-muted" />
      <circle cx="80" cy="56" r="40" className="fill-primary/20" />
      <circle cx="80" cy="56" r="30" className="fill-primary" />
      <path d="m66 56 10 10 20-22" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" className="stroke-white" />
      <circle cx="128" cy="24" r="5" className="fill-secondary" />
      <circle cx="30" cy="34" r="4" className="fill-accent/70" />
    </svg>
  );
}

export function IlloOops({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={cn("h-28 w-auto", className)}>
      <ellipse cx="80" cy="108" rx="50" ry="7" className="fill-muted" />
      <path d="M80 14 136 98H24Z" className="fill-accent/25" />
      <path d="M80 28 122 92H38Z" className="fill-accent/80" />
      <rect x="75" y="46" width="10" height="26" rx="5" className="fill-card" />
      <circle cx="80" cy="82" r="5.5" className="fill-card" />
    </svg>
  );
}

/** Ilustrasi hero landing: kepulauan + gelembung salam berbagai bahasa. */
export function IlloArchipelago({ className }: IlloProps) {
  return (
    <svg viewBox="0 0 520 420" aria-hidden="true" className={cn("h-auto w-full", className)}>
      <defs>
        <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="rgb(var(--c-asisten))" stopOpacity="0.18" />
          <stop offset="1" stopColor="rgb(var(--c-asisten))" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="10" y="40" width="500" height="360" rx="48" fill="url(#sea)" />
      {/* pulau */}
      <path d="M48 250c22-18 60-22 92-12 26 8 40 30 26 42-22 18-78 20-110 4-18-9-22-24-8-34Z" className="fill-primary/80" />
      <path d="M170 300c30-14 92-14 132-2 22 7 18 22-6 28-40 10-100 8-128-6-12-6-10-15 2-20Z" className="fill-primary/70" />
      <path d="M318 312c14-8 34-8 46 0 8 6 4 14-8 16-14 3-32 1-40-4-6-4-4-9 2-12Z" className="fill-primary/60" />
      <path d="M300 200c18-30 56-38 78-22 16 12 6 30-6 42-14 14-10 34-30 36-22 2-30-18-38-30-6-10-8-18-4-26Z" className="fill-primary/75" />
      <path d="M400 268c30-12 72-6 88 12 8 10-4 22-24 22-28 0-56-4-68-14-6-6-4-16 4-20Z" className="fill-primary/65" />
      {/* gunung kecil */}
      <path d="M92 246 108 222l16 24Z" className="fill-primary-700/70" />
      <path d="M330 214l12-20 12 20Z" className="fill-primary-700/70" />
      {/* matahari */}
      <circle cx="440" cy="96" r="26" className="fill-secondary" />
      {/* gelembung salam */}
      <g className="font-sans" fontWeight="800" fontSize="17">
        <g transform="translate(36 120)">
          <rect width="150" height="46" rx="18" className="fill-card stroke-border" strokeWidth="2" />
          <path d="M40 46l-6 14 20-14Z" className="fill-card" />
          <text x="18" y="29" className="fill-ink">Sugeng enjing!</text>
        </g>
        <g transform="translate(190 64)">
          <rect width="170" height="46" rx="18" className="fill-budaya" />
          <path d="M70 46l-4 16 18-16Z" className="fill-budaya" />
          <text x="18" y="29" fill="#fff">Wilujeng énjing!</text>
        </g>
        <g transform="translate(330 160)">
          <rect width="110" height="46" rx="18" className="fill-accent" />
          <path d="M30 46l-6 14 18-14Z" className="fill-accent" />
          <text x="22" y="29" fill="#fff">Horas!</text>
        </g>
        <g transform="translate(196 352)">
          <rect width="170" height="46" rx="18" className="fill-secondary" />
          <path d="M60 0l-4-14 18 14Z" className="fill-secondary" />
          <text x="16" y="29" fill="#1C1917">Om swastiastu</text>
        </g>
      </g>
      {/* aksen */}
      <circle cx="470" cy="360" r="6" className="fill-accent/60" />
      <circle cx="60" cy="370" r="8" className="fill-secondary/70" />
    </svg>
  );
}
