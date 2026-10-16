import { MAX_STRENGTH, strengthLabel } from "@/lib/srs";
import { cn } from "@/lib/utils";

/** Indikator penguasaan 0–5 titik. null = belum pernah dipelajari. */
export function StrengthDots({ value, className }: { value: number | null; className?: string }) {
  const v = value ?? 0;
  const label = value === null ? "Belum dipelajari" : `Penguasaan ${v} dari ${MAX_STRENGTH} (${strengthLabel(v)})`;
  return (
    <span role="img" aria-label={label} title={label} className={cn("inline-flex items-center gap-0.5", className)}>
      {Array.from({ length: MAX_STRENGTH }).map((_, i) => (
        <span
          key={i}
          className={cn("size-2 rounded-full", i < v ? "bg-primary" : "border border-muted-foreground/40 bg-transparent")}
        />
      ))}
    </span>
  );
}
