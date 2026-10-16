import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { BatikPattern } from "@/components/ui/batik-pattern";
import { OnboardingForm } from "@/components/learning/onboarding-form";
import { getCurrentUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/progress";
import { getActiveLanguages, getRegions } from "@/lib/queries/content";
import { sanitizeNext } from "@/lib/routes";

export const metadata: Metadata = { title: "Kenalan dulu" };

export default async function OnboardingPage({ searchParams }: { searchParams: { next?: string } }) {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/masuk?next=/onboarding");

  const next = sanitizeNext(searchParams.next);
  const [profile, regions, languages] = await Promise.all([
    getProfile(supabase, user.id),
    getRegions(supabase),
    getActiveLanguages(supabase),
  ]);

  if (profile?.username) redirect(next);

  const suggested = (user.email ?? "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 20);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <BatikPattern variant="kawung" size={56} className="text-primary opacity-[0.05]" />
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-6">
        <Logo href="/" className="self-start" />
        <main id="konten" className="flex flex-1 flex-col justify-center py-8">
          <OnboardingForm
            userId={user.id}
            next={next}
            defaults={{
              fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? "",
              username: suggested.length >= 3 ? suggested : "",
              avatarUrl: profile?.avatar_url ?? null,
            }}
            regions={regions}
            languages={languages}
          />
        </main>
      </div>
    </div>
  );
}
