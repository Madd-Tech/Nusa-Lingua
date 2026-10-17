"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { cn } from "@/lib/utils";

const ANCHORS = [
  ["#fitur", "Fitur"],
  ["#bahasa", "Bahasa"],
  ["#coba", "Coba Soal"],
  ["#faq", "FAQ"],
] as const;

export function LandingNavbar({ user }: { user: { name: string | null; avatarUrl: string | null } | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "border-b bg-white/90 shadow-sm backdrop-blur-xl dark:bg-background/90"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-16 items-center gap-3">
        <Logo />
        <nav aria-label="Navigasi halaman" className="ml-6 hidden items-center gap-1 lg:flex">
          {ANCHORS.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-bold transition-colors",
                "text-muted-foreground hover:bg-primary/8 hover:text-primary",
              )}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          {user ? (
            <>
              <Link href="/profil" aria-label="Profil saya" className="hidden rounded-full sm:block">
                <UserAvatar name={user.name} src={user.avatarUrl} className="size-9" />
              </Link>
              <Button asChild size="sm" className="rounded-full bg-primary-600 px-5 font-bold text-white">
                <Link href="/beranda">Lanjut Belajar</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden rounded-full font-bold sm:inline-flex">
                <Link href="/masuk">Masuk</Link>
              </Button>
              <Button asChild size="sm" className="hidden rounded-full bg-primary-600 px-5 font-bold text-white sm:inline-flex">
                <Link href="/daftar">Mulai Belajar</Link>
              </Button>
            </>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Buka menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigasi halaman Nusa Lingua</SheetDescription>
              </SheetHeader>
              <nav aria-label="Navigasi halaman (seluler)" className="flex flex-col gap-1">
                {ANCHORS.map(([href, label]) => (
                  <SheetClose asChild key={href}>
                    <a href={href} className="rounded-xl px-3 py-3 font-bold hover:bg-muted">
                      {label}
                    </a>
                  </SheetClose>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t-2 pt-4">
                <div className="flex items-center justify-between rounded-2xl border-2 px-3 py-1">
                  <span className="text-sm font-bold">Tema</span>
                  <ThemeToggle />
                </div>
                {user ? (
                  <Button asChild block>
                    <Link href="/beranda">Lanjut Belajar</Link>
                  </Button>
                ) : (
                  <>
                    <Button asChild block>
                      <Link href="/daftar">Mulai Belajar</Link>
                    </Button>
                    <Button asChild block variant="outline">
                      <Link href="/masuk">Masuk</Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
