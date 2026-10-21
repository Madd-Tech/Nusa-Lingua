"use client";

import { AnimatedMascot } from "@/components/landing/animated-mascot";
import { RemoteImage } from "@/components/ui/remote-image";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { useLearningMascot } from "@/hooks/use-learning-mascot";
import { LEARNING_MASCOTS } from "@/lib/learning-mascots";
import { cn } from "@/lib/utils";

/**
 * Kartu maskot pendamping di halaman jalur belajar.
 * Sapaan menyesuaikan progres supaya terasa seperti teman belajar.
 * Pengguna juga bisa memilih maskot lain; pilihannya dipakai di sesi lesson.
 */
export function PathMascot({
  code,
  languageName,
  completed,
  total,
}: {
  code: string;
  languageName: string;
  completed: number;
  total: number;
}) {
  const { mascot, choose, isCustom } = useLearningMascot(code);

  const line =
    total === 0
      ? `Materi ${languageName} sedang disiapkan. Sambil menunggu, intip kamusnya, yuk!`
      : completed >= total
        ? `Semua lesson ${languageName} sudah selesai! Luar biasa, ulangi kapan saja biar makin kuat.`
        : completed === 0
          ? `Ayo mulai lesson pertama ${languageName}! Aku temani sampai selesai.`
          : `${completed} dari ${total} lesson selesai. Sedikit lagi, lanjutkan perjalananmu!`;

  return (
    <section
      aria-label={`Teman belajar: ${mascot.name}`}
      className="relative mb-6 overflow-hidden rounded-3xl border-2 border-b-4 bg-card p-4 sm:p-5"
    >
      <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.06} />
      <div className="relative flex items-center gap-3 sm:gap-5">
        <AnimatedMascot
          mascot={mascot.id}
          pose={mascot.poses.greeting}
          className="size-24 shrink-0 sm:size-32"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary-700 dark:text-primary">
            Teman belajarmu
          </p>
          <h2 className="text-xl sm:text-2xl">{mascot.name}</h2>
          <p className="text-xs font-semibold text-muted-foreground">{mascot.region}</p>
          <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">{mascot.tagline}</p>
          <p className="mt-2 rounded-2xl rounded-bl-sm bg-primary/8 px-3 py-2 text-sm font-bold leading-snug">
            {line}
          </p>
        </div>
      </div>

      <details className="relative mt-3">
        <summary className="cursor-pointer list-none select-none text-xs font-extrabold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
          {isCustom ? `Ganti teman belajar (${mascot.name})` : "Pilih teman belajar lain"}
        </summary>
        <ul className="-mx-1 mt-2 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:thin]">
          {LEARNING_MASCOTS.map((item) => {
            const active = item.id === mascot.id;
            return (
              <li key={item.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => choose(item)}
                  aria-pressed={active}
                  title={`${item.name} · ${item.region}`}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border-2 py-0.5 pl-0.5 pr-2.5 text-xs font-bold transition-colors",
                    active
                      ? "border-primary bg-primary/10 text-primary-700 dark:text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <RemoteImage src={item.avatar} alt="" className="size-6 rounded-full bg-muted object-contain" />
                  {item.name}
                </button>
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
