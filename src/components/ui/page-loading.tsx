import { cookies } from "next/headers";
import { AnimatedMascot } from "@/components/landing/animated-mascot";
import { LoadingRegion } from "@/components/ui/skeleton";
import { ACTIVE_LANGUAGE_COOKIE } from "@/lib/active-language";
import { getLearningMascot } from "@/lib/learning-mascots";
import { cn } from "@/lib/utils";

/**
 * Tampilan loading standar untuk halaman di dalam `(app)`.
 *
 * Maskot mengikuti bahasa aktif (cookie `nl_active_lang`) supaya loading terasa
 * personal: jalur Jawa menampilkan Mbah Darmo, Sunda menampilkan Teh Euis, dst.
 * SVG-nya di-inline oleh `AnimatedMascot`, jadi animasi CSS di dalam file tetap
 * berjalan, transparan di dark mode, dan ikut aturan `prefers-reduced-motion`
 * global di `globals.css`.
 */
export async function PageLoading({
  label = "Memuat…",
  pose,
  className,
}: {
  label?: string;
  pose?: string;
  className?: string;
}) {
  const code = cookies().get(ACTIVE_LANGUAGE_COOKIE)?.value;
  const mascot = getLearningMascot(code);

  return (
    <LoadingRegion
      label={label}
      className={cn("flex min-h-[60vh] flex-col items-center justify-center gap-6 py-16 text-center", className)}
    >
      <AnimatedMascot mascot={mascot.id} pose={pose ?? mascot.poses.thinking} className="size-40 sm:size-56" />
      <div className="space-y-3">
        <p aria-hidden="true" className="text-base font-bold text-foreground">
          {label}
        </p>
        <span aria-hidden="true" className="flex items-center justify-center gap-1.5">
          {[0, 160, 320].map((delay) => (
            <span
              key={delay}
              className="size-2 animate-pulse rounded-full bg-primary/60"
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </span>
      </div>
    </LoadingRegion>
  );
}
