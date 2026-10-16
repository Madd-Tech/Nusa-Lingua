"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function NewChatButton({ userId, personaId, personaName }: { userId: string; personaId: number; personaName: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const { data, error } = await createClient()
      .from("chat_sessions")
      .insert({ user_id: userId, persona_id: personaId, title: `Obrolan dengan ${personaName}` })
      .select("id")
      .single();
    if (error || !data) {
      toast.error("Gagal memulai obrolan. Coba lagi.");
      setLoading(false);
      return;
    }
    router.push(`/asisten/${data.id}`);
  };

  return (
    <Button variant="asisten" onClick={start} disabled={loading} aria-label={`Mulai ngobrol dengan ${personaName}`}>
      <MessageSquarePlus aria-hidden="true" />
      {loading ? "Membuka…" : "Mulai ngobrol"}
    </Button>
  );
}
