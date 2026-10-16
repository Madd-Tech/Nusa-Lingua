import { Target } from "lucide-react";
import { ProgressRing } from "@/components/gamification/progress-ring";
import { DAILY_XP_GOAL } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export function DailyGoal({ todayXp, goal = DAILY_XP_GOAL }: { todayXp: number; goal?: number }) {
  const done = todayXp >= goal;
  return (
    <div className="flex items-center gap-4 rounded-3xl border-2 bg-card p-4 shadow-soft">
      <ProgressRing value={todayXp} max={goal} label={`XP hari ini ${todayXp} dari target ${goal}`} size={96} stroke={10}>
        <span className="text-xl font-extrabold leading-none">{formatNumber(todayXp)}</span>
        <span className="text-[0.6875rem] font-bold text-muted-foreground">/ {goal} XP</span>
      </ProgressRing>
      <div className="min-w-0">
        <p className="flex items-center gap-1.5 font-extrabold">
          <Target aria-hidden="true" className="size-5 text-[#7A5402] dark:text-secondary" /> Target harian
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {done ? "Target hari ini tercapai. Mantap!" : `${formatNumber(Math.max(0, goal - todayXp))} XP lagi untuk mencapai target.`}
        </p>
      </div>
    </div>
  );
}
