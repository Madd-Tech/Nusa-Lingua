"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SelectFilter, type SelectFilterOption } from "@/components/ui/select-filter";

/**
 * Dropdown filter yang menulis satu query param (mis. `bahasa`, `aksi`) lalu
 * mengulang paginasi dari halaman 1. Opsi bernilai "" berarti param dihapus.
 */
export function ParamSelect({
  param,
  label,
  value,
  options,
  className = "h-11 sm:w-52",
}: {
  param: string;
  /** Label untuk pembaca layar. */
  label: string;
  value: string;
  options: SelectFilterOption[];
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = `filter-${param}`;

  const change = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set(param, next);
    else params.delete(param);
    params.delete("hal");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <SelectFilter id={id} value={value} onValueChange={change} placeholder={options[0]?.label} className={className} options={options} />
    </div>
  );
}
