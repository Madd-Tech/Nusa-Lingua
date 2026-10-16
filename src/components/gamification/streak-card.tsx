import { Check, Flame } from "lucide-react";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { cn, formatNumber } from "@/lib/utils";

const DAY = new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "UTC" });

/** Kartu streak + kalender 7 hari (hari dengan XP > 0 ditandai centang). */
export function StreakCard({
  current,
  longest,
  week,
  activeToday,
}: {
  current: number;
  longest: number;
  week: { date: string; xp: number }[];
  activeToday: boolean;
}) {
  return (
    <section aria-labelledby="streak-heading" className="relative overflow-hidden rounded-3xl border-2 border-accent/30 bg-card p-5 shadow-soft">
      <BatikPattern variant="parang" color="rgb(var(--accent))" opacity={0.05} />
      <div className="relative flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-accent/12">
          <Flame aria-hidden="true" className={cn("size-9", activeToday ? "fill-accent text-accent" : "text-accent")} />
        </span>
        <div className="flex-1">
          <h2 id="streak-heading" className="text-2xl leading-tight">
            {formatNumber(current)} hari streak
          </h2>
          <p className="text-sm text-muted-foreground">
            Terpanjang: {formatNumber(longest)} hari · {activeToday ? "Hari ini sudah aman" : "Belajar hari ini agar streak tetap menyala"}
          </p>
        </div>
      </div>
      <ol className="relative mt-4 grid grid-cols-7 gap-1.5" aria-label="Aktivitas 7 hari terakhir">
        {week.map((d, i) => {
          const done = d.xp > 0;
          const isToday = i === week.length - 1;
          const label = DAY.format(new Date(`${d.date}T12:00:00Z`));
          return (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span className={cn("text-[0.6875rem] font-bold", isToday ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full border-2",
                  done ? "border-accent-700 bg-accent-600 text-white" : "border-dashed bg-muted",
                  isToday && !done && "border-accent",
                )}
              >
                {done ? <Check aria-hidden="true" className="size-4" strokeWidth={3} /> : null}
              </span>
              <span className="sr-only">
                {label}: {done ? `${d.xp} XP` : "tidak ada aktivitas"}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
