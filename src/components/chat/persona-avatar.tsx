import { Bot } from "lucide-react";
import { RemoteImage } from "@/components/ui/remote-image";
import { getPersonaMascot } from "@/lib/persona-mascots";
import { cn } from "@/lib/utils";

/** "Nek Aminah" → "NA", "Daeng Baso" → "DB". */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

/**
 * Avatar persona. `src` dari DB (ai_personas.avatar_url); bila kosong, fallback ke
 * aset maskot statis sesuai nama persona (Mbah Darmo / Teh Euis), lalu ke inisial nama
 * untuk persona yang belum punya maskot.
 */
export function PersonaAvatar({ name, src, className }: { name?: string | null; src?: string | null; className?: string }) {
  const resolved = src ?? getPersonaMascot(name)?.avatar ?? null;
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-asisten-solid text-white",
        className,
      )}
    >
      {resolved ? (
        <RemoteImage src={resolved} alt="" className="h-full w-full" />
      ) : name ? (
        /* SVG agar ukuran huruf ikut skala avatar (size-8 s.d. size-16) */
        <svg viewBox="0 0 40 40" aria-hidden="true" className="h-full w-full">
          <text x="20" y="21" textAnchor="middle" dominantBaseline="middle" fontSize="15" fontWeight="800" fill="currentColor">
            {initials(name)}
          </text>
        </svg>
      ) : (
        <Bot aria-hidden="true" className="size-1/2" />
      )}
    </span>
  );
}
