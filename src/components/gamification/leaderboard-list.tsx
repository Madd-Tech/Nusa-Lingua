import { Crown, Zap } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import type { LeaderboardRow } from "@/lib/queries/leaderboard";
import { cn, formatNumber } from "@/lib/utils";

const MEDAL = ["bg-secondary-600 text-ink", "bg-stone-300 text-ink", "bg-accent-600 text-white"];

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold",
        rank <= 3 ? MEDAL[rank - 1] : "bg-muted text-muted-foreground",
      )}
      aria-label={`Peringkat ${rank}`}
    >
      {rank}
    </span>
  );
}

export function LeaderboardList({
  rows,
  currentUserId,
  startRank = 1,
  regionNames,
  compact,
}: {
  rows: LeaderboardRow[];
  currentUserId: string;
  startRank?: number;
  regionNames?: Map<number, string>;
  compact?: boolean;
}) {
  return (
    <ol className="space-y-2">
      {rows.map((row, i) => {
        const rank = startRank + i;
        const me = row.user_id === currentUserId;
        return (
          <li
            key={row.user_id ?? i}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 bg-card px-3 py-2.5",
              me && "border-primary bg-primary/8",
              compact && "py-2",
            )}
            aria-current={me ? "true" : undefined}
          >
            <RankBadge rank={rank} />
            <UserAvatar name={row.username} src={row.avatar_url} className={compact ? "size-8" : undefined} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">
                {row.username ?? "Pengguna"}
                {me ? <span className="ml-1.5 text-xs font-extrabold text-primary-700 dark:text-primary">(Kamu)</span> : null}
              </p>
              {!compact && row.home_region_id && regionNames?.get(row.home_region_id) ? (
                <p className="truncate text-xs text-muted-foreground">{regionNames.get(row.home_region_id)}</p>
              ) : null}
            </div>
            {rank === 1 ? <Crown aria-hidden="true" className="size-5 fill-secondary text-secondary" /> : null}
            <span className="inline-flex items-center gap-1 text-sm font-extrabold">
              <Zap aria-hidden="true" className="size-4 fill-secondary text-secondary" />
              {formatNumber(row.weekly_xp)} <span className="sr-only">XP minggu ini</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
