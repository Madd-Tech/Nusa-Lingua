"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { LogOut, Moon, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AvatarPicker } from "@/components/layout/avatar-picker";
import { UsernameStatusText } from "@/components/layout/username-status";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { useUsernameCheck } from "@/hooks/use-username-check";
import { useSoundPreference } from "@/hooks/use-sound-effects";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, changePasswordSchema, profileSettingsSchema } from "@/lib/validation";

type ProfileValues = z.infer<typeof profileSettingsSchema>;
type PasswordValues = z.infer<typeof changePasswordSchema>;

export function SettingsForm({
  userId,
  email,
  defaults,
  regions,
  hasPassword,
}: {
  userId: string;
  email: string | null;
  defaults: ProfileValues;
  regions: { id: number; name: string; province: string | null }[];
  hasPassword: boolean;
}) {
  return (
    <div className="space-y-8">
      <ProfileSection userId={userId} defaults={defaults} regions={regions} />
      <PasswordSection hasPassword={hasPassword} />
      <PreferenceSection email={email} />
    </div>
  );
}

function ProfileSection({
  userId,
  defaults,
  regions,
}: {
  userId: string;
  defaults: ProfileValues;
  regions: { id: number; name: string; province: string | null }[];
}) {
  const router = useRouter();
  const form = useForm<ProfileValues>({ resolver: zodResolver(profileSettingsSchema), defaultValues: defaults });
  const usernameStatus = useUsernameCheck(form.watch("username") ?? "", userId, defaults.username);

  const onSubmit = async (values: ProfileValues) => {
    if (usernameStatus === "taken") {
      form.setError("username", { message: "Username ini sudah dipakai." });
      return;
    }
    // Hanya kolom identitas yang diubah; XP/streak/hearts dikelola backend.
    const { error } = await createClient()
      .from("profiles")
      .update({
        username: values.username,
        full_name: values.fullName,
        avatar_url: values.avatarUrl,
        home_region_id: values.homeRegionId || null,
      })
      .eq("id", userId);
    if (error) {
      if (error.code === "23505") form.setError("username", { message: "Username ini sudah dipakai." });
      else toast.error("Gagal menyimpan perubahan. Coba lagi.");
      return;
    }
    toast.success("Profil diperbarui");
    form.reset(values);
    router.refresh();
  };

  return (
    <section aria-labelledby="profil-heading" className="rounded-3xl border-2 bg-card p-5 sm:p-6">
      <h2 id="profil-heading" className="mb-4 text-xl">
        Profil
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <p className="text-sm font-bold">Avatar</p>
                <AvatarPicker userId={userId} name={form.watch("fullName")} value={field.value} onChange={(v) => field.onChange(v)} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama lengkap</FormLabel>
                <FormControl>
                  <Input autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoCapitalize="none" spellCheck={false} {...field} />
                </FormControl>
                <FormDescription>Huruf kecil, angka, atau garis bawah. Tampil di papan peringkat.</FormDescription>
                <UsernameStatusText status={usernameStatus} />
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="homeRegionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Daerah asal</FormLabel>
                <FormControl>
                  <NativeSelect value={String(field.value ?? 0)} onChange={(e) => field.onChange(Number(e.target.value))}>
                    <option value="0">— Belum dipilih —</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                        {r.province ? ` · ${r.province}` : ""}
                      </option>
                    ))}
                  </NativeSelect>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty || usernameStatus === "checking"}>
            {form.formState.isSubmitting ? "Menyimpan…" : "Simpan perubahan"}
          </Button>
        </form>
      </Form>
    </section>
  );
}

function PasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const form = useForm<PasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { password: "", confirm: "" } });
  const password = form.watch("password");

  const onSubmit = async ({ password }: PasswordValues) => {
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      form.setError("root", { message: authErrorMessage(error.message) });
      return;
    }
    toast.success("Kata sandi berhasil diubah");
    form.reset({ password: "", confirm: "" });
  };

  return (
    <section aria-labelledby="password-heading" className="rounded-3xl border-2 bg-card p-5 sm:p-6">
      <h2 id="password-heading" className="text-xl">
        {hasPassword ? "Ubah kata sandi" : "Buat kata sandi"}
      </h2>
      <p className="mb-4 mt-1 text-sm text-muted-foreground">
        {hasPassword ? "Gunakan minimal 8 karakter." : "Akunmu masuk lewat Google. Buat kata sandi agar bisa masuk juga dengan email."}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {form.formState.errors.root?.message ? (
            <p role="alert" className="rounded-2xl border-2 border-danger/40 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger-700 dark:text-danger">
              {form.formState.errors.root.message}
            </p>
          ) : null}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata sandi baru</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
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
                <FormLabel>Ulangi kata sandi baru</FormLabel>
                <FormControl>
                  <PasswordInput autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="outline" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan…" : "Simpan kata sandi"}
          </Button>
        </form>
      </Form>
    </section>
  );
}

function PreferenceSection({ email }: { email: string | null }) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sound, setSound] = useSoundPreference();
  useEffect(() => setMounted(true), []);

  const signOut = async () => {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error("Gagal keluar. Coba lagi.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <section aria-labelledby="pref-heading" className="space-y-4 rounded-3xl border-2 bg-card p-5 sm:p-6">
      <h2 id="pref-heading" className="text-xl">
        Tampilan & akun
      </h2>
      {email ? (
        <p className="text-sm">
          <span className="text-muted-foreground">Email:</span> <strong>{email}</strong>
        </p>
      ) : null}
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3">
        <Moon aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1 font-semibold">Mode gelap</span>
        <Checkbox
          checked={mounted && resolvedTheme === "dark"}
          onCheckedChange={(v) => setTheme(v === true ? "dark" : "light")}
          aria-label="Mode gelap"
        />
      </label>
      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3">
        <Volume2 aria-hidden="true" className="size-5 text-muted-foreground" />
        <span className="flex-1">
          <span className="block font-semibold">Efek suara</span>
          <span className="block text-xs text-muted-foreground">Bunyi saat jawaban benar/salah dan lesson selesai.</span>
        </span>
        <Checkbox checked={sound} onCheckedChange={(v) => setSound(v === true)} aria-label="Efek suara" />
      </label>
      <Button variant="outline" onClick={signOut} className="text-danger-700 dark:text-danger">
        <LogOut aria-hidden="true" /> Keluar
      </Button>
    </section>
  );
}
