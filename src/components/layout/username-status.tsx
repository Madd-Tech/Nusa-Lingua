import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import type { UsernameStatus } from "@/hooks/use-username-check";

/** Status ketersediaan username: ikon + teks, diumumkan ke pembaca layar. */
export function UsernameStatusText({ status }: { status: UsernameStatus }) {
  return (
    <p aria-live="polite" className="flex min-h-5 items-center gap-1.5 text-sm font-semibold">
      {status === "checking" ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">Mengecek ketersediaan…</span>
        </>
      ) : status === "available" ? (
        <>
          <CheckCircle2 aria-hidden="true" className="size-4 text-success-700 dark:text-success" />
          <span className="text-success-700 dark:text-success">Username tersedia</span>
        </>
      ) : status === "taken" ? (
        <>
          <XCircle aria-hidden="true" className="size-4 text-danger-700 dark:text-danger" />
          <span className="text-danger-700 dark:text-danger">Username sudah dipakai</span>
        </>
      ) : status === "error" ? (
        <span className="text-muted-foreground">Ketersediaan belum bisa dicek — akan dicek saat menyimpan.</span>
      ) : null}
    </p>
  );
}
