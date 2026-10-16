"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IlloOops } from "@/components/illustrations";
import { cn } from "@/lib/utils";

/** State error: pesan ramah + tombol "Coba lagi". */
export function ErrorState({
  title = "Waduh, ada yang tidak beres",
  description = "Kami gagal memuat data. Periksa koneksi internetmu, lalu coba lagi.",
  onRetry,
  retrying,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-3xl border-2 bg-card px-6 py-10 text-center",
        className,
      )}
    >
      <IlloOops />
      <h3 className="text-lg font-extrabold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button onClick={onRetry} disabled={retrying} className="mt-2">
          <RotateCcw aria-hidden="true" className={cn(retrying && "animate-spin")} />
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}
