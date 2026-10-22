import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Settings } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/layout/settings-form";
import { getCurrentUser } from "@/lib/supabase/server";
import { getProfile } from "@/lib/queries/progress";
import { getRegions } from "@/lib/queries/content";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function PengaturanPage() {
  const { supabase, user } = await getCurrentUser();
  const [profile, regions] = await Promise.all([getProfile(supabase, user!.id), getRegions(supabase)]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/profil" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
        <ArrowLeft aria-hidden="true" className="size-4" /> Profil
      </Link>
      <PageHeader icon={Settings} category="progres" title="Pengaturan" description="Atur profil, akun, dan tampilan aplikasi." />
      <SettingsForm
        userId={user!.id}
        email={user!.email ?? null}
        regions={regions}
        hasPassword={(user!.identities ?? []).some((i) => i.provider === "email")}
        defaults={{
          fullName: profile?.full_name ?? "",
          username: profile?.username ?? "",
          gender: profile?.gender ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          homeRegionId: profile?.home_region_id ?? 0,
        }}
      />
    </div>
  );
}
