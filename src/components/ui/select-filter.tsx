"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SelectFilterOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectFilterProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "value" | "defaultValue" | "onChange" | "name"
> & {
  options: SelectFilterOption[];
  /** Nilai terkontrol. Bila diisi, komponen berada dalam mode controlled. */
  value?: string;
  /** Nilai awal untuk mode uncontrolled (mis. form GET). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Bila diisi, nilai disimpan di hidden input agar ikut terkirim bersama form. */
  name?: string;
  placeholder?: string;
};

/**
 * Dropdown filter bertema yang seragam dengan komponen Input dan dropdown
 * header. Mendukung mode uncontrolled (form GET) maupun controlled
 * (react-hook-form).
 */
export const SelectFilter = React.forwardRef<HTMLButtonElement, SelectFilterProps>(
  (
    { options, value, defaultValue, onValueChange, name, placeholder, className, disabled, ...props },
    ref,
  ) => {
    const controlled = value !== undefined;
    const [internal, setInternal] = React.useState(defaultValue ?? "");
    const [open, setOpen] = React.useState(false);
    const current = controlled ? value : internal;
    const selected = options.find((option) => option.value === current);
    const muted = !selected || selected.disabled;

    const choose = (next: string) => {
      if (!controlled) setInternal(next);
      onValueChange?.(next);
      setOpen(false);
    };

    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        {name ? <input type="hidden" name={name} value={current ?? ""} /> : null}
        <DropdownMenuTrigger
          ref={ref}
          disabled={disabled}
          className={cn(
            "group flex h-12 w-full items-center justify-between gap-2 rounded-2xl border-2 border-input bg-card px-4 pr-3 text-left text-base transition-colors",
            "hover:bg-muted/40 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
            "data-[state=open]:border-primary disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger",
            className,
          )}
          {...props}
        >
          <span className={cn("truncate", muted && "text-muted-foreground")}>
            {selected?.label ?? placeholder ?? "Pilih…"}
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-72 w-[var(--radix-dropdown-menu-trigger-width)] min-w-[12rem] overflow-y-auto"
        >
          {options.map((option) => {
            const active = option.value === current;
            return (
              <DropdownMenuItem
                key={option.value || "__empty"}
                disabled={option.disabled}
                onSelect={() => choose(option.value)}
                className={cn(active && "bg-muted/60")}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {active ? <Check aria-label="dipilih" className="text-primary" /> : null}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);
SelectFilter.displayName = "SelectFilter";
