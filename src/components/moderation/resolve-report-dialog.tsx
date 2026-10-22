"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Ban, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { resolveReportSchema } from "@/lib/validation";

type Values = z.infer<typeof resolveReportSchema>;

/** Tandai selesai (catatan opsional) atau abaikan (catatan wajib) semua laporan terbuka untuk satu target. */
export function ResolveReportDialog({
  mode,
  onOpenChange,
  title,
  count,
  onSubmit,
}: {
  /** null = tertutup. */
  mode: "resolved" | "dismissed" | null;
  onOpenChange: (open: boolean) => void;
  title: string;
  count: number;
  /** Kembalikan true bila berhasil (dialog ditutup). */
  onSubmit: (note: string) => Promise<boolean>;
}) {
  const form = useForm<Values>({ resolver: zodResolver(resolveReportSchema), defaultValues: { note: "" } });
  const dismiss = mode === "dismissed";

  useEffect(() => {
    if (mode) form.reset({ note: "" });
  }, [mode, form]);

  const submit = async (v: Values) => {
    const note = v.note?.trim() ?? "";
    if (dismiss && !note) {
      form.setError("note", { message: "Tulis alasan mengabaikan laporan ini" });
      return;
    }
    if (await onSubmit(note)) onOpenChange(false);
  };

  return (
    <Dialog open={!!mode} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{dismiss ? `Abaikan laporan “${title}”?` : `Tandai laporan “${title}” selesai?`}</DialogTitle>
          <DialogDescription>
            {count > 1 ? `Semua ${count} laporan terbuka untuk target ini ikut ditutup. ` : ""}
            Catatanmu tampil untuk pelapor di halaman Kontribusi.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dismiss ? "Alasan" : "Catatan (opsional)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      maxLength={500}
                      placeholder={dismiss ? "mis. Ejaan sudah sesuai kamus baku." : "mis. Arti sudah diperbaiki, terima kasih!"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Batal
              </Button>
              <Button type="submit" variant={dismiss ? "destructive" : "default"} disabled={form.formState.isSubmitting}>
                {dismiss ? <Ban aria-hidden="true" /> : <CheckCheck aria-hidden="true" />}
                {form.formState.isSubmitting ? "Menyimpan…" : dismiss ? "Abaikan" : "Tandai selesai"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
