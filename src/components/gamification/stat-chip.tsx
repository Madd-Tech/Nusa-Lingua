import { Flame, Heart, Zap } from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";

type ChipProps = { value: number; className?: string };

/** Streak (Flame, terakota). `activeToday=false` → ikon pudar + keterangan untuk pembaca layar. */
export function StreakChip({ value, activeToday = true, className }: ChipProps & { activeToday?: boolean }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold", className)}
      title={activeToday ? `Streak ${value} hari` : `Streak ${value} hari — belum belajar hari ini`}
    >
      <Flame
        aria-hidden="true"
        className={cn("size-5", activeToday ? "fill-accent text-accent" : "text-muted-foreground")}
      />
      <span className={cn(!activeToday && "text-muted-foreground")}>{formatNumber(value)}</span>
      <span className="sr-only">
        hari streak{activeToday ? "" : ", belum belajar hari ini"}
      </span>
    </span>
  );
}

export function XpChip({ value, className }: ChipProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold", className)}
      title={`${value} XP`}
    >
      <Zap aria-hidden="true" className="size-5 fill-secondary text-secondary" />
      {formatNumber(value)}
      <span className="sr-only">XP</span>
    </span>
  );
}

export function HeartsChip({ value, className }: ChipProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-xl px-2 py-1 text-sm font-extrabold", className)}
      title={`${value} nyawa`}
    >
      <Heart aria-hidden="true" className={cn("size-5", value > 0 ? "fill-danger text-danger" : "text-muted-foreground")} />
      {value}
      <span className="sr-only">nyawa</span>
    </span>
  );
}
