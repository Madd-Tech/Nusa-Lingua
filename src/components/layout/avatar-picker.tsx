"use client";
import { useRef, useState } from "react";
import { Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { PRESET_AVATARS, uploadAvatar } from "@/lib/avatars";
import { cn } from "@/lib/utils";

export function AvatarPicker({
  userId,
  name,
  value,
  onChange,
}: {
  userId: string;
  name: string | null;
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(createClient(), userId, file);
      onChange(url);
      toast.success("Foto berhasil diunggah");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const isPreset = PRESET_AVATARS.some((p) => p.src === value);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <UserAvatar name={name} src={value} className="size-20 border-4 text-2xl" />
        <div className="space-y-1">
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload aria-hidden="true" /> {uploading ? "Mengunggah…" : "Unggah foto"}
          </Button>
          <p className="text-xs text-muted-foreground">JPG/PNG/WebP, maks. 2 MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </div>
      </div>
      <div role="radiogroup" aria-label="Avatar bawaan" className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {PRESET_AVATARS.map((p) => {
          const selected = value === p.src;
          return (
            <button
              key={p.src}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Avatar ${p.label}`}
              onClick={() => onChange(selected ? null : p.src)}
              className={cn(
                "relative aspect-square rounded-full border-4 transition-transform hover:scale-105",
                selected ? "border-primary" : "border-transparent",
              )}
            >
              <img src={p.src} alt="" className="h-full w-full rounded-full" />
              {selected ? (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary-600 text-white">
                  <Check aria-hidden="true" className="size-3" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {value && !isPreset ? <p className="text-xs text-muted-foreground">Memakai foto unggahanmu.</p> : null}
    </div>
  );
}
