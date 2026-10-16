"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Daftar isi sticky dengan penanda bagian yang sedang dibaca. */
export function TableOfContents({ headings }: { headings: { level: 2 | 3; text: string; id: string }[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = headings.map((h) => document.getElementById(h.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    els.forEach((e) => obs.observe(e));
    return () => obs.disconnect();
  }, [headings]);

  return (
    <nav aria-label="Daftar isi" className="sticky top-24 space-y-2">
      <p className="text-xs font-extrabold uppercase tracking-wide text-muted-foreground">Daftar isi</p>
      <ul className="space-y-1 border-l-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              className={cn(
                "-ml-0.5 block border-l-2 border-transparent py-1 text-sm transition-colors hover:text-foreground",
                h.level === 3 ? "pl-6" : "pl-3",
                active === h.id ? "border-budaya font-bold text-foreground" : "text-muted-foreground",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
