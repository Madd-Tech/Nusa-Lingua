import { Crown, Medal, Zap } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import type { LeaderboardRow } from "@/lib/queries/leaderboard";
import { cn, formatNumber } from "@/lib/utils";

const PLACES = [
  { rank: 1, medal: "Emas", height: "h-32", tone: "bg-secondary-600 border-secondary-700 text-ink", ring: "ring-secondary", medalColor: "text-secondary" },
  { rank: 2, medal: "Perak", height: "h-24", tone: "bg-stone-300 border-stone-400 text-ink", ring: "ring-stone-300", medalColor: "text-stone-400" },
  { rank: 3, medal: "Perunggu", height: "h-20", tone: "bg-accent-600 border-accent-700 text-white", ring: "ring-accent", medalColor: "text-accent" },
];

/** Podium 3 besar. Urutan DOM 1–2–3 (pembaca layar), urutan visual 2–1–3. */
export function Podium({ rows, currentUserId }: { rows: LeaderboardRow[]; currentUserId: string }) {
  const top = rows.slice(0, 3);
  if (top.length < 3) return null;
  return (
    <ol className="mb-8 grid grid-cols-3 items-end gap-2 sm:gap-4" aria-label="Tiga besar minggu ini">
      {PLACES.map((p, i) => {
        const row = top[i];
        const me = row.user_id === currentUserId;
        return (
          <li key={p.rank} className="flex min-w-0 flex-col items-center text-center" style={{ order: p.rank === 1 ? 2 : p.rank === 2 ? 1 : 3 }}>
            {p.rank === 1 ? <Crown aria-hidden="true" className="mb-1 size-7 fill-secondary text-secondary" /> : null}
            <UserAvatar
              name={row.username}
              src={row.avatar_url}
              className={cn(p.rank === 1 ? "size-20" : "size-14", "border-4 ring-4", p.ring)}
            />
            <p className={cn("mt-2 w-full truncate text-sm font-extrabold", me && "text-primary-700 dark:text-primary")}>
              {row.username ?? "Pengguna"}
              {me ? " (Kamu)" : ""}
            </p>
            <p className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
              <Zap aria-hidden="true" className="size-3.5 fill-secondary text-secondary" /> {formatNumber(row.weekly_xp)} XP
            </p>
            <div className={cn("mt-2 flex w-full flex-col items-center justify-start gap-1 rounded-t-2xl border-b-4 pt-2", p.height, p.tone)}>
              <Medal aria-hidden="true" className="size-6" />
              <span className="text-xl font-extrabold">{p.rank}</span>
              <span className="sr-only">Peringkat {p.rank}, medali {p.medal}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
