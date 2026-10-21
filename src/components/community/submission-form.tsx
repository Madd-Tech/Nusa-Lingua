"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AudioRecorder } from "@/components/community/audio-recorder";
import { createClient } from "@/lib/supabase/client";
import { submissionSchema } from "@/lib/validation";

type Values = z.infer<typeof submissionSchema>;

export function SubmissionForm({
  userId,
  languages,
  defaultLanguageId,
}: {
  userId: string;
  languages: { id: number; name: string }[];
  defaultLanguageId?: number;
}) {
  const router = useRouter();
  const [audio, setAudio] = useState<Blob | null>(null);
  const [recorderKey, setRecorderKey] = useState(0);
  const form = useForm<Values>({
    resolver: zodResolver(submissionSchema),
    defaultValues: { languageId: defaultLanguageId ?? 0, word: "", meaningId: "" },
  });

  const onSubmit = async (values: Values) => {
    const supabase = createClient();
    let audioUrl: string | null = null;

    if (audio) {
      const path = `${userId}/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage.from("audio").upload(path, audio, { contentType: "audio/webm", upsert: false });
      if (upErr) {
        toast.error("Rekaman gagal diunggah. Coba lagi atau kirim tanpa audio.");
        return;
      }
      audioUrl = supabase.storage.from("audio").getPublicUrl(path).data.publicUrl;
    }

    const { error } = await supabase.from("vocab_submissions").insert({
      user_id: userId,
      language_id: values.languageId,
      word: values.word,
      meaning_id: values.meaningId,
      audio_url: audioUrl,
      status: "pending",
    });
    if (error) {
      toast.error("Kiriman gagal disimpan. Coba lagi.");
      return;
    }
    toast.success("Terima kasih! Kirimanmu akan ditinjau moderator.");
    form.reset({ languageId: values.languageId, word: "", meaningId: "" });
    setAudio(null);
    setRecorderKey((k) => k + 1);
    router.refresh();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField
          control={form.control}
          name="languageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bahasa</FormLabel>
              <FormControl>
                <SelectFilter
                  value={String(field.value ?? 0)}
                  onValueChange={(v) => field.onChange(Number(v))}
                  placeholder="Pilih bahasa…"
                  options={[
                    { value: "0", label: "Pilih bahasa…", disabled: true },
                    ...languages.map((l) => ({ value: String(l.id), label: l.name })),
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="word"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata dalam bahasa daerah</FormLabel>
                <FormControl>
                  <Input placeholder="mis. matur nuwun" autoComplete="off" {...field} />
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
                <FormLabel>Arti dalam Bahasa Indonesia</FormLabel>
                <FormControl>
                  <Input placeholder="mis. terima kasih" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label asChild>
            <span>Rekaman pelafalan</span>
          </Label>
          <AudioRecorder key={recorderKey} value={audio} onChange={setAudio} />
        </div>
        <Button type="submit" variant="komunitas" size="lg" disabled={form.formState.isSubmitting}>
          <Send aria-hidden="true" />
          {form.formState.isSubmitting ? "Mengirim…" : "Kirim kontribusi"}
        </Button>
      </form>
    </Form>
  );
}
