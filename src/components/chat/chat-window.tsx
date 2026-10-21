"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Languages, RotateCcw, SendHorizontal, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { PersonaMascotAnim } from "@/components/chat/persona-mascot";
import { MarkdownContent } from "@/components/culture/markdown-content";
import { splitBilingual } from "@/lib/bilingual";
import { USE_MOCK_CHAT } from "@/lib/env";
import { mockChatStream } from "@/lib/mock-chat";
import { getPersonaMascot } from "@/lib/persona-mascots";
import { cn } from "@/lib/utils";

export type ChatMsg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  status?: "streaming" | "error";
  errorText?: string;
};

const QUICK_PROMPTS = [
  "Ajari aku salam pagi",
  "Apa bedanya ngoko dan krama?",
  "Ceritakan legenda daerah ini",
  "Koreksi kalimatku: ",
];

const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });

class ChatHttpError extends Error {
  constructor(public status: number) {
    super(`HTTP ${status}`);
  }
}

function friendlyError(err: unknown) {
  if (err instanceof ChatHttpError) {
    if (err.status === 429) return "Kamu sudah mencapai batas pesan untuk sementara. Istirahat sejenak, lalu kirim ulang.";
    if (err.status === 401) return "Sesi login berakhir. Muat ulang halaman lalu masuk kembali.";
    if (err.status >= 500) return "Asisten sedang sibuk. Coba kirim ulang sebentar lagi.";
  }
  return "Balasan gagal dimuat. Periksa koneksimu lalu kirim ulang.";
}

