"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { approveEditSchema } from "@/lib/validation";

export type ApproveEditValues = z.infer<typeof approveEditSchema>;

/** Rapikan usulan (ejaan, arti, tingkat tutur, contoh kalimat) lalu setujui. */
export function ApproveEditDialog({
  open,
  onOpenChange,
  word,
  meaningId,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  meaningId: string;
  /** Kembalikan true bila berhasil (dialog ditutup). */
  onSubmit: (values: ApproveEditValues) => Promise<boolean>;
}) {
  const form = useForm<ApproveEditValues>({ resolver: zodResolver(approveEditSchema) });

  useEffect(() => {
    if (open) form.reset({ word, meaningId, speechLevel: "", exampleSentence: "", exampleMeaning: "", note: "" });
  }, [open, word, meaningId, form]);

  const submit = async (values: ApproveEditValues) => {
    if (await onSubmit(values)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit & setujui</DialogTitle>
          <DialogDescription>Perubahan kata atau arti akan ditunjukkan kepada kontributor.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meaningId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arti</FormLabel>
                    <FormControl>
                      <Input autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="speechLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tingkat tutur (opsional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="mis. ngoko, krama, lemes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exampleSentence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contoh kalimat (opsional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exampleMeaning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terjemah contoh kalimat (opsional)</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan untuk kontributor (opsional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} maxLength={500} {...field} />
                  </FormControl>
                  <FormDescription>Mis. alasan ejaan diubah.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Batal
              </Button>
              <Button type="submit" variant="komunitas" disabled={form.formState.isSubmitting}>
                <Check aria-hidden="true" /> {form.formState.isSubmitting ? "Menyimpan…" : "Setujui"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
