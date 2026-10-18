"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate } from "@/lib/utils";

export type SessionListItem = {
  id: string;
  title: string | null;
  created_at: string;
  persona: { name: string; avatar_url: string | null } | null;
};

/** Riwayat sesi obrolan milik user, dengan hapus sesi (konfirmasi). */
export function SessionList({
  sessions,
  activeId,
  onNavigate,
}: {
  sessions: SessionListItem[];
  activeId?: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [target, setTarget] = useState<SessionListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const remove = async () => {
    if (!target) return;
    setDeleting(true);
    const { error } = await createClient().from("chat_sessions").delete().eq("id", target.id);
    setDeleting(false);
    if (error) {
      toast.error("Sesi gagal dihapus. Coba lagi.");
      return;
    }
    toast.success("Sesi obrolan dihapus");
    const wasActive = target.id === activeId;
    setTarget(null);
    if (wasActive) router.push("/asisten");
    router.refresh();
  };

  if (!sessions.length) {
    return (
      <p className="rounded-2xl border-2 border-dashed p-5 text-center text-sm text-muted-foreground">
        Belum ada obrolan. Pilih persona untuk mulai.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {sessions.map((s) => {
          const active = s.id === activeId;
          const title = s.title ?? `Obrolan dengan ${s.persona?.name ?? "asisten"}`;
          return (
            <li
              key={s.id}
              className={cn(
                "group flex items-center gap-2 rounded-2xl border-2 bg-card p-2 pr-1 transition-colors",
                active ? "border-asisten bg-asisten/8" : "hover:bg-muted",
              )}
            >
              <Link
                href={`/asisten/${s.id}`}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PersonaAvatar name={s.persona?.name} src={s.persona?.avatar_url} className="size-10 rounded-xl" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{title}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {s.persona?.name ?? "Asisten"} · {formatDate(s.created_at)}
                  </span>
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTarget(s)}
                aria-label={`Hapus sesi ${title}`}
                className="shrink-0 text-muted-foreground hover:text-danger"
              >
                <Trash2 />
              </Button>
            </li>
          );
        })}
      </ul>

      <Dialog open={!!target} onOpenChange={(o) => !o && setTarget(null)}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Hapus sesi obrolan?</DialogTitle>
            <DialogDescription>Semua pesan dalam sesi ini akan dihapus dan tidak bisa dikembalikan.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTarget(null)} disabled={deleting}>
              Batal
            </Button>
            <Button variant="destructive" onClick={remove} disabled={deleting}>
              {deleting ? "Menghapus…" : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
