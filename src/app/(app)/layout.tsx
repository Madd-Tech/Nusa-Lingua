import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/supabase/server";
import { getProfile, getUserLanguages } from "@/lib/queries/progress";
import { ACTIVE_LANGUAGE_COOKIE, resolveActiveLanguage } from "@/lib/active-language";
import { getLearningMascot } from "@/lib/learning-mascots";
import { resolvePose } from "@/lib/mascot-poses";
import { todayJakarta } from "@/lib/utils";

/** Layout terproteksi. Middleware sudah menyaring tamu; ini lapisan pengaman kedua. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await getCurrentUser();
  if (!user) redirect("/masuk");

  const [profile, userLanguages] = await Promise.all([
    getProfile(supabase, user.id).catch(() => null),
    getUserLanguages(supabase, user.id).catch(() => []),
  ]);
  const activeCode = cookies().get(ACTIVE_LANGUAGE_COOKIE)?.value;
  const active = resolveActiveLanguage(userLanguages, activeCode);

  // Preload SVG maskot yang dipakai `PageLoading` supaya animasi tidak diawali
  // kotak placeholder saat navigasi pertama.
  const loadingMascot = getLearningMascot(activeCode);
  const loadingMascotSrc = `/media/animasi-maskot/${loadingMascot.id}/${resolvePose(loadingMascot.id, loadingMascot.poses.thinking)}.svg`;

  return (
    <>
      <link rel="preload" as="image" href={loadingMascotSrc} />
      <AppShell
        profile={{
          username: profile?.username ?? null,
          full_name: profile?.full_name ?? (user.user_metadata?.full_name as string | undefined) ?? null,
          avatar_url: profile?.avatar_url ?? null,
          xp_total: profile?.xp_total ?? 0,
          current_streak: profile?.current_streak ?? 0,
          hearts: profile?.hearts ?? 5,
          role: profile?.role ?? "user",
          activeToday: profile?.last_active_date === todayJakarta(),
        }}
        languages={userLanguages.map((ul) => ({ code: ul.language.code, name: ul.language.name, icon_url: ul.language.icon_url }))}
        activeLanguageCode={active?.language.code ?? null}
      >
        {children}
      </AppShell>
    </>
  );
}
