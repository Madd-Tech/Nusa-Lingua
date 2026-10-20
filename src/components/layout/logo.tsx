import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logo mark — menggunakan gambar logo leaf emblem dari folder Media */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/media/logo/nusa-lingua-logo.png"
      alt="Nusa Lingua"
      width={161}
      height={100}
      className={cn("h-11 w-auto max-w-full object-contain", className)}
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
          width={161}
          height={100}
          className="size-11 object-contain"
          priority
        />
      ) : (
        <Image
          src="/media/logo/nusa-lingua-logo.png"
          alt="Nusa Lingua"
          width={161}
          height={100}
          className="h-11 w-auto sm:h-12"
          priority
        />
      )}
    </Link>
  );
}
