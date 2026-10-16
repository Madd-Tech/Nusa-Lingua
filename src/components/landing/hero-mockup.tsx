import { Check, Flame, Star, Zap } from "lucide-react";
import { BatikPattern } from "@/components/ui/batik-pattern";

/** Mockup kartu soal (ilustrasi tampilan, bukan data). Dekoratif → aria-hidden. */
export function HeroMockup() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm select-none py-10">
      <div className="relative overflow-hidden rounded-3xl border-2 border-b-[6px] bg-card p-5 shadow-lift">
        <BatikPattern variant="kawung" color="rgb(var(--primary))" opacity={0.05} />
        <div className="relative space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>
            <span className="text-[0.6875rem] font-extrabold uppercase tracking-wide text-muted-foreground">Contoh soal</span>
          </div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-primary-700 dark:text-primary">Pilih arti yang benar</p>
          <p className="text-2xl font-extrabold">“Sugeng enjing”</p>
          <div className="grid gap-2">
            {["Selamat malam", "Selamat pagi", "Terima kasih"].map((o, i) => (
              <div
                key={o}
                className={
                  i === 1
                    ? "flex items-center justify-between rounded-2xl border-2 border-b-4 border-success bg-success/12 px-4 py-2.5 font-bold"
                    : "rounded-2xl border-2 border-b-4 bg-card px-4 py-2.5 font-bold text-muted-foreground"
                }
              >
                {o}
                {i === 1 ? <Check className="size-5 text-success-700 dark:text-success" /> : null}
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-success/12 px-4 py-2 text-sm font-extrabold text-success-700 dark:text-success">Benar! Mantap.</div>
        </div>
      </div>

      <span className="absolute -left-3 top-4 flex animate-float items-center gap-1.5 rounded-2xl border-2 bg-card px-3 py-2 text-sm font-extrabold shadow-lift sm:-left-8">
        <Flame className="size-5 fill-accent text-accent" /> 7 hari
      </span>
      <span className="absolute -right-2 top-20 flex animate-float-slow items-center gap-1.5 rounded-2xl border-2 bg-card px-3 py-2 text-sm font-extrabold shadow-lift [animation-delay:600ms] sm:-right-8">
        <Zap className="size-5 fill-secondary text-secondary" /> +10 XP
      </span>
      <span className="absolute -bottom-1 right-6 flex animate-float items-center gap-0.5 rounded-2xl border-2 bg-card px-3 py-2 shadow-lift [animation-delay:1200ms]">
        {[0, 1, 2].map((i) => (
          <Star key={i} className="size-5 fill-secondary text-secondary" />
        ))}
      </span>
    </div>
  );
}
