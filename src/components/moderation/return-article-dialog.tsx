"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { returnArticleSchema } from "@/lib/validation";

type Values = z.infer<typeof returnArticleSchema>;

/** Kembalikan artikel ke penulis dengan catatan wajib (ditegakkan juga oleh trigger database). */
export function ReturnArticleDialog({
  open,
  onOpenChange,
  title,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Kembalikan true bila berhasil (dialog ditutup). */
  onSubmit: (note: string) => Promise<boolean>;
}) {
  const form = useForm<Values>({ resolver: zodResolver(returnArticleSchema), defaultValues: { note: "" } });

  useEffect(() => {
    if (open) form.reset({ note: "" });
  }, [open, form]);

  const submit = async (v: Values) => {
    if (await onSubmit(v.note)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Kembalikan “{title}” ke draf?</DialogTitle>
          <DialogDescription>Catatanmu tampil di atas editor penulis sampai artikel diajukan lagi.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan untuk penulis</FormLabel>
                  <FormControl>
                    <Textarea rows={4} maxLength={500} placeholder="mis. Tambahkan rujukan primer untuk bagian sejarah." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Batal
              </Button>
              <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                <Undo2 aria-hidden="true" /> {form.formState.isSubmitting ? "Mengembalikan…" : "Kembalikan ke draf"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
