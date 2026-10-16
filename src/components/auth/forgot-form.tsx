"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { siteOrigin } from "@/components/auth/site-origin";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, forgotSchema } from "@/lib/validation";

type Values = z.infer<typeof forgotSchema>;

export function ForgotForm() {
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: Values) => {
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteOrigin()}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
    });
    // Jangan bocorkan apakah email terdaftar: selain rate-limit/jaringan, tampilkan sukses.
    if (error && /rate|network|fetch/i.test(error.message)) {
      form.setError("root", { message: authErrorMessage(error.message) });
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div role="status" className="space-y-3 rounded-3xl border-2 bg-card p-6 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/12">
          <MailCheck aria-hidden="true" className="size-8 text-primary" />
        </span>
        <h2 className="text-xl">Tautan terkirim</h2>
        <p className="text-muted-foreground">
          Jika email tersebut terdaftar, kamu akan menerima tautan untuk membuat kata sandi baru. Cek juga folder spam.
        </p>
      </div>
    );
  }

  const rootError = form.formState.errors.root?.message;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {rootError ? (
          <p role="alert" className="rounded-2xl border-2 border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-700 dark:text-danger">
            {rootError}
          </p>
        ) : null}
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
        <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Mengirim…" : "Kirim tautan reset"}
        </Button>
      </form>
    </Form>
  );
}
