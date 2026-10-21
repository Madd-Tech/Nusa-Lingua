import { UserRoundX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

/** Moderator yang belum ditugaskan ke bahasa mana pun. */
export function NoScopeState() {
  return (
    <EmptyState
      illustration={<UserRoundX aria-hidden="true" className="size-20 text-komunitas" />}
      title="Belum ada bahasa yang ditugaskan"
      description="Minta admin menugaskanmu ke bahasa yang kamu kuasai. Setelah itu, usulan dan aktivitas bahasa tersebut muncul di sini."
    />
  );
}
