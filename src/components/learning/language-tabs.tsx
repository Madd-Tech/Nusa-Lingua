import Link from "next/link";
import { BookA, Route } from "lucide-react";
import { cn } from "@/lib/utils";

/** Tab navigasi per bahasa: Jalur (/belajar/<code>) | Kamus (/kamus/<code>). */
export function LanguageTabs({ code, active }: { code: string; active: "jalur" | "kamus" }) {
  const tabs = [
    { key: "jalur", label: "Jalur", href: `/belajar/${code}`, icon: Route },
    { key: "kamus", label: "Kamus", href: `/kamus/${code}`, icon: BookA },
  ] as const;
  return (
    <nav aria-label="Bagian bahasa" className="inline-flex gap-1 rounded-2xl border-2 bg-muted p-1">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={t.key === active ? "page" : undefined}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground transition-colors",
            t.key === active ? "bg-card text-foreground shadow-soft" : "hover:text-foreground",
          )}
        >
          <t.icon aria-hidden="true" className="size-4" /> {t.label}
        </Link>
      ))}
    </nav>
  );
}
