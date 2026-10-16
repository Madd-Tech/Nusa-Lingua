import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Bintang 0–3. Jumlah dibacakan sebagai teks (tidak hanya mengandalkan warna). */
export function Stars({ value, max = 3, className, size = "size-4" }: { value: number; max?: number; className?: string; size?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value} dari ${max} bintang`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(size, i < value ? "fill-secondary text-secondary" : "fill-muted text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}
