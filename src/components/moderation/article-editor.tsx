"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";
import { Archive, ArchiveRestore, ExternalLink, Eye, PencilLine, Save, Send, Trash2, Undo2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { SelectFilter } from "@/components/ui/select-filter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArticleChecklist, countWords } from "@/components/moderation/article-checklist";
import { ArticlePreview } from "@/components/moderation/article-preview";
import { ArticleStatusBadge } from "@/components/moderation/article-status-badge";
import { CoverField } from "@/components/moderation/cover-field";
import { MarkdownEditor } from "@/components/moderation/markdown-editor";
import { ReturnArticleDialog } from "@/components/moderation/return-article-dialog";
import { createClient } from "@/lib/supabase/client";
import { ARTICLE_CATEGORIES } from "@/lib/constants";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import { articleSchema } from "@/lib/validation";
import type { Enums } from "@/types/database";
import { formatRelative } from "@/lib/utils";

type Values = z.infer<typeof articleSchema>;
type Status = Enums<"article_status">;

export type EditorLanguage = { id: number; name: string; code: string; region_id: number | null };
export type EditorRegion = { id: number; name: string; province: string | null };
export type EditorArticle = {
  id: number;
  title: string;
  slug: string;
  category: Enums<"article_category">;
  language_id: number | null;
  region_id: number | null;
  summary: string | null;
  content: string;
  sources: string | null;
  cover_url: string | null;
  status: Status;
  author_id: string | null;
  author_username: string | null;
  editor_username: string | null;
  updated_at: string | null;
  created_at: string;
  published_at: string | null;
  review_note: string | null;
};

const MIN_REVIEW_WORDS = 50;

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

type Confirm = { title: string; description: string; label: string; destructive?: boolean; run: () => Promise<boolean> };

/**
 * Editor artikel budaya: tulis (Markdown) + pratinjau, sampul, rujukan, dan aksi status.
 * Aturan transisi & empat mata ditegakkan trigger database; tombol di sini hanya mengikutinya.
 */
export function ArticleEditor({
  userId,
  isAdmin,
  languages,
  regions,
  article,
}: {
  userId: string;
  isAdmin: boolean;
  languages: EditorLanguage[];
  regions: EditorRegion[];
  /** Kosong = artikel baru. */
  article?: EditorArticle;
}) {
  const router = useRouter();
  const [tab, setTab] = useState("tulis");
  const [busy, setBusy] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [slugTouched, setSlugTouched] = useState(!!article);
  const [regionTouched, setRegionTouched] = useState(!!article);

  const status: Status | null = article?.status ?? null;
  const isAuthor = !!article && article.author_id === userId;
  const slugLocked = !!article?.published_at;
  const readOnly = status === "archived";

  const defaultLanguage = article?.language_id ?? (languages.length === 1 ? languages[0].id : 0);
  const form = useForm<Values>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title ?? "",
      slug: article?.slug ?? "",
      category: article?.category ?? "lainnya",
      languageId: defaultLanguage,
      regionId: article?.region_id ?? languages.find((l) => l.id === defaultLanguage)?.region_id ?? 0,
      summary: article?.summary ?? "",
      content: article?.content ?? "",
      sources: article?.sources ?? "",
      coverUrl: article?.cover_url ?? null,
    },
  });
  const values = form.watch();
  const dirty = form.formState.isDirty;

  useEffect(() => {
    if (!dirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const fail = (error: PostgrestError) => {
    if (error.code === "23505") {
      form.setError("slug", { message: "Slug sudah dipakai artikel lain" });
      setTab("tulis");
      toast.error("Slug sudah dipakai artikel lain.");
    } else if (error.code === "23514") {
      toast.error("Ada isian yang melebihi batas panjang.");
    } else {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan artikel. Coba lagi."));
    }
    return false;
  };

  const toRow = (v: Values) => ({
    title: v.title.trim(),
    slug: v.slug,
    category: v.category,
    language_id: v.languageId,
    region_id: v.regionId || null,
    summary: v.summary?.trim() || null,
    content: v.content,
    sources: v.sources?.trim() || null,
    cover_url: v.coverUrl,
  });

  /** Simpan isi form, sekaligus transisi status bila ada. */
  const persist = async (v: Values, transition: { status: Status; review_note?: string } | null, success: string) => {
    setBusy(true);
    const supabase = createClient();
    try {
      if (!article) {
        const { data, error } = await supabase.from("cultural_articles").insert(toRow(v)).select("id").single();
        if (error) return fail(error);
        form.reset(v);
        toast.success(success);
        router.replace(`/moderasi/artikel/${data.id}`);
        return true;
      }
      const { data, error } = await supabase
        .from("cultural_articles")
        .update({ ...toRow(v), ...(transition ?? {}) })
        .eq("id", article.id)
        .select("id")
        .maybeSingle();
      if (error) return fail(error);
      if (!data) {
        toast.error("Artikel tidak bisa disimpan. Mungkin di luar bahasa yang kamu moderasi.");
        return false;
      }
      form.reset(v);
      toast.success(success);
      router.refresh();
      return true;
    } finally {
      setBusy(false);
    }
  };

  const readyForReview = (v: Values) => {
    let ok = true;
    if (!v.summary?.trim()) {
      form.setError("summary", { message: "Ringkasan wajib diisi sebelum diajukan" });
      ok = false;
    }
    if (countWords(v.content) < MIN_REVIEW_WORDS) {
      form.setError("content", { message: `Isi artikel minimal ${MIN_REVIEW_WORDS} kata sebelum diajukan` });
      ok = false;
    }
    if (!ok) {
      setTab("tulis");
      toast.error("Lengkapi artikel sebelum diajukan.");
    }
    return ok;
  };

  /** Validasi form lalu jalankan aksi; kembalikan hasilnya untuk dialog konfirmasi. */
  const submit = (action: (v: Values) => Promise<boolean>) =>
    new Promise<boolean>((resolve) => {
      void form.handleSubmit(
        async (v) => resolve(await action(v)),
        () => {
          setTab("tulis");
          toast.error("Periksa lagi isian yang ditandai.");
          resolve(false);
        },
      )();
    });

  const saveDraft = () => submit((v) => persist(v, null, article ? "Perubahan tersimpan" : "Draf tersimpan"));
  const sendToReview = () =>
    submit((v) => (readyForReview(v) ? persist(v, { status: "review" }, "Artikel diajukan untuk ditinjau") : Promise.resolve(false)));
  const transition = (to: Status, success: string, note?: string) =>
    submit((v) => persist(v, { status: to, ...(note ? { review_note: note } : {}) }, success));

  const removeDraft = async () => {
    if (!article) return false;
    setBusy(true);
    const { data, error } = await createClient().from("cultural_articles").delete().eq("id", article.id).select("id");
    setBusy(false);
    if (error || !data?.length) {
      toast.error("Draf tidak bisa dihapus. Hanya penulis atau admin yang bisa menghapus draf.");
      return false;
    }
    form.reset();
    toast.success("Draf dihapus");
    router.replace("/moderasi/artikel?status=draft");
    return true;
  };

  const language = languages.find((l) => l.id === values.languageId);
  const region = regions.find((r) => r.id === values.regionId);
  const canPublish = status === "review" && (!isAuthor || isAdmin);

  return (
    <div className="space-y-5">
      {article ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <ArticleStatusBadge status={article.status} />
          <span>
            Ditulis oleh {article.author_username ? `@${article.author_username}` : "tim Nusa Lingua"}
            {article.updated_at
              ? ` · diperbarui ${formatRelative(article.updated_at)}${article.editor_username ? ` oleh @${article.editor_username}` : ""}`
              : ` · dibuat ${formatRelative(article.created_at)}`}
          </span>
          {article.status === "published" ? (
            <Link href={`/budaya/${article.slug}`} className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
              Lihat artikel <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {status === "draft" && article?.review_note ? (
        <div role="note" className="rounded-2xl border-2 border-secondary/50 bg-secondary/10 p-4 text-sm">
          <p className="font-extrabold">Catatan dari peninjau</p>
          <p className="mt-1 whitespace-pre-line">{article.review_note}</p>
        </div>
      ) : null}
      {status === "review" && isAuthor && !isAdmin ? (
        <p role="note" className="rounded-2xl border-2 bg-muted px-4 py-3 text-sm">
          Artikelmu sedang menunggu tinjauan. Moderator lain di bahasa ini yang akan menerbitkannya.
        </p>
      ) : null}
      {readOnly ? (
        <p role="note" className="rounded-2xl border-2 bg-muted px-4 py-3 text-sm">
          Artikel ini diarsipkan dan tidak tampil di halaman Budaya. Pulihkan ke draf untuk mengeditnya lagi.
        </p>
      ) : null}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Mode editor">
          <TabsTrigger value="tulis">
            <PencilLine aria-hidden="true" className="size-4" /> Tulis
          </TabsTrigger>
          <TabsTrigger value="pratinjau">
            <Eye aria-hidden="true" className="size-4" /> Pratinjau
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tulis" className="mt-4">
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              <fieldset disabled={readOnly || busy} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0 space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="off"
                            placeholder="mis. Angklung: Bambu yang Bernyanyi"
                            onChange={(e) => {
                              field.onChange(e);
                              if (!slugTouched && !slugLocked) {
                                form.setValue("slug", slugifyTitle(e.target.value), { shouldDirty: true });
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (alamat artikel)</FormLabel>
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 text-sm font-semibold text-muted-foreground">/budaya/</span>
                          <FormControl>
                            <Input
                              {...field}
                              autoComplete="off"
                              readOnly={slugLocked}
                              onChange={(e) => {
                                setSlugTouched(true);
                                field.onChange(e.target.value.toLowerCase());
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          {slugLocked
                            ? "Artikel ini pernah terbit, jadi alamatnya dikunci agar tautan lama tidak rusak."
                            : "Dibuat otomatis dari judul. Huruf kecil, angka, dan tanda hubung."}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ringkasan</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={2} maxLength={300} placeholder="Satu-dua kalimat yang tampil di kartu artikel." />
                        </FormControl>
                        <FormDescription>{(values.summary ?? "").length}/300</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Isi artikel</FormLabel>
                        <FormControl>
                          <MarkdownEditor
                            ref={field.ref}
                            value={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            userId={userId}
                            disabled={readOnly || busy}
                            invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormDescription>
                          {countWords(values.content)} kata · pakai <code>##</code> untuk subjudul agar daftar isi muncul.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rujukan</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={4}
                            className="font-mono text-sm"
                            placeholder={"- Penulis, *Judul Buku* (Penerbit, 2020)\n- [Judul halaman](https://...)\n- Wawancara dengan budayawan setempat, 2026"}
                          />
                        </FormControl>
                        <FormDescription>Satu sumber per baris (Markdown). Ditampilkan di bawah artikel.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <aside className="space-y-5">
                  <FormField
                    control={form.control}
                    name="coverUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sampul</FormLabel>
                        <CoverField
                          value={field.value}
                          onChange={(url) => field.onChange(url)}
                          userId={userId}
                          slug={values.slug}
                          category={values.category}
                          disabled={readOnly || busy}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori</FormLabel>
                        <FormControl>
                          <SelectFilter
                            value={field.value}
                            onValueChange={(v) => field.onChange(v)}
                            options={ARTICLE_CATEGORIES.map((c) => ({ value: c.value, label: c.label }))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="languageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bahasa</FormLabel>
                        <FormControl>
                          <SelectFilter
                            value={field.value ? String(field.value) : ""}
                            placeholder="Pilih bahasa…"
                            onValueChange={(v) => {
                              const id = Number(v);
                              field.onChange(id);
                              const regionId = languages.find((l) => l.id === id)?.region_id;
                              if (!regionTouched && regionId) form.setValue("regionId", regionId, { shouldDirty: true });
                            }}
                            options={languages.map((l) => ({ value: String(l.id), label: l.name }))}
                          />
                        </FormControl>
                        <FormDescription>Hanya bahasa yang kamu moderasi.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="regionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daerah</FormLabel>
                        <FormControl>
                          <SelectFilter
                            value={String(field.value ?? 0)}
                            onValueChange={(v) => {
                              setRegionTouched(true);
                              field.onChange(Number(v));
                            }}
                            options={[
                              { value: "0", label: "Tanpa daerah" },
                              ...regions.map((r) => ({ value: String(r.id), label: r.province ? `${r.name}, ${r.province}` : r.name })),
                            ]}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ArticleChecklist summary={values.summary} content={values.content} sources={values.sources} coverUrl={values.coverUrl} />
                </aside>
              </fieldset>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="pratinjau" className="mt-4">
          <ArticlePreview
            title={values.title}
            slug={values.slug}
            category={values.category}
            summary={values.summary}
            content={values.content}
            sources={values.sources}
            coverUrl={values.coverUrl}
            languageName={language?.name}
            regionName={region ? [region.name, region.province].filter(Boolean).join(", ") : undefined}
          />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-24 z-20 flex flex-wrap items-center justify-end gap-2 rounded-2xl border-2 bg-card/95 p-3 shadow-lift backdrop-blur md:bottom-4">
        {dirty ? <span className="mr-auto text-sm font-semibold text-muted-foreground">Ada perubahan belum disimpan</span> : null}

        {!article ? (
          <Button variant="budaya" onClick={saveDraft} disabled={busy}>
            <Save aria-hidden="true" /> Simpan draf
          </Button>
        ) : null}

        {status === "draft" ? (
          <>
            {isAuthor || isAdmin ? (
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() =>
                  setConfirm({
                    title: "Hapus draf ini?",
                    description: "Draf dihapus permanen dan tidak bisa dikembalikan.",
                    label: "Hapus draf",
                    destructive: true,
                    run: removeDraft,
                  })
                }
              >
                <Trash2 aria-hidden="true" /> Hapus
              </Button>
            ) : null}
            <Button variant="outline" onClick={saveDraft} disabled={busy}>
              <Save aria-hidden="true" /> Simpan draf
            </Button>
            <Button variant="budaya" onClick={sendToReview} disabled={busy}>
              <Send aria-hidden="true" /> Ajukan tinjauan
            </Button>
          </>
        ) : null}

        {status === "review" ? (
          <>
            {isAuthor ? (
              <Button variant="ghost" onClick={() => transition("draft", "Artikel ditarik ke draf")} disabled={busy}>
                <Undo2 aria-hidden="true" /> Tarik ke draf
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setReturnOpen(true)} disabled={busy}>
                <Undo2 aria-hidden="true" /> Kembalikan ke draf
              </Button>
            )}
            <Button variant="outline" onClick={saveDraft} disabled={busy}>
              <Save aria-hidden="true" /> Simpan perubahan
            </Button>
            {canPublish ? (
              <Button
                variant="budaya"
                disabled={busy}
                onClick={() =>
                  setConfirm({
                    title: "Terbitkan artikel ini?",
                    description: "Artikel langsung tampil di halaman Budaya untuk semua pelajar.",
                    label: "Terbitkan",
                    run: () => transition("published", "Artikel terbit"),
                  })
                }
              >
                <Upload aria-hidden="true" /> Terbitkan
              </Button>
            ) : null}
          </>
        ) : null}

        {status === "published" ? (
          <>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                setConfirm({
                  title: "Tarik dari publikasi?",
                  description: "Artikel kembali menjadi draf dan tidak tampil di halaman Budaya sampai diterbitkan lagi.",
                  label: "Tarik ke draf",
                  run: () => transition("draft", "Artikel ditarik dari publikasi"),
                })
              }
            >
              <Undo2 aria-hidden="true" /> Tarik
            </Button>
            <Button
              variant="ghost"
              disabled={busy}
              onClick={() =>
                setConfirm({
                  title: "Arsipkan artikel ini?",
                  description: "Artikel disembunyikan dari halaman Budaya. Arsip bisa dipulihkan ke draf kapan saja.",
                  label: "Arsipkan",
                  destructive: true,
                  run: () => transition("archived", "Artikel diarsipkan"),
                })
              }
            >
              <Archive aria-hidden="true" /> Arsipkan
            </Button>
            <Button variant="budaya" onClick={saveDraft} disabled={busy}>
              <Save aria-hidden="true" /> Simpan perubahan
            </Button>
          </>
        ) : null}

        {status === "archived" ? (
          <Button variant="budaya" onClick={() => transition("draft", "Artikel dipulihkan ke draf")} disabled={busy}>
            <ArchiveRestore aria-hidden="true" /> Pulihkan ke draf
          </Button>
        ) : null}
      </div>

      {article ? (
        <ReturnArticleDialog
          open={returnOpen}
          onOpenChange={setReturnOpen}
          title={article.title}
          onSubmit={(note) => transition("draft", "Artikel dikembalikan ke penulis", note)}
        />
      ) : null}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent hideClose>
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)} disabled={busy}>
              Batal
            </Button>
            <Button
              variant={confirm?.destructive ? "destructive" : "budaya"}
              disabled={busy}
              onClick={async () => {
                if (confirm && (await confirm.run())) setConfirm(null);
              }}
            >
              {busy ? "Memproses…" : confirm?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
