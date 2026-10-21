"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { REJECT_REASONS } from "@/lib/constants";
import { rejectSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

export type RejectValues = z.infer<typeof rejectSchema>;

/** Dialog penolakan: alasan wajib (chip) + catatan untuk kontributor (terisi templat). */
export function RejectDialog({
  open,
  onOpenChange,
  word,
  initialReason,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  initialReason?: RejectValues["reason"];
  /** Kembalikan true bila berhasil (dialog ditutup). */
  onSubmit: (values: RejectValues) => Promise<boolean>;
}) {
  const form = useForm<RejectValues>({ resolver: zodResolver(rejectSchema), defaultValues: { note: "" } });

  useEffect(() => {
    if (!open) return;
    const preset = REJECT_REASONS.find((r) => r.value === initialReason);
    form.reset({ reason: preset?.value, note: preset?.template ?? "" } as RejectValues);
  }, [open, initialReason, form]);

  const pickReason = (value: RejectValues["reason"]) => {
    const prev = REJECT_REASONS.find((r) => r.value === form.getValues("reason"));
    const next = REJECT_REASONS.find((r) => r.value === value);
    const note = form.getValues("note") ?? "";
    // Ganti catatan hanya bila masih kosong atau masih templat alasan sebelumnya.
    if (!note.trim() || note === prev?.template) form.setValue("note", next?.template ?? "");
    form.setValue("reason", value, { shouldValidate: true });
  };

  const submit = async (values: RejectValues) => {
    if (await onSubmit(values)) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Tolak “{word}”?</DialogTitle>
          <DialogDescription>Alasan dan catatanmu akan ditampilkan kepada kontributor.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alasan</FormLabel>
                  <div role="radiogroup" aria-label="Alasan penolakan" className="flex flex-wrap gap-2">
                    {REJECT_REASONS.map((r) => {
                      const selected = field.value === r.value;
                      return (
                        <button
                          key={r.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => pickReason(r.value)}
                          className={cn(
                            "rounded-full border-2 px-3 py-1.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected ? "border-danger bg-danger/10 text-danger-700 dark:text-danger" : "hover:bg-muted",
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
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan untuk kontributor (opsional)</FormLabel>
                  <FormControl>
                    <Textarea rows={3} maxLength={500} placeholder="Jelaskan singkat agar kontributor bisa memperbaikinya." {...field} />
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
                <X aria-hidden="true" /> {form.formState.isSubmitting ? "Menolak…" : "Tolak usulan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
