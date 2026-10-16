"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { setActiveLanguageCookie } from "@/lib/active-language";

/** Konfirmasi → tambah ke user_languages → buka jalur belajar bahasa itu. */
export function StartLanguageButton({
  userId,
  languageId,
  code,
  languageName,
  children = "Mulai belajar",
  ...props
}: {
  userId: string;
  languageId: number;
  code: string;
  languageName: string;
  children?: React.ReactNode;
} & Omit<ButtonProps, "onClick">) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    const { error } = await createClient()
      .from("user_languages")
      .upsert({ user_id: userId, language_id: languageId }, { onConflict: "user_id,language_id", ignoreDuplicates: true });
    if (error) {
      toast.error("Gagal menambahkan bahasa. Coba lagi.");
      setLoading(false);
      return;
    }
    setActiveLanguageCookie(code);
    toast.success(`${languageName} ditambahkan ke daftar belajarmu`);
    router.push(`/belajar/${code}`);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mulai belajar {languageName}?</DialogTitle>
          <DialogDescription>
            {languageName} akan ditambahkan ke daftar bahasamu dan dijadikan bahasa aktif. Kamu bisa berganti bahasa kapan saja dari bar atas.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Nanti dulu
          </Button>
          <Button onClick={start} disabled={loading} autoFocus>
            {loading ? "Menyiapkan…" : "Ya, mulai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
