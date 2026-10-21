"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo, LogoMark } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguagePicker, type PickerLanguage } from "@/components/layout/language-picker";
import { CATEGORY_STYLES, MOBILE_NAV, NAV_ITEMS, isNavActive, type NavItem } from "@/components/layout/nav-items";
import { HeartsChip, StreakChip, XpChip } from "@/components/gamification/stat-chip";
import type { Enums } from "@/types/database";

export type ShellProfile = {
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  xp_total: number;
  current_streak: number;
  hearts: number;
  role: Enums<"user_role">;
  activeToday: boolean;
};

/** Route "fokus" tanpa navigasi: lesson player & onboarding. */
function isFocusRoute(pathname: string) {
  return pathname.startsWith("/onboarding") || /^\/belajar\/[^/]+\/lesson\//.test(pathname);
}

export function AppShell({
  profile,
  languages,
  activeLanguageCode,
  badges = {},
  children,
}: {
  profile: ShellProfile;
  languages: PickerLanguage[];
  activeLanguageCode: string | null;
  /** Angka di samping item sidebar, per href (mis. usulan menunggu untuk /moderasi). */
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((i) => !i.roles || i.roles.includes(profile.role as "moderator" | "admin"));

  if (isFocusRoute(pathname)) {
    return <div className="min-h-dvh">{children}</div>;
  }

  return (
    <div className="min-h-dvh md:pl-20 lg:pl-64">
      <a
        href="#konten"
        className="sr-only z-[60] rounded-xl bg-card px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Lewati ke konten
      </a>
      <Sidebar items={items} pathname={pathname} badges={badges} />
      <TopBar profile={profile} languages={languages} activeLanguageCode={activeLanguageCode} />
      <main id="konten" className="mx-auto w-full max-w-5xl px-4 pb-28 pt-4 md:px-6 md:pb-12 lg:px-8 lg:pt-6">
        {children}
      </main>
      <BottomNav items={items} pathname={pathname} />
    </div>
  );
}

function Sidebar({ items, pathname, badges }: { items: NavItem[]; pathname: string; badges: Record<string, number> }) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r-2 bg-card md:flex lg:w-64"
      aria-label="Navigasi utama"
    >
      <div className="flex h-16 items-center justify-center px-4 lg:justify-start lg:px-5">
        <Link href="/beranda" className="rounded-xl lg:hidden" aria-label="Beranda Nusa Lingua">
          <LogoMark />
        </Link>
        <Logo href="/beranda" className="hidden lg:inline-flex" />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = isNavActive(pathname, item, items);
            const style = CATEGORY_STYLES[item.category];
            const Icon = item.icon;
            const badge = badges[item.href] ?? 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  title={badge ? `${item.label} (${badge})` : item.label}
                  className={cn(
                    "group flex items-center justify-center gap-3 rounded-2xl border-2 border-transparent px-3 py-2.5 text-[0.9375rem] font-bold transition-colors lg:justify-start",
                    active ? cn(style.activeBg, style.border) : "hover:bg-muted",
                  )}
                >
                  <span className="relative flex shrink-0">
                    <Icon aria-hidden="true" className={cn("size-6", style.text)} strokeWidth={2.25} />
                    {badge ? (
                      <span aria-hidden="true" className="absolute -right-1 -top-1 size-2.5 rounded-full bg-danger ring-2 ring-card lg:hidden" />
                    ) : null}
                  </span>
                  <span className="sr-only lg:not-sr-only">{item.label}</span>
                  {badge ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="ml-auto hidden rounded-full bg-komunitas-solid px-2 py-0.5 text-xs font-extrabold text-white lg:inline"
                      >
                        {badge > 99 ? "99+" : badge}
                      </span>
                      <span className="sr-only">, {badge} menunggu</span>
                    </>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex justify-center border-t-2 p-3 lg:justify-start">
        <ThemeToggle />
      </div>
    </aside>
  );
}

function TopBar({
  profile,
  languages,
  activeLanguageCode,
}: {
  profile: ShellProfile;
  languages: PickerLanguage[];
  activeLanguageCode: string | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b-2 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-3 sm:px-4 md:px-6 lg:px-8">
        <LanguagePicker languages={languages} activeCode={activeLanguageCode} />
        <div className="ml-auto flex items-center sm:gap-1" role="group" aria-label="Statistik belajarmu">
          <StreakChip value={profile.current_streak} activeToday={profile.activeToday} />
          <XpChip value={profile.xp_total} />
          <HeartsChip value={profile.hearts} />
        </div>
        <div className="ml-1">
          <UserMenu username={profile.username} fullName={profile.full_name} avatarUrl={profile.avatar_url} />
        </div>
      </div>
    </header>
  );
}

function BottomNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const mobile = MOBILE_NAV.map((href) => items.find((i) => i.href === href)).filter(Boolean) as NavItem[];
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t-2 bg-card md:hidden" aria-label="Navigasi utama">
      <ul className="grid grid-cols-5">
        {mobile.map((item) => {
          // Item lain (Ulasan, Kontribusi, Peringkat) dianggap bagian dari Profil/Beranda di mobile.
          const active = isNavActive(pathname, item, items);
          const style = CATEGORY_STYLES[item.category];
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-0.5 px-1 pb-2 pt-2.5 text-[0.6875rem] font-bold"
              >
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-xl border-2 border-transparent transition-colors",
                    active && cn(style.activeBg, style.border),
                  )}
                >
                  <Icon aria-hidden="true" className={cn("size-[22px]", style.text)} strokeWidth={2.25} />
                </span>
                <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                  {item.label === "Asisten AI" ? "Asisten" : item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
