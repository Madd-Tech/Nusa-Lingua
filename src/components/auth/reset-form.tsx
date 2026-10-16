"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton, LoadingRegion } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import { EmptyState } from "@/components/ui/empty-state";
import { IlloOops } from "@/components/illustrations";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, resetSchema } from "@/lib/validation";

type Values = z.infer<typeof resetSchema>;

export function ResetForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "no-session">("checking");
  const form = useForm<Values>({ resolver: zodResolver(resetSchema), defaultValues: { password: "", confirm: "" } });

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setStatus(data.user ? "ready" : "no-session"))
      .catch(() => setStatus("no-session"));
  }, []);

  const onSubmit = async ({ password }: Values) => {
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      form.setError("root", { message: authErrorMessage(error.message) });
      return;
    }
    toast.success("Kata sandi berhasil diperbarui");
    router.replace("/beranda");
    router.refresh();
  };

  if (status === "checking") {
    return (
      <LoadingRegion label="Memeriksa tautan…" className="space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-14" />
      </LoadingRegion>
    );
  }

  if (status === "no-session") {
    return (
      <EmptyState
        illustration={<IlloOops />}
        title="Tautan tidak valid"
        description="Tautan reset sudah kedaluwarsa atau pernah dipakai. Minta tautan baru ya."
        action={
          <Button asChild>
            <Link href="/lupa-password">Minta tautan baru</Link>
          </Button>
        }
      />
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
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kata sandi baru</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" placeholder="Minimal 8 karakter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ulangi kata sandi baru</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan…" : "Simpan kata sandi"}
        </Button>
      </form>
    </Form>
  );
}
