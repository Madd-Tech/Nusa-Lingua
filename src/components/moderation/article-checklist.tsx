import { CheckCircle2, Circle } from "lucide-react";
import { extractHeadings } from "@/lib/markdown-toc";
import { cn } from "@/lib/utils";

export const MIN_ARTICLE_WORDS = 300;

export function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** Daftar periksa sebelum diajukan. Hanya pengingat, tidak memblokir. */
export function ArticleChecklist({
  summary,
  content,
  sources,
  coverUrl,
}: {
  summary?: string;
  content: string;
  sources?: string;
  coverUrl: string | null;
}) {
  const words = countWords(content);
  const subheadings = extractHeadings(content).filter((h) => h.level === 2).length;
  const items = [
    { ok: !!summary?.trim(), label: "Ringkasan terisi" },
    { ok: subheadings >= 2, label: `Minimal 2 subjudul ## (sekarang ${subheadings})`, hint: "Agar daftar isi muncul" },
    { ok: words >= MIN_ARTICLE_WORDS, label: `±${MIN_ARTICLE_WORDS} kata (sekarang ${words})` },
    { ok: !!sources?.trim(), label: "Rujukan terisi" },
    { ok: !!coverUrl, label: "Sampul (opsional)" },
  ];

  return (
    <section aria-labelledby="checklist-heading" className="rounded-2xl border-2 bg-card p-4">
      <h3 id="checklist-heading" className="mb-2 text-sm font-extrabold">
        Daftar periksa
      </h3>
      <ul className="space-y-1.5 text-sm">
        {items.map((i) => (
          <li key={i.label} className={cn("flex items-start gap-2", !i.ok && "text-muted-foreground")}>
            {i.ok ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            ) : (
              <Circle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            )}
            <span>
              <span className="sr-only">{i.ok ? "Terpenuhi: " : "Belum: "}</span>
              {i.label}
              {i.hint && !i.ok ? <span className="block text-xs">{i.hint}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
