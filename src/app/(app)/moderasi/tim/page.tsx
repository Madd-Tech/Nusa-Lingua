import type { Metadata } from "next";
import { ShieldX, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UserAvatar } from "@/components/ui/avatar";
import { ModeratorAssignDialog } from "@/components/moderation/moderator-assign-dialog";
import { RevokeModeratorButton } from "@/components/moderation/revoke-moderator-button";
import { getModerationContext } from "@/lib/moderation-context";
import { getModeratorTeam, type TeamMember } from "@/lib/queries/moderation";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = { title: "Tim moderator" };

export default async function TimPage() {
  const { supabase, isAdmin, scope } = await getModerationContext();
  if (!isAdmin) {
    return (
      <EmptyState
        illustration={<ShieldX aria-hidden="true" className="size-20 text-komunitas" />}
        title="Halaman khusus admin"
        description="Hanya admin yang bisa menugaskan moderator."
      />
    );
  }

  // Admin: scope = semua bahasa.
  const team = await getModeratorTeam(supabase);
  const languageName = new Map(scope.map((l) => [l.id, l.name]));

  return (
    <section aria-labelledby="tim-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="tim-heading" className="text-xl">
            Tim moderator
          </h2>
          <p className="text-sm text-muted-foreground">{team.length} moderator · admin otomatis memoderasi semua bahasa.</p>
        </div>
        <ModeratorAssignDialog languages={scope} />
      </div>

      {team.length === 0 ? (
        <EmptyState
          illustration={<UsersRound aria-hidden="true" className="size-20 text-komunitas" />}
          title="Belum ada moderator"
          description="Tambahkan pelajar yang menguasai bahasa daerah tertentu agar usulan bisa ditinjau lebih cepat."
        />
      ) : (
        <ul className="space-y-3">
          {team.map((m) => (
            <MemberRow key={m.id} member={m} languageName={languageName} languages={scope} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MemberRow({
  member,
  languageName,
  languages,
}: {
  member: TeamMember;
  languageName: Map<number, string>;
  languages: { id: number; name: string; code: string }[];
}) {
  const names = member.languageIds.map((id) => languageName.get(id)).filter((n): n is string => !!n).sort((a, b) => a.localeCompare(b, "id"));
  return (
    <li className="flex flex-col gap-3 rounded-2xl border-2 bg-card p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <UserAvatar name={member.username} src={member.avatar_url} />
        <div className="min-w-0">
          <p className="truncate font-extrabold">@{member.username ?? "tanpa-username"}</p>
          <p className="text-xs text-muted-foreground">
            {member.reviews30d} tinjauan dalam 30 hari
            {member.lastReviewAt ? ` · terakhir ${formatRelative(member.lastReviewAt)}` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {names.length ? (
              names.map((n) => (
                <Badge key={n} variant="komunitas">
                  {n}
                </Badge>
              ))
            ) : (
              <Badge variant="muted">Belum ada bahasa</Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2 sm:justify-end">
        <ModeratorAssignDialog languages={languages} member={{ id: member.id, username: member.username, languageIds: member.languageIds }} />
        <RevokeModeratorButton userId={member.id} username={member.username} />
      </div>
    </li>
  );
}
