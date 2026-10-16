import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/reset-form";

export const metadata: Metadata = { title: "Buat kata sandi baru" };

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl">Buat kata sandi baru</h1>
        <p className="text-muted-foreground">Pilih kata sandi yang kuat dan mudah kamu ingat.</p>
      </div>
      <ResetForm />
    </div>
  );
}
