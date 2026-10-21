import Link from "next/link";
import { Activity, Check, UserMinus, UserPlus, X, type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/ui/avatar";
import type { LogEntry } from "@/lib/queries/moderation";
import { MODERATION_ACTION_LABEL, REJECT_REASON_LABEL } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn, formatDate, formatRelative } from "@/lib/utils";

const ACTION_ICON: Partial<Record<Enums<"moderation_action">, { icon: LucideIcon; tone: string }>> = {
  submission_approved: { icon: Check, tone: "bg-success/12 text-success-700 dark:text-success" },
  submission_rejected: { icon: X, tone: "bg-danger/10 text-danger-700 dark:text-danger" },
  moderator_assigned: { icon: UserPlus, tone: "bg-komunitas/10 text-komunitas" },
  moderator_removed: { icon: UserMinus, tone: "bg-komunitas/10 text-komunitas" },
};

/**
 * Daftar riwayat moderasi: "@budi menyetujui usulan “Kucing” · Bahasa Jawa · 2 jam lalu".
 * `actorHref` membuat nama aktor menjadi tautan filter riwayat.
 */
export function ActivityList({
  entries,
  actorHref,
  languageNames,
}: {
  entries: LogEntry[];
  actorHref: (actorId: string) => string;
  /** Nama bahasa per id, untuk entri penugasan moderator. */
  languageNames: Map<number, string>;
}) {
  return (
    <ul className="divide-y-2 rounded-2xl border-2 bg-card">
      {entries.map((e) => {
        const { icon: Icon, tone } = ACTION_ICON[e.action] ?? { icon: Activity, tone: "bg-muted text-muted-foreground" };
        const d = e.detail;
        const languages = (d.language_ids ?? []).map((id) => languageNames.get(id) ?? `#${id}`).join(", ");
        return (
          <li key={e.id} className="flex gap-3 p-3 sm:p-4">
            <UserAvatar name={e.actor?.username} src={e.actor?.avatar_url} className="size-9 shrink-0" />
            <div className="min-w-0 flex-1 text-sm">
              <p className="break-words">
                {e.actor_id && e.actor?.username ? (
                  <Link href={actorHref(e.actor_id)} className="font-bold hover:underline">
                    @{e.actor.username}
                  </Link>
                ) : (
                  <span className="font-bold">Sistem</span>
                )}{" "}
                {MODERATION_ACTION_LABEL[e.action]}{" "}
                {e.target_type === "moderator" ? (
                  <>
                    <span className="font-bold">@{e.targetUsername ?? "pengguna"}</span>
                    {languages ? (e.action === "moderator_removed" ? ` dari ${languages}` : ` ke ${languages}`) : null}
                  </>
                ) : d.word ? (
                  e.action === "submission_approved" && e.language?.code ? (
                    <Link href={`/kamus/${e.language.code}?q=${encodeURIComponent(d.word)}`} className="font-bold hover:underline">
                      “{d.word}”
                    </Link>
                  ) : (
                    <span className="font-bold">“{d.word}”</span>
                  )
                ) : null}
                {d.edited ? <span className="text-muted-foreground"> (dengan perubahan)</span> : null}
                {d.reason ? <span className="text-muted-foreground"> · {REJECT_REASON_LABEL[d.reason]}</span> : null}
              </p>
              {d.note ? <p className="mt-0.5 break-words italic text-muted-foreground">“{d.note}”</p> : null}
              <p className="mt-1 text-xs text-muted-foreground">
                {e.language?.name ? `${e.language.name} · ` : null}
                <time dateTime={e.created_at} title={formatDate(e.created_at, { dateStyle: "medium", timeStyle: "short" })}>
                  {formatRelative(e.created_at)}
                </time>
              </p>
            </div>
            <span aria-hidden="true" className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", tone)}>
              <Icon className="size-4" />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
