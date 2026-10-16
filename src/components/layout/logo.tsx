import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("size-9", className)}>
      <rect width="40" height="40" rx="12" className="fill-primary-600" />
      {/* motif kawung mini */}
      <g className="fill-white/90">
        <ellipse cx="20" cy="11.5" rx="4.2" ry="6.5" />
        <ellipse cx="20" cy="28.5" rx="4.2" ry="6.5" />
        <ellipse cx="11.5" cy="20" rx="6.5" ry="4.2" />
        <ellipse cx="28.5" cy="20" rx="6.5" ry="4.2" />
      </g>
      <circle cx="20" cy="20" r="3" className="fill-secondary" />
    </svg>
  );
}

export function Logo({ href = "/", className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2.5 rounded-xl font-extrabold tracking-tight", className)}
      aria-label="Nusa Lingua — halaman utama"
    >
      <LogoMark />
      {!compact && (
        <span className="text-xl leading-none">
          Nusa<span className="text-primary">Lingua</span>
        </span>
      )}
    </Link>
  );
}
