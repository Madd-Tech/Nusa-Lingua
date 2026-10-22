"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, Quote, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/input";
import { uploadCultureImage } from "@/lib/upload-culture-image";
import { cn } from "@/lib/utils";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  userId: string;
  disabled?: boolean;
  invalid?: boolean;
  /** Diteruskan ke textarea (diisi otomatis oleh FormControl). */
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

/** Textarea Markdown dengan toolbar sederhana (subjudul, tebal, miring, kutipan, daftar, tautan, gambar). */
export const MarkdownEditor = forwardRef<HTMLTextAreaElement, Props>(function MarkdownEditor(
  { id, value, onChange, onBlur, userId, disabled, invalid, "aria-describedby": describedBy, "aria-invalid": ariaInvalid },
  ref,
) {
  const isInvalid = invalid || ariaInvalid;
  const area = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  useImperativeHandle(ref, () => area.current as HTMLTextAreaElement);

  /** Ganti seleksi [start, end) lalu pilih ulang bagian `select` (relatif terhadap teks sisipan). */
  const replace = (start: number, end: number, insert: string, select: [number, number]) => {
    onChange(value.slice(0, start) + insert + value.slice(end));
    requestAnimationFrame(() => {
      const el = area.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + select[0], start + select[1]);
    });
  };

  const wrap = (before: string, after: string, placeholder: string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const text = value.slice(s, e) || placeholder;
    replace(s, e, `${before}${text}${after}`, [before.length, before.length + text.length]);
  };

  const prefixLine = (prefix: string, placeholder: string) => {
    const el = area.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const text = value.slice(lineStart, e) || placeholder;
    const lines = text.split("\n").map((l) => `${prefix}${l.replace(/^(#{1,6}\s|>\s|-\s)/, "")}`);
    const insert = lines.join("\n");
    replace(lineStart, e, insert, [prefix.length, insert.length]);
  };

  const insertImage = async (file: File) => {
    setUploading(true);
    const res = await uploadCultureImage(file, userId);
    setUploading(false);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    const el = area.current;
    const pos = el ? el.selectionEnd : value.length;
    const alt = "keterangan gambar";
    const insert = `${pos > 0 && value[pos - 1] !== "\n" ? "\n\n" : ""}![${alt}](${res.url})\n`;
    const offset = insert.indexOf(alt);
    replace(pos, pos, insert, [offset, offset + alt.length]);
  };

  const tools: { label: string; icon: LucideIcon; run: () => void }[] = [
    { label: "Subjudul", icon: Heading2, run: () => prefixLine("## ", "Subjudul") },
    { label: "Sub-subjudul", icon: Heading3, run: () => prefixLine("### ", "Sub-subjudul") },
    { label: "Tebal", icon: Bold, run: () => wrap("**", "**", "teks tebal") },
    { label: "Miring", icon: Italic, run: () => wrap("_", "_", "teks miring") },
    { label: "Kutipan", icon: Quote, run: () => prefixLine("> ", "Kutipan") },
    { label: "Daftar", icon: List, run: () => prefixLine("- ", "Butir daftar") },
    { label: "Tautan", icon: Link2, run: () => wrap("[", "](https://)", "teks tautan") },
  ];

  return (
    <div className={cn("overflow-hidden rounded-2xl border-2 border-input bg-card", isInvalid && "border-danger")}>
      <div role="toolbar" aria-label="Format Markdown" className="flex flex-wrap gap-0.5 border-b-2 bg-muted/50 p-1">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.run}
            disabled={disabled}
            title={t.label}
            aria-label={t.label}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <t.icon aria-hidden="true" className="size-4" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={disabled || uploading}
          title="Sisipkan gambar"
          aria-label="Sisipkan gambar"
          className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-bold text-muted-foreground hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          <ImagePlus aria-hidden="true" className="size-4" />
          <span className="hidden sm:inline">{uploading ? "Mengunggah…" : "Gambar"}</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void insertImage(file);
          }}
        />
      </div>
      <Textarea
        ref={area}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={isInvalid || undefined}
        aria-describedby={describedBy}
        rows={22}
        spellCheck
        className="min-h-[24rem] resize-y rounded-none border-0 font-mono text-[0.9375rem] leading-relaxed focus-visible:ring-0"
        placeholder={"Tulis isi artikel dengan Markdown.\n\n## Subjudul pertama\nParagraf…"}
      />
    </div>
  );
});
