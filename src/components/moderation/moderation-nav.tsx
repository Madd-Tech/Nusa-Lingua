"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookA, Flag, History, Inbox, LayoutDashboard, Newspaper, UsersRound, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon; exact?: boolean; adminOnly?: boolean }[] = [
  { href: "/moderasi", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/moderasi/antrean", label: "Antrean usulan", icon: Inbox },
  { href: "/moderasi/laporan", label: "Laporan", icon: Flag },
  { href: "/moderasi/kamus", label: "Kamus", icon: BookA },
  { href: "/moderasi/artikel", label: "Artikel", icon: Newspaper },
  { href: "/moderasi/riwayat", label: "Riwayat", icon: History },
  { href: "/moderasi/tim", label: "Tim moderator", icon: UsersRound, adminOnly: true },
];

/** Sub-navigasi area moderasi. */
export function ModerationNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const tabs = TABS.filter((t) => !t.adminOnly || isAdmin);

  return (
    <nav aria-label="Menu moderasi" className="mb-6 overflow-x-auto">
      <ul className="inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
        {tabs.map((t) => {
          const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-bold text-muted-foreground",
                  active && "bg-card text-foreground shadow-soft",
                )}
              >
                <Icon aria-hidden="true" className="size-4" />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
