"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Saat pembaca menggulir sampai 80% artikel (elemen #isi-artikel), catat ke user_article_reads
 * sekali saja, lalu tampilkan toast. Tidak melakukan apa pun jika artikel sudah pernah dibaca.
 */
export function ReadTracker({ userId, articleId, alreadyRead }: { userId: string; articleId: number; alreadyRead: boolean }) {
  const doneRef = useRef(alreadyRead);

  useEffect(() => {
    if (doneRef.current) return;
    const target = document.getElementById("isi-artikel");
    if (!target) return;

    const check = () => {
      if (doneRef.current) return;
      const rect = target.getBoundingClientRect();
      const seen = window.innerHeight - rect.top; // tinggi artikel yang sudah terlihat
      if (rect.height > 0 && seen / rect.height >= 0.8) {
        doneRef.current = true;
        window.removeEventListener("scroll", check);
        void createClient()
          .from("user_article_reads")
          .upsert({ user_id: userId, article_id: articleId }, { onConflict: "user_id,article_id", ignoreDuplicates: true })
          .then(({ error }) => {
            if (!error) toast.success("Artikel selesai dibaca");
          });
      }
    };
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => window.removeEventListener("scroll", check);
  }, [userId, articleId]);

  return null;
}
