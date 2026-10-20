"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GoogleSignIn } from "@/components/auth/google-sign-in";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { AuthDivider } from "@/components/auth/auth-divider";
import { siteOrigin } from "@/components/auth/site-origin";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, registerSchema } from "@/lib/validation";

type Values = z.infer<typeof registerSchema>;

export function RegisterForm({ next, googleEnabled = null }: { next: string; googleEnabled?: boolean | null }) {
  const router = useRouter();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const form = useForm<Values>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirm: "", agree: false },
  });
  const password = form.watch("password");

  // Setelah daftar, user wajib onboarding (username) — middleware juga menegakkan ini.
  const afterSignup = `/onboarding?next=${encodeURIComponent(next)}`;

  const onSubmit = async (values: Values) => {
    const { data, error } = await createClient().auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        // full_name dibaca trigger pembuat baris profiles.
        data: { full_name: values.fullName },
        emailRedirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent(afterSignup)}`,
      },
    });
    if (error) {
      form.setError("root", { message: authErrorMessage(error.message) });
      return;
    }
    if (data.session) {
      router.replace(afterSignup);
      router.refresh();
    } else {
      setSentTo(values.email);
    }
  };

  if (sentTo) {
    return (
      <div role="status" className="space-y-4 rounded-3xl border-2 bg-card p-6 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/12">
          <MailCheck aria-hidden="true" className="size-8 text-primary" />
        </span>
        <h2 className="text-xl">Cek email kamu untuk verifikasi</h2>
        <p className="text-muted-foreground">
          Kami mengirim tautan konfirmasi ke <strong className="text-foreground">{sentTo}</strong>. Klik tautan itu untuk
          mengaktifkan akun, lalu kamu akan langsung diarahkan untuk melengkapi profil.
        </p>
        <p className="text-sm text-muted-foreground">Tidak ada di kotak masuk? Cek folder spam.</p>
        <Button variant="outline" onClick={() => setSentTo(null)}>
          Ganti email
        </Button>
      </div>
    );
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <div className="space-y-5">
      <GoogleSignIn next={afterSignup} mode="signup" enabled={googleEnabled} />
      <AuthDivider />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {rootError ? (
            <p role="alert" className="rounded-2xl border-2 border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-700 dark:text-danger">
              {rootError}
            </p>
          ) : null}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama lengkap</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder="Nama kamu" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="email" inputMode="email" placeholder="nama@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata sandi</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Minimal 8 karakter" {...field} />
                </FormControl>
                <PasswordStrength password={password} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Konfirmasi kata sandi</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" placeholder="Ulangi kata sandi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agree"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
                  </FormControl>
                  <FormLabel className="font-semibold leading-snug">
                    Saya setuju dengan{" "}
                    <Link href="/ketentuan" target="_blank" className="font-bold text-primary-700 underline dark:text-primary">
                      Ketentuan Layanan & Privasi
                    </Link>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Membuat akun…" : "Buat akun"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