export function ChatWindow({
  sessionId,
  persona,
  initialMessages,
  initialPrompt,
  me,
}: {
  sessionId: string;
  persona: { name: string; avatar_url: string | null; languageName: string | null };
  initialMessages: ChatMsg[];
  initialPrompt?: string;
  me: { name: string | null; avatar_url: string | null };
}) {
  const [messages, setMessages] = useState<ChatMsg[]>(initialMessages);
  const [input, setInput] = useState(initialPrompt ?? "");
  const [busy, setBusy] = useState(false);
  // Id balasan asisten yang sedang menampilkan terjemahan Indonesia.
  const [translated, setTranslated] = useState<Set<string>>(() => new Set());
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mascot = getPersonaMascot(persona.name);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Textarea tumbuh otomatis (maks ±6 baris).
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [input]);

  const setShowTranslation = (id: string, show: boolean) =>
    setTranslated((s) => {
      const next = new Set(s);
      if (show) next.add(id);
      else next.delete(id);
      return next;
    });

  const patch = (id: string, p: Partial<ChatMsg> | ((m: ChatMsg) => Partial<ChatMsg>)) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...(typeof p === "function" ? p(m) : p) } : m)));

  const stream = async (text: string, assistantId: string) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    try {
      if (USE_MOCK_CHAT) {
        for await (const chunk of mockChatStream(text, { name: persona.name, languageName: persona.languageName }, controller.signal)) {
          patch(assistantId, (m) => ({ content: m.content + chunk }));
        }
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, message: text }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) throw new ChatHttpError(res.status);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          patch(assistantId, (m) => ({ content: m.content + chunk }));
        }
      }
      patch(assistantId, { status: undefined });
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        patch(assistantId, (m) => ({ status: undefined, content: m.content || "_(balasan dihentikan)_" }));
      } else {
        patch(assistantId, { status: "error", errorText: friendlyError(err) });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const send = async (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const now = new Date();
    const assistantId = `a-${now.getTime()}`;
    // Optimistic: pesan user langsung tampil.
    setMessages((ms) => [
      ...ms,
      { id: `u-${now.getTime()}`, role: "user", content: text, createdAt: now.toISOString() },
      { id: assistantId, role: "assistant", content: "", createdAt: now.toISOString(), status: "streaming" },
    ]);
    setInput("");
    await stream(text, assistantId);
    inputRef.current?.focus();
  };

  const resend = (assistantId: string) => {
    const idx = messages.findIndex((m) => m.id === assistantId);
    const userMsg = messages
      .slice(0, idx)
      .reverse()
      .find((m) => m.role === "user");
    if (!userMsg) return;
    setShowTranslation(assistantId, false);
    patch(assistantId, { content: "", status: "streaming", errorText: undefined });
    void stream(userMsg.content, assistantId);
  };

  const applyQuickPrompt = (p: string) => {
    if (p.endsWith(": ")) {
      setInput(p);
      inputRef.current?.focus();
    } else void send(p);
  };

  return (
    <div className="flex h-[calc(100dvh-15rem)] min-h-[420px] flex-col overflow-hidden rounded-3xl border-2 bg-card md:h-[calc(100dvh-12.5rem)]">
      {/* Header persona — maskot animasi mengikuti status (mengetik / menyapa) */}
      <div className="flex items-center gap-3 border-b-2 bg-asisten/6 px-4 py-2.5">
        {mascot ? (
          <PersonaMascotAnim m={mascot} busy={busy} size={48} />
        ) : (
          <PersonaAvatar name={persona.name} src={persona.avatar_url} className="size-11 rounded-xl" />
        )}
        <div className="min-w-0">
          <p className="truncate font-extrabold">{persona.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {busy
              ? "sedang mengetik…"
              : persona.languageName
                ? `Teman ngobrol bahasa ${persona.languageName}`
                : "siap ngobrol"}
          </p>
        </div>
      </div>

      <div role="log" aria-live="polite" aria-label={`Percakapan dengan ${persona.name}`} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            {mascot ? (
              <PersonaMascotAnim m={mascot} busy={busy} size={220} />
            ) : (
              <PersonaAvatar name={persona.name} src={persona.avatar_url} className="size-16" />
            )}
            <p className="text-lg font-extrabold">Halo! Aku {persona.name}.</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Tulis apa saja{persona.languageName ? ` tentang bahasa ${persona.languageName}` : ""}, atau mulai dari salah satu ide di bawah.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            // Balasan asisten: teks bahasa daerah + terjemahan tersembunyi (src/lib/bilingual.ts).
            const { original, translation } = isUser
              ? { original: m.content, translation: null }
              : splitBilingual(m.content, m.status === "streaming");
            const canTranslate = !!translation && !m.status;
            const showTranslation = canTranslate && translated.has(m.id);
            return (
              <div key={m.id} className={cn("flex items-end gap-2", isUser && "flex-row-reverse")}>
                {isUser ? (
                  <UserAvatar name={me.name} src={me.avatar_url} className="size-8" />
                ) : (
                  <PersonaAvatar name={persona.name} src={persona.avatar_url} className="size-8 rounded-xl" />
                )}
                <div className={cn("flex max-w-[82%] flex-col gap-1", isUser && "items-end")}>
                  <div
                    className={cn(
                      "rounded-3xl px-4 py-2.5 text-[0.9375rem] leading-relaxed",
                      isUser ? "whitespace-pre-wrap rounded-br-lg bg-primary-600 text-white" : "rounded-bl-lg bg-asisten/12",
                      m.status === "error" && "border-2 border-danger/50 bg-danger/8",
                    )}
                  >
                    <span className="sr-only">{isUser ? "Kamu: " : `${persona.name}: `}</span>
                    {isUser ? (
                      m.content
                    ) : showTranslation ? (
                      <div lang="id">
                        <span className="sr-only">Terjemahan bahasa Indonesia: </span>
                        <MarkdownContent content={translation ?? ""} variant="chat" className="italic" />
                      </div>
                    ) : original ? (
                      <MarkdownContent content={original} variant="chat" />
                    ) : null}
                    {canTranslate ? (
                      <span className="-mb-1 -mr-2 mt-1 flex justify-end">
                        <button
                          type="button"
                          aria-pressed={showTranslation}
                          onClick={() => setShowTranslation(m.id, !showTranslation)}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-asisten hover:bg-asisten/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-asisten"
                        >
                          <Languages aria-hidden="true" className="size-3.5" />
                          {showTranslation ? "Teks asli" : "Terjemahkan"}
                        </button>
                      </span>
                    ) : null}
                    {m.status === "streaming" && !original ? (
                      <span className="inline-flex items-center gap-1 py-1" role="status" aria-label={`${persona.name} sedang mengetik`}>
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="size-2 animate-bounce rounded-full bg-asisten" style={{ animationDelay: `${i * 120}ms` }} />
                        ))}
                      </span>
                    ) : null}
                    {m.status === "error" ? (
                      <span className="mt-2 flex flex-col items-start gap-2 text-sm">
                        <span role="alert" className="font-semibold text-danger-700 dark:text-danger">
                          {m.errorText}
                        </span>
                        <Button size="sm" variant="outline" onClick={() => resend(m.id)} disabled={busy}>
                          <RotateCcw aria-hidden="true" /> Kirim ulang
                        </Button>
                      </span>
                    ) : null}
                  </div>
                  <time dateTime={m.createdAt} className="px-2 text-[0.6875rem] text-muted-foreground">
                    {timeFmt.format(new Date(m.createdAt))}
                  </time>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t-2 bg-background/60 p-3">
        <div role="group" aria-label="Saran pertanyaan" className="scrollbar-none -mx-3 mb-2 flex gap-2 overflow-x-auto px-3">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyQuickPrompt(p)}
              disabled={busy}
              className="shrink-0 rounded-full border-2 bg-card px-3 py-1.5 text-xs font-bold hover:border-asisten/50 hover:bg-asisten/8 disabled:opacity-50"
            >
              {p.replace(/: $/, "…")}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="pesan" className="sr-only">
            Tulis pesan (Enter untuk kirim, Shift+Enter untuk baris baru)
          </label>
          <Textarea
            ref={inputRef}
            id="pesan"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder={`Tulis pesan untuk ${persona.name}…`}
            className="min-h-12 resize-none overflow-y-auto py-2.5"
          />
          {busy ? (
            <Button type="button" variant="outline" size="icon" onClick={() => abortRef.current?.abort()} aria-label="Hentikan balasan">
              <Square className="fill-current" />
            </Button>
          ) : (
            <Button type="submit" variant="asisten" size="icon" disabled={!input.trim()} aria-label="Kirim pesan">
              <SendHorizontal />
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
