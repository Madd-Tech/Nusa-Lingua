"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageIcon } from "@/components/learning/language-icon";
import { setActiveLanguageCookie } from "@/lib/active-language";

export type PickerLanguage = { code: string; name: string; icon_url: string | null };

/** Pemilih bahasa aktif (dari user_languages). Disimpan di cookie agar dibaca server. */
export function LanguagePicker({ languages, activeCode }: { languages: PickerLanguage[]; activeCode: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const active = languages.find((l) => l.code === activeCode) ?? languages[0];

  if (!active) {
    return (
      <Link href="/belajar" className="inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-sm font-bold hover:bg-muted">
        <Plus aria-hidden="true" className="size-4" /> Pilih bahasa
      </Link>
    );
  }

  const choose = (code: string) => {
    setActiveLanguageCookie(code);
    if (pathname.startsWith("/belajar/") || pathname.startsWith("/kamus/")) {
      router.push(pathname.startsWith("/kamus/") ? `/kamus/${code}` : `/belajar/${code}`);
    }
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-transparent px-1.5 py-1 text-sm font-bold hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Bahasa aktif: ${active.name}. Ganti bahasa`}
      >
        <LanguageIcon name={active.name} code={active.code} iconUrl={active.icon_url} className="size-8 rounded-lg text-xs" />
        <span className="hidden max-w-[8rem] truncate sm:inline">{active.name}</span>
        <ChevronDown aria-hidden="true" className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bahasa aktif</DropdownMenuLabel>
        {languages.map((l) => (
          <DropdownMenuItem key={l.code} onSelect={() => choose(l.code)}>
            <LanguageIcon name={l.name} code={l.code} iconUrl={l.icon_url} className="size-7 rounded-lg text-xs" />
            <span className="flex-1">{l.name}</span>
            {l.code === active.code ? <Check aria-label="dipilih" className="text-primary" /> : null}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/belajar">
            <Plus aria-hidden="true" /> Tambah bahasa
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
