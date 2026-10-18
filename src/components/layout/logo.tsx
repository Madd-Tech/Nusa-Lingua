import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo mark — menggunakan gambar logo leaf emblem dari folder Media */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/media/logo/nusa-lingua-logo.png"
      alt="Nusa Lingua"
      width={160}
      height={80}
      className={cn("h-9 w-auto", className)}
      priority
    />
  );
}

export function Logo({ href = "/", className, compact }: { href?: string; className?: string; compact?: boolean }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 rounded-xl", className)}
      aria-label="Nusa Lingua — halaman utama"
    >
      {compact ? (
        <Image
          src="/media/logo/nusa-lingua-logo.png"
          alt="Nusa Lingua"
          width={36}
          height={36}
          className="size-9 object-contain"
          priority
        />
      ) : (
        <Image
          src="/media/logo/nusa-lingua-logo.png"
          alt="Nusa Lingua"
          width={160}
          height={80}
          className="h-9 w-auto"
          priority
        />
      )}
    </Link>
  );
}
