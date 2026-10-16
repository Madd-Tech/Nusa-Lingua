"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GoogleButton } from "@/components/auth/google-button";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthDivider } from "@/components/auth/auth-divider";
import { createClient } from "@/lib/supabase/client";
import { sanitizeNext } from "@/lib/routes";
import { authErrorMessage, loginSchema } from "@/lib/validation";

type Values = z.infer<typeof loginSchema>;

export function LoginForm({ next, googleEnabled = null }: { next: string; googleEnabled?: boolean | null }) {
  const router = useRouter();
  const form = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const onSubmit = async (values: Values) => {
    const { error } = await createClient().auth.signInWithPassword(values);
    if (error) {
      form.setError("root", { message: authErrorMessage(error.message) });
      return;
    }
    toast.success("Selamat datang kembali!");
    // `next` sudah divalidasi di server, divalidasi ulang di sini sebagai pengaman.
    router.replace(sanitizeNext(next));
    router.refresh();
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <div className="space-y-5">
      <GoogleButton next={next} label="Masuk dengan Google" enabled={googleEnabled} />
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
                <div className="flex items-center justify-between">
                  <FormLabel>Kata sandi</FormLabel>
                  <Link href="/lupa-password" className="text-sm font-bold text-primary-700 hover:underline dark:text-primary">
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput autoComplete="current-password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Memproses…" : "Masuk"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
