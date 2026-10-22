"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import { hideVocabSchema } from "@/lib/validation";

type Values = z.infer<typeof hideVocabSchema>;

/**
 * Sembunyikan (dengan alasan) atau pulihkan entri kamus.
 * Kata yang dipakai soal tidak bisa disembunyikan; database juga menolaknya.
 */
export function VocabVisibilityButton({
  id,
  word,
  hidden,
  uses,
  onDone,
}: {
  id: number;
  word: string;
  hidden: boolean;
  /** Jumlah soal yang memakai kata ini. */
  uses: number;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(hideVocabSchema), defaultValues: { reason: "" } });

  const update = async (patch: { is_hidden: boolean; hidden_reason: string | null }, success: string) => {
    const { data, error } = await createClient().from("vocabularies").update(patch).eq("id", id).select("id").maybeSingle();
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan. Coba lagi."));
      return false;
    }
    if (!data) {
      toast.error("Kata ini tidak bisa diubah. Mungkin di luar bahasa yang kamu moderasi.");
      return false;
    }
    toast.success(success);
    onDone?.();
    router.refresh();
    return true;
  };

  if (hidden) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={restoring}
        onClick={async () => {
          setRestoring(true);
          await update({ is_hidden: false, hidden_reason: null }, `“${word}” tampil lagi di kamus`);
          setRestoring(false);
        }}
      >
        <Eye aria-hidden="true" /> {restoring ? "Memulihkan…" : "Pulihkan"}
      </Button>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        disabled={uses > 0}
        title={uses > 0 ? `Dipakai di ${uses} soal — perbaiki isinya saja` : undefined}
        aria-label={uses > 0 ? `Sembunyikan ${word} (tidak tersedia: dipakai di ${uses} soal)` : `Sembunyikan ${word}`}
        onClick={() => {
          form.reset({ reason: "" });
          setOpen(true);
        }}
      >
        <EyeOff aria-hidden="true" /> Sembunyikan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Sembunyikan “{word}” dari kamus?</DialogTitle>
            <DialogDescription>
              Kata disembunyikan dari pelajar, tetapi tidak dihapus. Kamu atau moderator lain bisa memulihkannya kapan saja.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(async (v) => {
                if (await update({ is_hidden: true, hidden_reason: v.reason }, `“${word}” disembunyikan`)) setOpen(false);
              })}
              className="space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alasan</FormLabel>
                    <FormControl>
                      <Textarea rows={3} maxLength={300} placeholder="mis. Duplikat dari entri yang ejaannya benar." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={form.formState.isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                  <EyeOff aria-hidden="true" /> {form.formState.isSubmitting ? "Menyembunyikan…" : "Sembunyikan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
