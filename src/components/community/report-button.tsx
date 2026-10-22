"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Flag, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS } from "@/lib/constants";
import { reportSchema } from "@/lib/validation";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

type Values = z.infer<typeof reportSchema>;

/** Tombol + dialog untuk melaporkan kesalahan kata kamus atau artikel budaya. */
export function ReportButton({
  targetType,
  targetId,
  targetLabel,
  className,
}: {
  targetType: Enums<"report_target">;
  targetId: number;
  /** Kata atau judul artikel, untuk judul dialog. */
  targetLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const reasons = REPORT_REASONS.filter((r) => r.targets.includes(targetType));
  const form = useForm<Values>({ resolver: zodResolver(reportSchema), defaultValues: { message: "" } });

  const openDialog = () => {
    form.reset({ message: "" } as Values);
    setOpen(true);
  };

  const submit = async (v: Values) => {
    const { error } = await createClient()
      .from("content_reports")
      .insert({
        target_type: targetType,
        ...(targetType === "vocabulary" ? { vocabulary_id: targetId } : { article_id: targetId }),
        reason: v.reason,
        message: v.message?.trim() || null,
      });
    if (error) {
      if (error.code === "23505") toast.info("Kamu sudah melaporkan ini. Moderator sedang memeriksanya.");
      else if (error.code === "NL429") toast.error(error.message);
      else if (error.code === "P0002") toast.error("Konten ini sudah tidak tersedia.");
      else toast.error("Laporan gagal dikirim. Coba lagi.");
      if (error.code === "23505") setOpen(false);
      return;
    }
    toast.success("Terima kasih! Laporanmu akan diperiksa moderator.");
    setOpen(false);
  };

  return (
    <>
      <Button type="button" variant="ghost" size="sm" onClick={openDialog} className={className}>
        <Flag aria-hidden="true" /> Laporkan kesalahan
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Laporkan “{targetLabel}”</DialogTitle>
            <DialogDescription>
              Moderator {targetType === "vocabulary" ? "bahasa ini" : "budaya"} akan memeriksa laporanmu. Hasilnya bisa kamu lihat
              di halaman Kontribusi.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis kesalahan</FormLabel>
                    <div role="radiogroup" aria-label="Jenis kesalahan" className="flex flex-wrap gap-2">
                      {reasons.map((r) => {
                        const selected = field.value === r.value;
                        return (
                          <button
                            key={r.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => form.setValue("reason", r.value, { shouldValidate: true })}
                            className={cn(
                              "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              selected ? "border-komunitas bg-komunitas/10 text-komunitas-deep dark:text-komunitas" : "hover:bg-muted",
                            )}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan {form.watch("reason") === "lainnya" ? "" : "(opsional)"}</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        maxLength={500}
                        placeholder={targetType === "vocabulary" ? "mis. Seharusnya ditulis “matur nuwun”." : "mis. Tahun pada bagian sejarah keliru, sumber: …"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={form.formState.isSubmitting}>
                  Batal
                </Button>
                <Button type="submit" variant="komunitas" disabled={form.formState.isSubmitting}>
                  <Send aria-hidden="true" /> {form.formState.isSubmitting ? "Mengirim…" : "Kirim laporan"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
