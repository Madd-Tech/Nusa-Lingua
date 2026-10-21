"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserMinus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { moderationErrorMessage } from "@/lib/moderation-errors";

/** Cabut status moderator (semua bahasa dilepas, role kembali menjadi pelajar). */
export function RevokeModeratorButton({ userId, username }: { userId: string; username: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const revoke = async () => {
    setSaving(true);
    const { error } = await createClient().rpc("set_moderator_languages", { p_user: userId, p_language_ids: [] });
    setSaving(false);
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal mencabut moderator. Coba lagi."));
      return;
    }
    toast.success(`@${username} bukan moderator lagi`);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} aria-label={`Cabut moderator @${username}`}>
        <UserMinus aria-hidden="true" /> Cabut
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Cabut @{username} dari moderator?</DialogTitle>
            <DialogDescription>
              Semua penugasan bahasanya dilepas dan perannya kembali menjadi pelajar. Riwayat tinjauannya tetap tersimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button variant="destructive" onClick={revoke} disabled={saving}>
              {saving ? "Mencabut…" : "Cabut moderator"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
