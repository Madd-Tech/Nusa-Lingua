"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RemoteImage } from "@/components/ui/remote-image";
import { ArticleIllustration } from "@/components/culture/article-illustration";
import { uploadCultureImage } from "@/lib/upload-culture-image";

/** Sampul artikel: unggah ke bucket `budaya`, atau kosong (memakai ilustrasi bawaan per kategori). */
export function CoverField({
  value,
  onChange,
  userId,
  slug,
  category,
  disabled,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  userId: string;
  slug: string;
  category: string;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const res = await uploadCultureImage(file, userId);
    setUploading(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    onChange(res.url);
  };

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-2xl border-2 bg-budaya/10">
        {value ? (
          <RemoteImage src={value} alt="Sampul artikel" className="aspect-[16/9] w-full" />
        ) : (
          <ArticleIllustration slug={slug} category={category} className="aspect-[16/9] w-full" />
        )}
      </div>
      {!value ? <p className="text-xs text-muted-foreground">Tanpa sampul, artikel memakai ilustrasi bawaan kategorinya.</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => input.current?.click()} disabled={disabled || uploading}>
          <ImagePlus aria-hidden="true" /> {uploading ? "Mengunggah…" : value ? "Ganti sampul" : "Unggah sampul"}
        </Button>
        {value ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(null)} disabled={disabled || uploading}>
            <Trash2 aria-hidden="true" /> Hapus
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-muted-foreground">PNG, JPG, atau WebP · maks. 5 MB · rasio 16:9 paling pas.</p>
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
