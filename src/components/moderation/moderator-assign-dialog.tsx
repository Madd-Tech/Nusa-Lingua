"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { sanitizeSearch } from "@/lib/queries/_shared";
import type { ScopeLanguage } from "@/lib/queries/moderation";
import { moderationErrorMessage } from "@/lib/moderation-errors";
import { cn } from "@/lib/utils";

type Candidate = { id: string; username: string | null; full_name: string | null; avatar_url: string | null };

/**
 * Tambah moderator baru (cari username) atau ubah bahasa moderator yang ada.
 * Menyimpan lewat RPC set_moderator_languages (khusus admin, ditegakkan database).
 */
export function ModeratorAssignDialog({
  languages,
  member,
}: {
  languages: ScopeLanguage[];
  /** Mode ubah. Kosong = mode tambah. */
  member?: { id: string; username: string | null; languageIds: number[] };
}) {
  const router = useRouter();
  const ids = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<Candidate | null>(null);
  const [langs, setLangs] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const isEdit = !!member;

  const openDialog = () => {
    setQuery("");
    setResults([]);
    setPicked(null);
    setLangs(new Set(member?.languageIds ?? []));
    setOpen(true);
  };

  useEffect(() => {
    if (isEdit || !open) return;
    const q = sanitizeSearch(query.toLowerCase());
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const { data } = await createClient()
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("role", "user")
        .ilike("username", `%${q}%`)
        .order("username")
        .limit(8);
      setResults(data ?? []);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, open, isEdit]);

  const toggle = (id: number, on: boolean) =>
    setLangs((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  const targetId = member?.id ?? picked?.id;
  const targetName = member?.username ?? picked?.username;

  const save = async () => {
    if (!targetId || langs.size === 0) return;
    setSaving(true);
    const { error } = await createClient().rpc("set_moderator_languages", {
      p_user: targetId,
      p_language_ids: Array.from(langs),
    });
    setSaving(false);
    if (error) {
      toast.error(moderationErrorMessage(error, "Gagal menyimpan penugasan. Coba lagi."));
      return;
    }
    toast.success(`@${targetName} kini memoderasi ${langs.size} bahasa`);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      {member ? (
        <Button size="sm" variant="outline" onClick={openDialog} aria-label={`Ubah bahasa @${member.username}`}>
          <PencilLine aria-hidden="true" /> Ubah bahasa
        </Button>
      ) : (
        <Button variant="komunitas" onClick={openDialog}>
          <UserPlus aria-hidden="true" /> Tambah moderator
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{member ? `Bahasa @${member.username}` : "Tambah moderator"}</DialogTitle>
            <DialogDescription>
              Moderator hanya bisa meninjau usulan dari bahasa yang dicentang. Pilih bahasa yang benar-benar ia kuasai.
            </DialogDescription>
          </DialogHeader>

          {!member ? (
            <div className="space-y-2">
              <label htmlFor={`${ids}-cari`} className="text-sm font-bold">
                Cari username
              </label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id={`${ids}-cari`}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="mis. sari_jogja"
                  autoComplete="off"
                  className="pl-11"
                />
              </div>
              {query.trim().length >= 2 && !searching && results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Tidak ada pelajar dengan username itu.</p>
              ) : null}
              {results.length ? (
                <ul role="radiogroup" aria-label="Pilih pengguna" className="space-y-1">
                  {results.map((c) => {
                    const selected = picked?.id === c.id;
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setPicked(c)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl border-2 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            selected ? "border-komunitas bg-komunitas/10" : "border-transparent hover:bg-muted",
                          )}
                        >
                          <UserAvatar name={c.username} src={c.avatar_url} className="size-8" />
                          <span className="min-w-0">
                            <span className="block truncate font-bold">@{c.username}</span>
                            {c.full_name ? <span className="block truncate text-xs text-muted-foreground">{c.full_name}</span> : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          ) : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold">Bahasa</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {languages.map((l) => {
                const id = `${ids}-lang-${l.id}`;
                return (
                  <div key={l.id} className="flex items-center gap-2.5 rounded-xl border-2 px-3 py-2">
                    <Checkbox id={id} checked={langs.has(l.id)} onCheckedChange={(v) => toggle(l.id, v === true)} />
                    <label htmlFor={id} className="flex-1 cursor-pointer text-sm font-semibold">
                      {l.name}
                    </label>
                  </div>
                );
              })}
            </div>
          </fieldset>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button variant="komunitas" onClick={save} disabled={saving || !targetId || langs.size === 0}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
