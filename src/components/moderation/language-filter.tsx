"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NativeSelect } from "@/components/ui/input";
import type { ScopeLanguage } from "@/lib/queries/moderation";

/** Filter bahasa (param `bahasa`), mengulang paginasi dari halaman 1. */
export function LanguageFilter({ languages, value }: { languages: ScopeLanguage[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const change = (code: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (code) params.set("bahasa", code);
    else params.delete("bahasa");
    params.delete("hal");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div>
      <label htmlFor="filter-bahasa" className="sr-only">
        Bahasa
      </label>
      <NativeSelect id="filter-bahasa" value={value} onChange={(e) => change(e.target.value)} className="h-11 sm:w-52">
        <option value="">Semua bahasa</option>
        {languages.map((l) => (
          <option key={l.id} value={l.code}>
            {l.name}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
