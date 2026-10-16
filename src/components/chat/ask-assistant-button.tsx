"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessagesSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/** Membuat chat_session dengan persona bahasa terkait, lalu membuka obrolan dengan pertanyaan terisi. */
export function AskAssistantButton({
  userId,
  persona,
  articleTitle,
}: {
  userId: string;
  persona: { id: number; name: string };
  articleTitle: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const { data, error } = await createClient()
      .from("chat_sessions")
      .insert({ user_id: userId, persona_id: persona.id, title: `Tentang: ${articleTitle}`.slice(0, 120) })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Gagal membuka obrolan. Coba lagi.");
      setLoading(false);
      return;
    }
    const prompt = `Ceritakan lebih lanjut tentang “${articleTitle}”, dan ajari aku beberapa kata yang berkaitan.`;
    router.push(`/asisten/${data.id}?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <Button variant="asisten" onClick={start} disabled={loading}>
      <MessagesSquare aria-hidden="true" />
      {loading ? "Membuka…" : `Tanya ${persona.name} tentang ini`}
    </Button>
  );
}
