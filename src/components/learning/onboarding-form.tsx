"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, MapPin, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AvatarPicker } from "@/components/layout/avatar-picker";
import { UsernameStatusText } from "@/components/layout/username-status";
import { LanguageIcon } from "@/components/learning/language-icon";
import { useUsernameCheck } from "@/hooks/use-username-check";
import { createClient } from "@/lib/supabase/client";
import { setActiveLanguageCookie } from "@/lib/active-language";
import { DEFAULT_AFTER_LOGIN, sanitizeNext } from "@/lib/routes";
import { onboardingSchema } from "@/lib/validation";
import type { LanguageWithRegion } from "@/lib/queries/content";
import { cn } from "@/lib/utils";

type Values = z.infer<typeof onboardingSchema>;
type Region = { id: number; name: string; province: string | null; island: string | null };

const STEPS = [
  { title: "Kenalan dulu, yuk!", description: "Username dan avatar ini tampil di profil serta papan peringkat." },
  { title: "Dari daerah mana kamu?", description: "Dipakai untuk peringkat daerah dan rekomendasi budaya." },
  { title: "Mau belajar bahasa apa?", description: "Pilih satu untuk mulai. Kamu bisa menambah bahasa lain kapan saja." },
];

export function OnboardingForm({
  userId,
  next,
  defaults,
  regions,
  languages,
}: {
  userId: string;
  next: string;
  defaults: { fullName: string; username: string; avatarUrl: string | null };
  regions: Region[];
  languages: LanguageWithRegion[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [regionQuery, setRegionQuery] = useState("");
  const form = useForm<Values>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { ...defaults, homeRegionId: 0, languageId: 0 },
  });
  const username = form.watch("username");
  const usernameStatus = useUsernameCheck(username ?? "", userId);

  const filteredRegions = useMemo(() => {
    const q = regionQuery.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter((r) => [r.name, r.province, r.island].some((v) => v?.toLowerCase().includes(q)));
  }, [regionQuery, regions]);

  const goNext = async () => {
    if (step === 0) {
      const ok = await form.trigger(["fullName", "username"]);
      if (!ok) return;
      if (usernameStatus === "taken") {
        form.setError("username", { message: "Username ini sudah dipakai. Coba yang lain." });
        return;
      }
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const onSubmit = async (values: Values) => {
    if (languages.length && !values.languageId) {
      form.setError("languageId", { message: "Pilih satu bahasa untuk mulai belajar." });
      return;
    }
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        username: values.username,
        full_name: values.fullName,
        avatar_url: values.avatarUrl,
        home_region_id: values.homeRegionId || null,
      })
      .eq("id", userId);

    if (error) {
      if (error.code === "23505") {
        setStep(0);
        form.setError("username", { message: "Username ini sudah dipakai. Coba yang lain." });
      } else {
        toast.error("Gagal menyimpan profil. Coba lagi.");
      }
      return;
    }

    let target = sanitizeNext(next);
    if (values.languageId) {
      const { error: langError } = await supabase
        .from("user_languages")
        .upsert({ user_id: userId, language_id: values.languageId }, { onConflict: "user_id,language_id", ignoreDuplicates: true });
      if (langError) toast.error("Profil tersimpan, tapi bahasa belum ditambahkan. Pilih lagi di menu Belajar.");
      const code = languages.find((l) => l.id === values.languageId)?.code;
      if (code) {
        setActiveLanguageCookie(code);
        if (target === DEFAULT_AFTER_LOGIN) target = `/belajar/${code}`;
      }
    }

    toast.success(`Selamat datang, ${values.fullName.split(" ")[0]}!`);

    // Kirim welcome email (fire-and-forget, tidak perlu blocking)
    fetch("/api/emails/welcome", { method: "POST" }).catch(() => {
      // Gagal kirim email welcome tidak menghambat onboarding
    });

    router.replace(target);
    router.refresh();
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <div className="flex items-center gap-3">
          {step > 0 ? (
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => setStep((s) => s - 1)} aria-label="Langkah sebelumnya">
              <ArrowLeft />
            </Button>
          ) : null}
          <Progress value={step + 1} max={STEPS.length} aria-label={`Langkah ${step + 1} dari ${STEPS.length}`} className="h-3" />
          <span className="shrink-0 text-sm font-bold text-muted-foreground">
            {step + 1}/{STEPS.length}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <h1 className="text-3xl">{current.title}</h1>
              <p className="text-muted-foreground">{current.description}</p>
            </div>

            {step === 0 ? (
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">@</span>
                          <Input className="pl-9" autoComplete="username" autoCapitalize="none" spellCheck={false} {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>3–20 karakter: huruf kecil, angka, atau garis bawah.</FormDescription>
                      <UsernameStatusText status={usernameStatus} />
                      <FormMessage />
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
                  name="avatarUrl"
                  render={({ field }) => (
                    <FormItem>
                      <p className="text-sm font-bold">Avatar</p>
                      <AvatarPicker userId={userId} name={form.watch("fullName")} value={field.value} onChange={field.onChange} />
                    </FormItem>
                  )}
                />
              </div>
            ) : null}

            {step === 1 ? (
              <FormField
                control={form.control}
                name="homeRegionId"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="sr-only">Daerah asal</FormLabel>
                    {regions.length ? (
                      <>
                        <div className="relative">
                          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="search"
                            value={regionQuery}
                            onChange={(e) => setRegionQuery(e.target.value)}
                            placeholder="Cari daerah, provinsi, atau pulau…"
                            aria-label="Cari daerah"
                            className="pl-11"
                          />
                        </div>
                        <div role="radiogroup" aria-label="Daerah asal" className="grid max-h-[46vh] gap-2 overflow-y-auto p-0.5 sm:grid-cols-2">
                          {filteredRegions.map((r) => {
                            const selected = field.value === r.id;
                            return (
                              <button
                                key={r.id}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => field.onChange(selected ? 0 : r.id)}
                                className={cn(
                                  "flex items-center gap-3 rounded-2xl border-2 border-b-4 bg-card p-3 text-left",
                                  selected ? "border-primary bg-primary/10" : "hover:bg-muted",
                                )}
                              >
                                <MapPin aria-hidden="true" className="size-5 shrink-0 text-accent" />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate font-bold">{r.name}</span>
                                  <span className="block truncate text-xs text-muted-foreground">
                                    {[r.province, r.island].filter(Boolean).join(" · ")}
                                  </span>
                                </span>
                                {selected ? <Check aria-hidden="true" className="size-5 text-primary" /> : null}
                              </button>
                            );
                          })}
                          {filteredRegions.length === 0 ? (
                            <p className="col-span-full py-6 text-center text-sm text-muted-foreground">Daerah tidak ditemukan.</p>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <p className="rounded-2xl border-2 border-dashed p-4 text-sm text-muted-foreground">
                        Daftar daerah belum tersedia. Kamu bisa mengaturnya nanti di Pengaturan.
                      </p>
                    )}
                  </FormItem>
                )}
              />
            ) : null}

            {step === 2 ? (
              <FormField
                control={form.control}
                name="languageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Pilih bahasa</FormLabel>
                    {languages.length ? (
                      <div role="radiogroup" aria-label="Pilih bahasa" className="grid gap-3 sm:grid-cols-2">
                        {languages.map((lang) => {
                          const selected = field.value === lang.id;
                          return (
                            <button
                              key={lang.id}
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              onClick={() => field.onChange(lang.id)}
                              className={cn(
                                "flex items-start gap-3 rounded-2xl border-2 border-b-4 bg-card p-3 text-left transition-colors",
                                selected ? "border-primary bg-primary/10" : "hover:bg-muted",
                              )}
                            >
                              <LanguageIcon name={lang.name} code={lang.code} iconUrl={lang.icon_url} className="size-11" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-extrabold">{lang.name}</span>
                                <span className="block truncate text-xs text-muted-foreground">
                                  {lang.region?.province ?? lang.region?.name ?? "Indonesia"}
                                </span>
                                {lang.description ? (
                                  <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{lang.description}</span>
                                ) : null}
                              </span>
                              {selected ? (
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
                                  <Check aria-hidden="true" className="size-4" />
                                </span>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-2xl border-2 border-dashed p-4 text-sm text-muted-foreground">
                        Belum ada bahasa yang aktif. Kamu tetap bisa melanjutkan.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>

        {isLast ? (
          <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Menyimpan…" : "Mulai belajar"}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button type="button" size="lg" block onClick={goNext} disabled={step === 0 && usernameStatus === "checking"}>
              Lanjut
            </Button>
            {step === 1 && regions.length ? (
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                Lewati dulu
              </Button>
            ) : null}
          </div>
        )}
      </form>
    </Form>
  );
}
