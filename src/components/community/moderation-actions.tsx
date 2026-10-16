"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { Enums } from "@/types/database";

export function ModerationActions({ id, reviewerId, word }: { id: number; reviewerId: string; word: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<Enums<"submission_status"> | null>(null);

  const decide = async (status: "approved" | "rejected") => {
    setPending(status);
    const { error } = await createClient()
      .from("vocab_submissions")
      .update({ status, reviewed_by: reviewerId })
      .eq("id", id);
    setPending(null);
    if (error) {
      toast.error("Gagal memperbarui status. Coba lagi.");
      return;
    }
    toast.success(status === "approved" ? `“${word}” disetujui` : `“${word}” ditolak`);
    router.refresh();
  };

  return (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => decide("rejected")} disabled={!!pending} aria-label={`Tolak ${word}`}>
        <X aria-hidden="true" /> Tolak
      </Button>
      <Button size="sm" onClick={() => decide("approved")} disabled={!!pending} aria-label={`Setujui ${word}`}>
        <Check aria-hidden="true" /> Setujui
      </Button>
    </div>
  );
}
