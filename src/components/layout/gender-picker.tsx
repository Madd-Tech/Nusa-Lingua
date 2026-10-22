"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Check } from "lucide-react";
import { GENDER_OPTIONS } from "@/lib/constants";
import type { Enums } from "@/types/database";
import { cn } from "@/lib/utils";

type Gender = Enums<"user_gender">;

/** Pilihan jenis kelamin — dipakai asisten AI untuk memanggil pengguna (mis. "Mas"/"Mbak"). */
export const GenderPicker = forwardRef<
  HTMLDivElement,
  Omit<ComponentPropsWithoutRef<"div">, "onChange"> & { value: Gender | null | undefined; onChange: (v: Gender) => void }
>(function GenderPicker({ value, onChange, className, ...props }, ref) {
  return (
    <div ref={ref} role="radiogroup" className={cn("grid grid-cols-2 gap-2", className)} {...props}>
      {GENDER_OPTIONS.map((g) => {
        const selected = value === g.value;
        return (
          <button
            key={g.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(g.value)}
            className={cn(
              "flex items-center justify-between gap-2 rounded-2xl border-2 border-b-4 bg-card px-4 py-3 text-left font-bold transition-colors",
              selected ? "border-primary bg-primary/10" : "hover:bg-muted",
            )}
          >
            {g.label}
            {selected ? <Check aria-hidden="true" className="size-5 text-primary" /> : null}
          </button>
        );
      })}
    </div>
  );
});
