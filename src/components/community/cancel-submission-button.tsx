"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";

const AUDIO_PUBLIC_PREFIX = "/object/public/audio/";

/** Batalkan usulan yang masih menunggu (RLS hanya mengizinkan milik sendiri & status pending). */
export function CancelSubmissionButton({ id, word, audioUrl }: { id: number; word: string; audioUrl: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const cancel = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { data, error } = await supabase.from("vocab_submissions").delete().eq("id", id).select("id");
    if (error || !data?.length) {
      setDeleting(false);
      toast.error("Usulan tidak bisa dibatalkan. Mungkin sudah ditinjau moderator.");
      router.refresh();
      return;
    }
    // Rekaman ikut dihapus; kegagalan di sini tidak menggagalkan pembatalan.
    const path = audioUrl?.split(AUDIO_PUBLIC_PREFIX)[1];
    if (path) await supabase.storage.from("audio").remove([decodeURIComponent(path)]);
    setDeleting(false);
    setOpen(false);
    toast.success(`Usulan “${word}” dibatalkan`);
    router.refresh();
  };

  return (
    <>
      <Button size="sm" variant="ghost" onClick={() => setOpen(true)} aria-label={`Batalkan usulan ${word}`}>
        <Trash2 aria-hidden="true" /> Batalkan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>Batalkan usulan “{word}”?</DialogTitle>
            <DialogDescription>Usulan dan rekamannya dihapus. Kamu bisa mengusulkannya lagi kapan saja.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting}>
              Kembali
            </Button>
            <Button variant="destructive" onClick={cancel} disabled={deleting}>
              {deleting ? "Membatalkan…" : "Batalkan usulan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
