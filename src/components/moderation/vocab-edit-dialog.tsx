"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AlertTriangle, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { createClient } from "@/lib/supabase/client";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import { vocabEditSchema } from "@/lib/validation";

type Values = z.infer<typeof vocabEditSchema>;

export type EditableVocab = {
  id: number;
  word: string;
  meaning_id: string;
  meaning_en: string | null;
  speech_level: string | null;
  pronunciation: string | null;
  example_sentence: string | null;
  example_meaning: string | null;
  category: string | null;
};

const FIELDS: { name: keyof Values; label: string; placeholder?: string }[] = [
  { name: "word", label: "Kata" },
  { name: "meaningId", label: "Arti (Bahasa Indonesia)" },
  { name: "meaningEn", label: "Arti (Bahasa Inggris)", placeholder: "opsional" },
  { name: "speechLevel", label: "Tingkat tutur", placeholder: "mis. ngoko, krama, lemes" },
  { name: "pronunciation", label: "Pengucapan", placeholder: "mis. ma-tur nu-wun" },
  { name: "category", label: "Kategori", placeholder: "mis. salam, benda" },
  { name: "exampleSentence", label: "Contoh kalimat" },
  { name: "exampleMeaning", label: "Terjemah contoh kalimat" },
];

/** Edit entri kamus (RLS: hanya moderator bahasa itu; perubahan tercatat di riwayat). */
export function VocabEditDialog({
  vocab,
  open,
  onOpenChange,
  warning,
  onSaved,
}: {
  vocab: EditableVocab | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mis. "Kata ini dipakai di 3 soal…". */
  warning?: string;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(vocabEditSchema) });

  useEffect(() => {
    if (!open || !vocab) return;
    form.reset({
      word: vocab.word,
      meaningId: vocab.meaning_id,
      meaningEn: vocab.meaning_en ?? "",
      speechLevel: vocab.speech_level ?? "",
      pronunciation: vocab.pronunciation ?? "",
      category: vocab.category ?? "",
      exampleSentence: vocab.example_sentence ?? "",
      exampleMeaning: vocab.example_meaning ?? "",
    });
  }, [open, vocab, form]);

  const submit = async (v: Values) => {
    if (!vocab) return;
    const { data, error } = await createClient()
      .from("vocabularies")
      .update({
        word: v.word,
        meaning_id: v.meaningId,
        meaning_en: v.meaningEn || null,
        speech_level: v.speechLevel || null,
        pronunciation: v.pronunciation || null,
        category: v.category || null,
        example_sentence: v.exampleSentence || null,
        example_meaning: v.exampleMeaning || null,
      })
      .eq("id", vocab.id)
      .select("id")
      .maybeSingle();
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan kata. Coba lagi."));
      return;
    }
    if (!data) {
      toast.error("Kata ini tidak bisa diubah. Mungkin di luar bahasa yang kamu moderasi.");
      return;
    }
    toast.success(`“${v.word}” tersimpan`);
    onOpenChange(false);
    onSaved?.();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit kata</DialogTitle>
          <DialogDescription>Perubahan langsung tampil di kamus dan tercatat di riwayat moderasi.</DialogDescription>
        </DialogHeader>
        {warning ? (
          <p role="note" className="flex gap-2 rounded-xl border-2 border-secondary/50 bg-secondary/10 p-3 text-sm">
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" /> {warning}
          </p>
        ) : null}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              {FIELDS.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name}
                  render={({ field }) => (
                    <FormItem className={f.name.startsWith("example") ? "sm:col-span-2" : undefined}>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        <Input autoComplete="off" placeholder={f.placeholder} {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={form.formState.isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                <Save aria-hidden="true" /> {form.formState.isSubmitting ? "Menyimpan…" : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
