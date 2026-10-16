import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotForm } from "@/components/auth/forgot-form";

export const metadata: Metadata = { title: "Lupa kata sandi" };

export default function LupaPasswordPage() {
  return (
    <div className="space-y-6">
      <Link href="/masuk" className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Kembali ke Masuk
      </Link>
      <div className="space-y-2">
        <h1 className="text-3xl">Lupa kata sandi?</h1>
        <p className="text-muted-foreground">Masukkan emailmu, kami kirimkan tautan untuk membuat kata sandi baru.</p>
      </div>
      <ForgotForm />
    </div>
  );
}
