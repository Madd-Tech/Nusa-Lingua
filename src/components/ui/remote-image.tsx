/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

/**
 * Gambar dari URL database (bisa dari host mana saja: Supabase Storage, CDN, dll.)
 * Memakai <img> agar tidak perlu mendaftarkan setiap host di next.config.
 */
export function RemoteImage({
  src,
  alt,
  className,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}
