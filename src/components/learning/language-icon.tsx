import { RemoteImage } from "@/components/ui/remote-image";
import { getAksara } from "@/lib/aksara";
import { cn } from "@/lib/utils";

const PALETTE = [
  "bg-primary-600 text-white",
  "bg-budaya-solid text-white",
  "bg-asisten-solid text-white",
  "bg-accent-600 text-white",
  "bg-secondary-600 text-ink",
  "bg-komunitas-solid text-white",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Ikon bahasa: gambar dari icon_url, glyph aksara tradisional Nusantara
 * (jika bahasa punya aksara: Jawa, Sunda, Bali, Lontara, Batak), atau
 * tile inisial berwarna (deterministik) sebagai fallback.
 */
export function LanguageIcon({
  name,
  code,
  iconUrl,
  className,
}: {
  name: string;
  /** Kode bahasa (kolom languages.code) — dipakai untuk memilih glyph aksara. */
  code?: string | null;
  iconUrl?: string | null;
  className?: string;
}) {
  if (iconUrl) {
    return (
      <span className={cn("block size-12 shrink-0 overflow-hidden rounded-2xl border-2 bg-card", className)}>
        <RemoteImage src={iconUrl} alt="" className="h-full w-full" />
      </span>
    );
  }

  const colorClass = PALETTE[hash(name) % PALETTE.length];
  const aksara = getAksara(code, name);
  if (aksara) {
    return (
      <span
        aria-hidden="true"
        title={aksara.label}
        className={cn(
          "flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl font-aksara leading-none",
          colorClass,
          className,
        )}
      >
        {/* Sedikit turun agar garis dasar aksara terlihat seimbang di tengah tile */}
        <span aria-hidden="true" className="translate-y-[0.05em] text-[1.45em]">
          {aksara.glyph}
        </span>
      </span>
    );
  }

  const label = name.replace(/^bahasa\s+/i, "").slice(0, 2);
  return (
    <span
      aria-hidden="true"
      className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold", colorClass, className)}
    >
      {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
    </span>
  );
}
